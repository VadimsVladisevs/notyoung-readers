# Phase 11 — Data check + cutover

Part of [PLAN.md](PLAN.md). Status: ☐ (drafted 2026-11-01 as the old Phase 7; moved to the end so login and book management ship first)

## Revisit at phase start
Phases 7–10 change parts of this plan. Re-check every step before starting:
- **Login (Phase 7, done):** `ADMIN_PASSWORD_HASH` and the `X-Club-Password` header are gone. The app logs in against prod `users`, and the `admin` document needs `roles: ["ADMIN"]` (step 12). Steps 9 and 13 check the login instead of the header.
- **Images in MongoDB (Phase 10, done in code):** covers are in GridFS; the image has no cover files. Step 4 is now "import covers into prod" (below); the Dockerfile and Vite changes are already done.
- New collections or indexes from Phases 7–10 get created on prod at cutover. List them here:
  - Phase 7: no new collection. The new field `users.admin.roles` is added in step 12.
  - Phase 10: GridFS `fs.files` + `fs.chunks`, filled by `scripts/import-covers.sh` (step 4). No `books` change.

## Goal
Replace the legacy Node service on Render with the new Docker image. It runs against the same Atlas data, with every write protected on the server, and the legacy files are retired. Checks deferred from Phase 6 come first: the browser walk-through on staging, prod counts unchanged, staging isolation and cold-start timing.

## Decisions (2026-11-01)
- **Prod switch in place:** the existing Render service changes runtime Node → Docker (Settings → Build → Source → Docker). The URL, domain and env vars stay the same.
- **Rollback:** branch `legacy` at the last legacy commit on `main` (`36ce2fe` today). Render deploys branches: Source → Node, build `yarn install`, start `node app.js`, branch `legacy`.
- **Staging is deleted after cutover:** the Render service, `render.yaml`, DB `readersDB_staging` and Atlas user `readers-staging`.
- **Local untracked files** (`node_modules/`, `test/`, `.env` at the repo root): the user deletes them. Tracked legacy files: `git rm` one by one.
- **PR merge:** merge commit, so the phase history stays.
- Atlas URIs stay out of the agent transcript. The user runs the commands against Atlas.

## Open items from earlier phases
- The prod login uses the hash in Atlas `users.admin` directly (Phase 7), so the club password stays the same. The step 9 staging login checks it on the copy.
- Prod has a single `progress` book; the local data had 2. Look for duplicate titles too (Phases 4, 6).
- Prod `books` has no unique `title` index, only `_id` (Phase 6). Decide whether to add one after the duplicate check.

## Tasks
- [ ] **1. Sub-plan review** against "Revisit at phase start"; PLAN.md row → ◐.
- [ ] **2. Read-only prod data check (user):** `mongosh` in a `mongo:8.0` container against prod `readersDB`:
  - `books` count per status, and any status outside `new/progress/finished`
  - type/range of `rating` on finished books
  - books missing title/author/tag/createdAt
  - duplicate titles
  - all `image` values, diffed locally against the covers to find missing or orphaned files
  
  The counts are the baseline for "prod unchanged".
- [ ] **3. Isolation check (user):** as `readers-staging`, `use readersDB; db.books.countDocuments()` → `Unauthorized`.
- [ ] **4. Covers into prod (user), before the switch:** `MONGO_URI='<prod URI, no db path>' scripts/import-covers.sh readersDB`. Expect 163 files (more if covers were added through the legacy app since) and "Books whose cover is missing: 0"; a missing one means a legacy file not in `public/images/`. The legacy app is unaffected (it never reads GridFS). Re-run right before the switch if legacy added books meanwhile.
- [ ] **5. Delete legacy files:**
  - `git rm` one by one: `app.js`, `modules/db.js`, `index.html`, `public/css/styles.css`, `public/js/index.js`, `package.json`, `yarn.lock`, `Procfile`, and the 163 `public/images/*.jpg` after step 4 (they live on in GridFS and on branch `legacy`; `scripts/import-covers.sh` reads them, so delete the script too or point it at the `legacy` branch)
  - `rmdir` the empty dirs
  - keep `.nvmrc`, because the frontend uses it
- [ ] **6. Docs:**
  - README: drop the migration banner; add a prod deploy section (Render Docker service, env vars, health `/actuator/health`, rollback)
  - `AGENTS.md`: drop the legacy line
  - `update-ai-docs`
- [ ] **7. Local verify:**
  - `./mvnw verify` and `npm run build && npm test`
  - `docker build` + `docker run -p 8090:8080` against compose Mongo
  - the dev server shows covers (through the backend, from the local GridFS)
- [ ] **8. Commit** `Phase 11 (part 1): …`. **Push** (confirm first); staging redeploys the final image.
- [ ] **9. Staging walk-through (user, guided):** every flow, including the ones Phases 7–10 add:
  - browse all lists and the swiper
  - statistics toggle
  - random pick (`new` only)
  - start, finish with rating, add, delete
  - login and logout from the account menu; logged out, book selection is hidden and writes get 401
  - the edit-mode switch shows and hides the pencils and «Добавить книгу»
  - a phone (or a narrow window): swipe the library, no sideways scroll, big dialogs full-screen
  - covers load
  
  Then re-run the step-2 counts on prod: unchanged. Cold start: idle >15 min, then `curl -w '%{time_total}'` on `/actuator/health` and `/`.
- [ ] **10. Rollback anchor:** push branch `legacy` at the last legacy `main` commit (confirm first).
- [ ] **11. PR to `main`** (`gh pr create`, merge commit). The user merges.
- [ ] **12. Prod switch (user, guided; a few minutes of downtime accepted):**
  1. Check the plan (Free → the 512 MB JVM flags fit) and that the branch is `main`.
  2. Atlas, prod `readersDB` (the user runs it): `db.users.updateOne({username: "admin"}, {$set: {roles: ["ADMIN"]}})`. This is additive, and the legacy app ignores it. If the legacy service has `ADMIN_PASSWORD_HASH` set, remove it.
  3. Settings → Build → Source → Docker, Dockerfile `./Dockerfile`, health check path `/actuator/health`. Remove the Node build/start commands.
  4. Atlas → Database Access → rotate the prod user's password, then update `DB_URL` on Render right away (the old app breaks from this moment).
  5. Deploy.
- [ ] **13. Prod smoke (read-only):**
  - health UP
  - `/` and covers 200
  - `/api/books` counts = baseline
  - auth: writes 401 when logged out; the user logs in as `admin` with the club password
  - one browser look by the user
  - no data writes on prod by the agent
- [ ] **14. Retire staging:**
  - delete the Render service, drop `readersDB_staging`, delete Atlas user `readers-staging`
  - delete `render.yaml`; update the README and docs
  - PLAN.md row ☑, findings, decision log
  - `Phase 11 (part 2)` commit on a short branch → PR to `main`
  - later: the user deletes the `legacy` branch after a stable week

## Findings
*(none yet)*

## Verify
- [ ] Local: backend and frontend tests green; the image serves `/`, covers, API and health.
- [ ] Staging: every flow works on the final image; unauthenticated writes 401; prod counts unchanged; `readers-staging` Unauthorized on `readersDB`; cold start measured.
- [ ] Prod: health UP, counts = baseline, covers load, auth works; the old Atlas password no longer connects.
