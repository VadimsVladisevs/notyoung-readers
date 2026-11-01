# Phase 11 — Data check + cutover

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-11-01) (drafted 2026-11-01 as the old Phase 7; moved to the end so login and book management ship first; started 2026-11-01)

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
- [x] **1. Sub-plan review** against "Revisit at phase start"; PLAN.md row → ◐. Reviewed 2026-11-01: branch clean and pushed at `470bd6d`, `origin/main` (`36ce2fe`) merged in, 163 covers in `public/images/` (includes the November book). The UI commits `d70b7e2` and `470bd6d` came after the Phase 10 staging check, so step 9 is their first staging check.
- [x] **2. Read-only prod data check (user):** done 2026-11-01, see Findings. `mongosh` in a `mongo:8.0` container against prod `readersDB`:
  - `books` count per status, and any status outside `new/progress/finished`
  - type/range of `rating` on finished books
  - books missing title/author/tag/createdAt
  - duplicate titles
  - all `image` values, diffed locally against the covers to find missing or orphaned files
  
  The counts are the baseline for "prod unchanged".
- [x] **3. Isolation check (user):** first run 2026-11-01 failed (count 159); after the role fix `readWrite@readersDB_staging` only, `find` on `readersDB.books` refused. as `readers-staging`, `use readersDB; db.books.countDocuments()` → `Unauthorized`.
- [x] **4. Covers into prod (user), before the switch:** done 2026-11-01: 163 files, 0 missing. `MONGO_URI='<prod URI, no db path>' scripts/import-covers.sh readersDB`. Expect 163 files (more if covers were added through the legacy app since) and "Books whose cover is missing: 0"; a missing one means a legacy file not in `public/images/`. The legacy app is unaffected (it never reads GridFS). Re-run right before the switch if legacy added books meanwhile.
- [x] **5. Delete legacy files:** done 2026-11-01: 9 files + 163 covers `git rm`ed one by one (`git rm` dropped the empty dirs); `scripts/import-covers.sh` deleted too (it is not on `legacy`, which predates it: `git show 470bd6d:scripts/import-covers.sh`).
  - `git rm` one by one: `app.js`, `modules/db.js`, `index.html`, `public/css/styles.css`, `public/js/index.js`, `package.json`, `yarn.lock`, `Procfile`, and the 163 `public/images/*.jpg` after step 4 (they live on in GridFS and on branch `legacy`; `scripts/import-covers.sh` reads them, so delete the script too or point it at the `legacy` branch)
  - `rmdir` the empty dirs
  - keep `.nvmrc`, because the frontend uses it
- [x] **6. Docs:** done 2026-11-01.
  - README: drop the migration banner; add a prod deploy section (Render Docker service, env vars, health `/actuator/health`, rollback)
  - `AGENTS.md`: drop the legacy line
  - `update-ai-docs`
- [x] **7. Local verify:** done 2026-11-01: backend 103 tests green; frontend build green, tests 75/75 (one run had 1 failure while Maven ran in parallel, 4 reruns green: likely a timeout under load); image against compose Mongo: health UP, `/` 200, cover 200 `image/jpeg`, `/api/statistics` 200, logged-out write 401 (403 without the CSRF token), no `.jpg` in the image. Dev-server covers not re-checked (same backend endpoint, Vite proxy unchanged).
  - `./mvnw verify` and `npm run build && npm test`
  - `docker build` + `docker run -p 8090:8080` against compose Mongo
  - the dev server shows covers (through the backend, from the local GridFS)
- [x] **8. Commit** `Phase 11 (part 1): …` (`ea0e48d`, pushed 2026-11-01). **Push** (confirm first); staging redeploys the final image.
- [x] **9. Staging walk-through (user, guided):** walk-through done 2026-11-01 on `ea0e48d`, no bugs found; prod counts re-run = baseline (159: 56/102/1); cold start not measured (first try 0.79 s = still warm; staging is gone): prod startup is ~88 s, so expect ~1.5–2 min on the first visit after 15 min idle; every flow, including the ones Phases 7–10 add:
  - browse all lists and the swiper
  - statistics toggle
  - random pick (`new` only)
  - start, finish with rating, add, delete
  - login and logout from the account menu; logged out, book selection is hidden and writes get 401
  - the edit-mode switch shows and hides the pencils and «Добавить книгу»
  - a phone (or a narrow window): swipe the library, no sideways scroll, big dialogs full-screen
  - library search and status chips, «Показать ещё», «Читать дальше», «Наверх»; statistics opens (its chunk loads)
  - covers load
  
  Then re-run the step-2 counts on prod: unchanged. Cold start: idle >15 min, then `curl -w '%{time_total}'` on `/actuator/health` and `/`.
