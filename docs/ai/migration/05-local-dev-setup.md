# Phase 5 — Local dev setup: MongoDB in Docker + README

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-10-31)

## Goal
Move local dev off the always-on Windows `MongoDB` 5.0.8 service (Automatic, `127.0.0.1:27017`, data in `C:\Program Files\MongoDB\Server\5.0\data`, DB `readersDB`) onto a Docker Compose container that runs only when started. The backend should start with no setup, and a root `README.md` should be enough to set up a fresh clone.

## Decisions (2026-10-31)
- **Image `mongo:8.0`**, the same as Testcontainers. The Atlas version isn't confirmed yet; check it in Phase 7.
- **Dev password hash default:** `application-dev.yaml` defaults `ADMIN_PASSWORD_HASH` to the test hash for `club-secret`. The env var overrides it. There are no env files or templates.
- **`./mvnw spring-boot:run` uses the `dev` profile by default** (spring-boot-maven-plugin config). The packaged jar and Docker image are unaffected.
- **No Atlas seed** in this phase. Phase 7's data check dumps prod.
- **Data move through a copy of the data files:** the service binds `127.0.0.1` only, so a container can't reliably reach it. The service is stopped, the data dir is copied, a temporary `mongo:5.0` runs on the copy, `mongodump` → `mongorestore` into the compose container. The original data dir isn't touched. The dump stays outside the repo.

## Tasks
- [x] **1. Sub-plan + PLAN.md row** → ◐; decision-log row.
- [x] **2. `compose.yaml`** at repo root: `mongo:8.0`, `127.0.0.1:27017`, named volume, healthcheck, no auth.
- [x] **3. Backend dev config:** dev default for the password hash; `dev` profile for `spring-boot:run`.
- [x] **4. Data move** 5.0 service → container; counts match; service → Manual.
- [x] **5. Root `README.md`:** prerequisites, Mongo, backend, frontend, tests.
- [x] **6. Docs:** `update-ai-docs`; PLAN.md row ☑.

## Findings
- **The service binds `127.0.0.1`**, so containers can't reach it. The data moved through a copy of the data dir (taken with the service stopped) and a temporary `mongo:5.0` container. WiredTiger recovery on the Windows bind mount took about 40 s before it accepted connections.
- **What moved:** `readersDB` only, i.e. `books` 9, `books_copy` 6, `users` 1. Counts and indexes are the same in 5.0 and 8.0 (`users` keeps the unique `username_1`). `books_copy` is an old leftover that the app doesn't use. The dump (`readersDB.archive`) and the data-dir copy are in the session scratchpad, not the repo.
- **Not moved:** the old data dir also has unrelated databases (`blogDB`, `fruitsDB`, `shopDB`, `todolistDB`, `userDB`, `wikiDB`). Dump them before uninstalling the Windows service, if they matter.
- **Compose project name pinned** (`name: readersclub`). Without it, the volume name comes from the folder name, so a clone in another folder would start with an empty DB. Found during the fresh-clone walk-through.
- A bcrypt default with `$` works inside a quoted `${ADMIN_PASSWORD_HASH:...}` placeholder; no extra property needed.
- Testcontainers maps a random port, so `./mvnw verify` runs fine while the compose Mongo holds 27017.

## Verify
- [x] `docker compose up -d` → healthy; collection counts match the old service.
- [x] Windows service stopped: `./mvnw spring-boot:run` (no env vars) serves `GET /api/books` with the migrated data; `check-password` with `X-Club-Password: club-secret` → 200, without → 401.
- [x] `npm run dev`: page 200, covers 200, `/api/books` (9) and `check-password` through the proxy. No write flow run against the local data; finish/start are covered by tests and Phase 4's walk-through.
- [x] `./mvnw verify` (64 tests) and `npm test` (19) green.
- [x] `Get-Service MongoDB` → StartType Manual.
- [x] README followed as written in a temp folder with the tracked + new files (no `node_modules`/`target`): compose → same volume; `spring-boot:run` with no env vars; `npm ci && npm run dev`; all checks above pass.
