# Phase 6 — Packaging + Render staging

Part of [PLAN.md](PLAN.md). Status: ◐

## Goal
Package backend + frontend into **one Docker image** (Spring Boot serves the built SPA and the covers) and run it as a **separate Render staging service** on a **copy** of the Atlas data. Every flow gets checked on real infrastructure before cutover (Phase 7). Prod (`main`, legacy Node service) stays untouched.

## Decisions (2026-10-31)
- **Staging DB:** same Atlas cluster, new database `readersDB_staging` (dump of `readersDB`, restored with a renamed namespace). A separate Atlas user may only access `readersDB_staging`, so staging can't write to prod.
- **DB name configurable:** `application.yaml` `database: ${DB_NAME:readersDB}`. Prod needs no change; staging sets `DB_NAME=readersDB_staging`.
- **Render plan: Free** (512 MB, sleeps after 15 min idle). JVM flags tuned for 512 MB; cold start measured.
- **Covers:** the Dockerfile copies repo-root `public/images` into the build output. No file moves; Phase 7 moves them and simplifies that line.
- **Render setup:** `render.yaml` Blueprint for the staging service only; the user applies it in the dashboard.
- **No SPA fallback:** the UI has no client-side router (one page at `/`), and Spring serves `static/index.html` at `/`.
- **No tests inside `docker build`** (`-DskipTests`): Testcontainers needs Docker in the build. `./mvnw verify` and `npm test` run locally before each push.

## Tasks
- [x] **1. Sub-plan + PLAN.md row** → ◐; decision-log row.
- [x] **2. Backend:** actuator (health only, no details); `DB_NAME`; test that only health is exposed.
- [x] **3. `Dockerfile` + `.dockerignore`** (Node → Maven → JRE, Render memory flags, non-root).
- [x] **4. `render.yaml`** for `readers-club-staging`.
- [x] **5. Local image check** against the compose Mongo.
- [◐] **6. Atlas staging DB** (user runs the commands): Atlas version; dump → restore as `readersDB_staging`; counts; staging user; Network Access.
- [ ] **7. Push + Blueprint** (confirm before pushing); env vars entered in the dashboard.
- [ ] **8. Staging walk-through**; `update-ai-docs`; short README deploy note; PLAN.md row ☑.

## Findings
- **Local image (2026-10-31):** builds in ~2 min from scratch; image 593 MB (JRE + jar + 24 MB covers). Starts in ~13 s on the dev machine; ~180 MiB used of a 512 MiB limit at idle. Runs as non-root `app`. Render Free has far less CPU, so expect a much slower cold start there.
- **Port 8080 can't be bound by Docker on the dev machine** (no listener; likely a Windows reserved port range). Local checks map `-p 8090:8080`. Inside the container and on Render the app still listens on `PORT`/8080.
- **`DB_NAME`** switches the database even when `DB_URL` has a path (`spring.mongodb.database` wins). Reads on a missing DB return `[]` and don't create it.
- **Atlas runs MongoDB 8.0.36** (checked 2026-10-31): matches Testcontainers and compose `mongo:8.0`. Closes the open item from Phases 2 and 5.
- **Staging DB copied (2026-10-31):** `mongodump` of prod `readersDB` → `mongorestore --nsFrom 'readersDB.*' --nsTo 'readersDB_staging.*'`, 295 docs, 0 failures. `books` 159 = 159; also `books_copy` 135 (old leftover) and `users` 1. The archive (it contains the admin bcrypt hash) is in the user's home folder, not the repo.
- **Prod `books` has no indexes** besides `_id`: the unique `title` index the legacy Mongoose schema declares was never created on Atlas. Only `users.username_1` exists. Input for Phase 7's data check.
- Health shows only `{"status":"UP"}` (plus the liveness/readiness group names); `/actuator/env` and other endpoints → 404.

## Verify
- [x] `./mvnw verify` (122) and `npm run build && npm test` green.
- [x] `docker build -t readers-club .` succeeds; image size noted.
- [x] `docker run --memory=512m` against the compose Mongo: `/` serves the React page, a cover `/images/<x>.jpg` 200, `/api/books` lists the books, `/actuator/health` UP, `check-password` 401 without / 200 with the password; memory well under 512 MB; startup time noted.
- [ ] Staging: deploy healthy; every flow (browse, statistics, random pick, start, finish with rating, add, delete) works against `readersDB_staging`; writes 401 with a wrong password; prod `readersDB` counts unchanged; cold start after sleep measured.