- [x] **10. Rollback anchor:** pushed 2026-11-01, `legacy` = `36ce2fe`. push branch `legacy` at the last legacy `main` commit (confirm first).
- [x] **11. PR to `main`** opened 2026-11-01: #3; merge only with prod Auto-Deploy off, right before the runtime switch (step 12). (`gh pr create`, merge commit). The user merges.
- [x] **12. Prod switch (user, guided; a few minutes of downtime accepted):** done 2026-11-01; Atlas password rotated, `DB_URL` updated, Auto-Deploy back on. Startup on Free: ~88 s (`Started ReadersClub in 87.792 seconds`). the service keeps `notyoung-reader.onrender.com` (no custom domain, so a new service would get a new address). Prod today (checked 2026-11-01): env only `DB_URL`, build `yarn`, start `nodemon app.js`. The runtime is changed in the Source dialog, which deploys right away, so `main` must already have the new app.
  1. ✔ (steps 1–4 done 2026-11-01, roles set: matched 1, modified 1) Render prod service: **Auto-Deploy → Off**, so merging doesn't start a failing `yarn` build. Check the plan (Free → the 512 MB JVM flags fit).
  2. Atlas, prod `readersDB` (the user runs it): `db.users.updateOne({username: "admin"}, {$set: {roles: ["ADMIN"]}})`. Additive; the legacy app ignores it.
  3. Merge PR #3 (merge commit). Prod keeps running the old app.
  4. Settings → Build → Source → **Edit**: same repo, branch `main`, runtime **Docker** → Deploy. Then Dockerfile path `./Dockerfile`, Docker Command **empty** (no `nodemon app.js` left over), health check path `/actuator/health`.
  5. Agent smoke (step 13) on the current `DB_URL`. Done 2026-11-01 on merge `50dabe6`: UP ~105 s after the merge; `/` 200; 159 books = baseline (56/102/1), string ratings served as numbers; 159/159 covers 200; statistics 200; logged out `/api/auth/me` and a write → 401; legacy `/books` 404.
  6. Atlas → Database Access → rotate the prod user's password → update `DB_URL` on Render (redeploys) → smoke again.
  7. Auto-Deploy back **On**.
- [x] **13. Prod smoke (read-only):** done 2026-11-01 before and after the rotation (same results); the user logged in as `admin` in the browser.
  - health UP
  - `/` and covers 200
  - `/api/books` counts = baseline
  - auth: writes 401 when logged out; the user logs in as `admin` with the club password
  - one browser look by the user
  - no data writes on prod by the agent
- [x] **14. Retire staging:** done 2026-11-01 (service, `readersDB_staging`, `readers-staging` deleted by the user; `render.yaml` and docs in `Phase 11 (part 2)`).
  - delete the Render service, drop `readersDB_staging`, delete Atlas user `readers-staging`
  - delete `render.yaml`; update the README and docs
  - PLAN.md row ☑, findings, decision log
  - `Phase 11 (part 2)` commit on a short branch → PR to `main`
  - later: the user deletes the `legacy` branch after a stable week

## Findings
- **Prod baseline (step 2, 2026-11-01):** `books` 159 = finished 56 + new 102 + progress 1; no bad status; title/author/tag/wiki/image never missing; `createdAt` missing on 83 (legacy books, no impact: nothing sorts or reads it); indexes `_id_` only; `users` = `admin` without `roles`; GridFS empty.
- **Ratings:** finished books have 48 double, 6 int and 2 **string** (`"5.7"`, `"7.67"`). Spring's converter reads the strings into `Double`, and staging (a copy of prod) has shown them since Phase 6. A rewrite through the app (edit/finish) stores a double. Statistics counts tags only, so ratings don't affect it. No data fix needed.
- **Covers:** the 159 books use 159 distinct `image` values, and every one has a file in `public/images/`. The repo has 4 orphans (`club-foto.jpg`, `rushdi-deti.jpg.jpg`, `stejnbek-vostok.jpg`, `ukio-hram.jpg`). The import puts them into GridFS too (harmless, served only by name), so expect 163 files.
- **Staging isolation (step 3):** `readers-staging` could read prod `readersDB` (count 159). Fix: Atlas Database Access → that user gets only `readWrite@readersDB_staging`, no built-in role. Fixed 2026-11-01 and re-checked: refused.
- **Duplicate titles:** «Старик и море» ×2 and «Бабушка велела кланяться и передать, что просит прощения» ×2, each pair with different covers (`ernest-more`/`ernest-starik-i-more`, `bakman-babushka`/`bakman-babuska`), so they look like accidental double entries. A unique `title` index would fail on them, so none is added. The admin can delete the extra copy in the new UI after cutover if the club wants.

## Verify
- [x] Local: backend and frontend tests green; the image serves `/`, covers, API and health.
- [x] Staging: every flow works on the final image; unauthenticated writes 401; prod counts unchanged; `readers-staging` Unauthorized on `readersDB`. Cold start not measured (see step 9).
- [x] Prod: health UP, counts = baseline, covers load, auth works (user logged in after the rotation). Old Atlas password rejected: not confirmed by the user yet.
