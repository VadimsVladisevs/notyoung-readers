# Readers Club: migrating from Node.js to Spring Boot + React

Main migration plan. Update the status column at the end of each phase.
Status: ☐ not started · ◐ in progress · ☑ done

## Context
The live site ("НЕЮНЫЙ ЧИТАТЕЛЬ", notyoung-readers repo, hosted on Render, MongoDB Atlas) is:
- an Express 5 app (`app.js`, `modules/db.js`)
- one static jQuery page (`index.html`, `public/js/index.js`)
- 163 covers in `public/images/`

Problems with the live site:
- No server-side auth: anyone can call `/finish`, `/start`, `/addbook`, `/deletebook` and `/createuser`.
- No validation on `rating` or `status`.
- Dead dependencies: ejs, browserify, uniq and the npm `https` placeholder package.
- No tests and no `render.yaml`. The only deploy file is a leftover Heroku `Procfile`.

A rewrite is in progress at `C:\Projects\readers-club`:
- **Backend:** Spring Boot 4.0.3 on Java 25 with Maven and Lombok. REST API under `/api/books`, `/api/statistics` and `/api/check-password`.
- **UI:** CRA, TypeScript, React 18, MUI 6, Swiper 11 and Chart.js 4. Covers the whole public page.
- **Git:** no commits, no remote, and nothing built since the upgrade to Boot 4.
- **Missing:** packaging, env config, a Maven wrapper and real security.

**Outcome:** one Docker image (Spring Boot serving the Vite-built React app) on Render. It reads and writes the existing Atlas data unchanged, with every write endpoint protected on the server.

## Key findings that shape the plan
- **Schemas match.** Both apps use the `books` collection with title, author, image, tag, status (`new`/`progress`/`finished`), wiki, rating, createdAt and updatedAt. The new app stores status as lowercase strings, so **no data migration should be needed**. Phase 6 checks this against prod data.
- **Admin password.** The old app compares against the bcrypt hash of the `admin` user in `users`. The new `PasswordService` uses a hard-coded PBKDF2-SHA1 hash with a fixed salt, which will be replaced. Reuse the existing bcrypt hash (from `users` or env `ADMIN_PASSWORD_HASH`) so the club's password doesn't change. *(Done in Phase 3: bcrypt from env `ADMIN_PASSWORD_HASH`.)*
- **Secrets in source.** The new `application.yaml` has a commented-out Atlas URI with credentials, and `PasswordService.java` contains a hash. Strip both before committing; rotate the Atlas password.
- **Spring Boot 4 Mongo properties.** Boot 4 moved them to `spring.mongodb.*`, but `DatabaseProperties` still binds `spring.data.mongodb.*`. Switch to Boot's auto-config, using env `DB_URL` as today.
- **CRA is deprecated** and conflicts with the installed TypeScript 5.9. Move to Vite and Vitest.
- **Known bugs:**
  - `BookService.updateAndSave` drops `createdAt`.
  - Random pick on an empty list throws.
  - Every exception returns 400.
  - The UI sends rating 0, which fails `@Min(1)`.
  - `BookStatusTypeSubSetValidator` accepts any value.
  - `spring-boot-starter-test` is missing its test scope.
  - No `spring-boot-maven-plugin`.
  - UI "random pick" picks from all books, not only `new` (found in Phase 0).
  - UI starts a book without any password when no book is in progress (found in Phase 0).

## Repo layout on the branch
Branch: `migration/spring-react`. The legacy Node app stays at the repo root until cutover (phase 11), so `main` and the Render deploy are untouched.
```
backend/        <- C:\Projects\readers-club (pom.xml, src/) + Maven wrapper
frontend/       <- C:\Projects\readers-club\ui (Vite)
docs/ai/        <- analysis + plans
Dockerfile, render.yaml
```
Cover images: `public/images/` from this repo is the single source; move it into `frontend/public/images/` at cutover, unless Phase 10 has already moved the covers into MongoDB.

## Phases
Each phase has a sub-plan `0N-<name>.md`, written in detail when the phase starts.

| # | Status | Sub-plan | Scope | Done when |
|---|---|---|---|---|
| 0 | ☑ | [00-setup-and-analysis.md](00-setup-and-analysis.md) | Branch, legacy + new-version analysis, ADR-001, this PLAN.md, delete stray `@` | Docs committed on the branch |
| 1 | ☑ | [01-import-new-code.md](01-import-new-code.md) | Copy backend → `backend/`, UI → `frontend/` (no node_modules, target, build, log, .idea). Merge `.gitignore`. Strip secrets. One import commit | Nothing broken; `git grep` finds no secrets |
| 2 | ☑ | [02-backend-upgrade.md](02-backend-upgrade.md) | Maven wrapper; latest stable Boot 4.x / Java LTS; `spring-boot-maven-plugin`; fix scopes; env-only config (`DB_URL`, `PORT`), `dev`/`prod` profiles; fix bugs; 404s and business exceptions; Testcontainers + MockMvc tests | `./mvnw verify` green; runs against local Mongo |
| 3 | ☑ | [03-server-auth.md](03-server-auth.md) | Spring Security: GET/HEAD `/api/**` public; every other `/api/**` request needs the club password in header `X-Club-Password` (BCrypt, existing hash from env `ADMIN_PASSWORD_HASH`); `/api/check-password` uses the same header (401 if wrong); no CORS (dev proxy, same-origin prod); stateless, no CSRF | Tests prove writes 401 without password, succeed with it |
| 4 | ☑ | [04-frontend-vite.md](04-frontend-vite.md) | CRA → Vite + Vitest; upgrade React 19.x, MUI, Swiper, Chart.js; `InputProps`→`slotProps`; `@import` order; send password on writes; fix rating-0; remove unused dialogs; fix manifest; real component tests (Vitest + React Testing Library + MSW: `api.ts` password header / rating / empty DELETE body, `books-context` split, approval dialog, selection dialog search + checkboxes + random, statistics toggle, `App` smoke render); parity check vs old `index.html` | `npm run build` + `npm test` green; parity checklist ticked |
| 5 | ☑ | [05-local-dev-setup.md](05-local-dev-setup.md) | Local dev setup with **MongoDB in Docker** (started only when needed). Root `compose.yaml`: `mongo:8.0`, `127.0.0.1:27017`, named volume for data. Move today's data from the Windows `MongoDB` 5.0 service (`readersDB`) into the container with `mongodump`/`mongorestore` from the `mongo` images (no local tools needed); verify counts; then set the Windows service to **Manual** (uninstall later once verified). `dev` profile defaults to `mongodb://localhost:27017/readersDB` and the test password hash; `spring-boot:run` uses `dev` by default. Run backend (`./mvnw spring-boot:run`) + frontend (Vite dev server, `/api` proxy → `:8080`). Root `README.md`: prerequisites (JDK, Node, Docker Desktop), `docker compose up -d` / `stop`, run and test steps | A fresh clone runs locally by following only the README; Windows Mongo service no longer starts at boot; all flows work against the containerised Mongo |
| 6 | ☑ | [06-packaging-staging.md](06-packaging-staging.md) | Multi-stage Dockerfile (Node → Maven → JRE, Render memory flags); actuator health; `render.yaml` Blueprint; separate Render Free staging service against `readersDB_staging`, a copy of the Atlas DB on the same cluster | Staging URL serves the site; read-only checks pass (browser flows → Phase 11) |
| 7 | ☑ | [07-login.md](07-login.md) | Admin login/session with roles, replacing the per-request password. **Remove the `X-Club-Password` header auth** (package `org.readersclub.security`'s `ClubPasswordFilter`, the frontend header, and `/api/check-password` if nothing else uses it). Login page and logged-in state in the UI. Writes are allowed for the logged-in user by role, e.g. a role that may update the current book (start/finish). Design discussed at phase start | Header auth gone; writes need a logged-in user with the right role |
| 8 | ☑ | [08-add-book.md](08-add-book.md) | Adding a book from the UI, for logged-in users only; build the add form (none exists since Phase 4); cover optional with a placeholder until Phase 10; `wiki` required | A logged-in user adds a book from the UI; anonymous adds are refused |
| 9 | ☑ | [09-edit-book.md](09-edit-book.md) | Edit an existing book (title, author, tag, wiki, status, rating; cover in Phase 10) and delete it from the UI, admin only; backend update endpoint with validation | A logged-in admin edits and deletes a book; anonymous and non-ADMIN requests are refused |
| 10 | ◐ | [10-images-in-db.md](10-images-in-db.md) | Move cover images from the file system into MongoDB (likely GridFS; details to discuss). One-off import script for `images/*`; image endpoint (e.g. `GET /api/images/{id}`) with cache headers; book `image` field → reference; upload in add/edit book (logged-in); remove `images/` from the repo/Docker image | All covers served from the DB; no image files in the image; Atlas storage within limits |
| 11 | ☐ | [11-data-check-cutover.md](11-data-check-cutover.md) | **Before cutover: browser walk-through of every flow on staging, prod `readersDB` counts unchanged, `readers-staging` can't read `readersDB`, cold-start timing (deferred from Phase 6).** Read-only prod data check; move images (if still files); delete legacy Node files one at a time; update README (deploy section, remove legacy notes); PR to `main`; user switches prod Render service to Docker in place (guided); rollback via branch `legacy`; **user rotates the Atlas password and updates `DB_URL` on Render in the same step**; then staging is deleted | Prod runs the new app; old one retired |

## Verification (overall)
- **Backend:** `./mvnw verify` (unit, MockMvc, Testcontainers).
- **Frontend:** `npm run build` and `npm test` (Vitest).
- **End to end:** `docker build` + `docker run -e DB_URL=...` against a local Mongo seeded from a prod dump; every flow in the browser; writes fail without the password and succeed with it.
- **Staging:** same checklist on the Render staging service before cutover.
- A phase is marked ☑ only after its sub-plan's checks pass.

## Decision log
| Date | Decision |
|---|---|
| 2026-10-31 | Keep Spring Boot + React (see `docs/ai/adr-001-tech-stack.md`). |
| 2026-10-31 | Work on branch `migration/spring-react` in this repo; legacy app stays until cutover. |
| 2026-10-31 | Protect writes with the shared club password, checked server-side; login page later (phase 9). |
| 2026-10-31 | Phase 0: delete stray `@` (old package.json backup); concise analysis docs; review then one commit. |
| 2026-10-31 | Store cover images in MongoDB instead of the file system — new phase 8, after cutover so the migration ships with today's files first. Design (GridFS vs. binary field, resizing, caching) to be discussed when the phase starts. Current set: 163 files, ~24 MB, largest ~1.6 MB. |
| 2026-10-31 | New phase 5: local dev setup on the existing local MongoDB + root `README.md` with run instructions. Placed after the backend (2–3) and frontend (4) work so it documents the final dev commands; later phases renumbered (staging 6, cutover 7, images 8, login 9). Note: Docker is not installed on the dev machine — needed for Testcontainers (phase 2) and the Dockerfile (phase 6); decide then (install Docker Desktop, or run tests against the local Mongo). |
| 2026-10-31 | Docker: user installs Docker Desktop (free for this personal project) — unblocks Testcontainers (phase 2) and the Dockerfile (phase 6). Local MongoDB moves from the always-on Windows service (5.0) into a Docker Compose container started on demand (phase 5). |
| 2026-10-31 | Phase 1: root `.gitignore` `test` → `/test` (it would have hidden `backend/src/test`). No DB URLs in `application.yaml`, only `${DB_URL}` (Render already sets it). Password hash moves to a `PasswordProperties` class (`readers-club.password-hash`, env `ADMIN_PASSWORD_HASH`). The Atlas password in the old local file is live; the user rotates it at cutover (phase 7). |
| 2026-10-31 | Phase 2: JDK is Eclipse Temurin 25 (OpenJDK, not Oracle); Boot 4.1.2 (latest stable). Errors use Spring `ProblemDetail`. Random pick with no ids → `new` only, fixed on the backend. More tests: MockMvc for every endpoint + persistence + unit; frontend tests go to Phase 4 (after Vitest). Use `./mvnw` from Git Bash (`mvnw.cmd` breaks on the `'` in the repo path). Docker needs SVM enabled in the BIOS before Testcontainers can run. |
| 2026-10-31 | Phase 2 done. Errors as `ProblemDetail`: 404 not found, 400 validation/status/password, 409 wrong start/finish, 500 generic (logged, no detail leaked). Domain exceptions unchecked. No `application-prod.yaml`: the base config has no defaults and is the prod config; `dev` defaults `DB_URL` to the local Mongo. Tests use Testcontainers `mongo:8.0`, assuming Atlas is on 8.0; confirm before cutover. |
| 2026-10-31 | Phase 3: password in custom header `X-Club-Password` (no HTTP Basic popup); bcrypt hash from env `ADMIN_PASSWORD_HASH`, copied once from Atlas `users.admin` (new app never reads `users`); `check-password` uses the header and returns 401 when wrong; no CORS at all instead of "dev origins only" (dev proxy + same-origin prod); no rate limit yet, failed attempts logged; rate limiting later. |
| 2026-10-31 | Phase 9: once login exists, remove the `X-Club-Password` header auth; writes are allowed for logged-in users by role (e.g. a role that may update the current book). |
| 2026-10-31 | Phase 4: password asked every time in the approval dialog (no storage); start-with-no-current-book is out of scope (the club always has a current book); dev covers via a dev-only Vite plugin serving `../public/images` until cutover; remove the unused dialogs, no-op context/hook code and CRA leftovers, keep API methods matching real endpoints. |
| 2026-10-31 | Phase 5: compose `mongo:8.0` (Atlas version to confirm in Phase 7); `dev` profile defaults `ADMIN_PASSWORD_HASH` to the test hash (`club-secret`), env overrides, no env-file template; `./mvnw spring-boot:run` runs `dev` by default; no Atlas seed (Phase 7 dumps prod); data moved via a copy of the 5.0 data dir + temporary `mongo:5.0` container, because the service binds `127.0.0.1` only. |
| 2026-10-31 | Phase 6: staging DB `readersDB_staging` on the same Atlas cluster with its own user (that DB only); DB name from env `DB_NAME` (default `readersDB`); Render **Free** plan (512 MB JVM flags, cold starts accepted); the Dockerfile copies repo-root `public/images` until Phase 7 moves them; `render.yaml` Blueprint for staging only; no SPA fallback (no client-side router); no tests inside `docker build`. |
| 2026-10-31 | Phase 6 done: staging live at `readers-club-staging.onrender.com`, read-only checks pass. The user tests all flows in the browser at the end, after planned enhancements, so the staging walk-through, prod-unchanged check and cold-start timing move to Phase 7 (before cutover). |
| 2026-10-31 | Atlas runs MongoDB **8.0.36** (checked in Phase 6). It matches Testcontainers and compose `mongo:8.0`, so the "confirm the Atlas version" items in the Phase 2 and 5 entries are closed. |
| 2026-11-01 | **Phases reordered: features before cutover.** The user wants login and book management on the new stack before prod moves to it. New order: 7 login (was 9), 8 add book (new), 9 edit book (new), 10 images in DB (was 8, now before cutover so prod ships with covers in the DB), 11 data check + cutover (was 7). Older decision-log rows and the done sub-plans 00–06 keep the old numbers as history: old 7 = 11, old 8 = 10, old 9 = 7. Prod stays on the legacy app until Phase 11; staging is the test bed for every phase. |
| 2026-11-01 | Cutover (Phase 11, drafted in `11-data-check-cutover.md`): switch the existing prod Render service Node → Docker in place; rollback via branch `legacy` at the last legacy `main` commit; delete staging (service, `render.yaml`, `readersDB_staging`, user `readers-staging`) after cutover; the user deletes untracked local legacy leftovers (`node_modules/`, `test/`, `.env`). The plan gets revisited at phase start, since Phases 7–10 change parts of it. |
| 2026-11-01 | Phase 7 design: one shared `admin` account from Mongo `users` (today's club password), role ADMIN in a new `roles` field, server session cookie + CSRF (`csrf.spa()`), `/api/auth/login`, `/logout`, `/me`, login dialog from the app bar (no router); book selection hidden when logged out; header auth, `check-password` and `ADMIN_PASSWORD_HASH` removed. |
| 2026-11-01 | Phase 7: local compose `users.admin` (real club password, no roles) gets `roles: ["ADMIN"]` on the local DB only; the dev seed creates `admin` / `club-secret` only when there's no `admin` (fresh volumes). |
| 2026-11-01 | Phase 8 design: add-book dialog from the app bar, logged in only; cover optional (placeholder, no cover field until Phase 10 upload); `wiki` (description text) required and not blank on new books, legacy books untouched; title/author/tag/wiki `@NotBlank` and trimmed; tag free text with suggestions from existing tags. |
| 2026-11-01 | Phase 9 design: admin only (ADMIN role, pencil shown when `isAdmin`); pencil on the current book, swiper cards and finished books opens one edit dialog; no cover field (Phase 10); status editable, a second `progress` → 409; rating required only for `finished`, cleared otherwise; delete inside the edit dialog with a confirmation step; wiki required on edit. |
| 2026-11-01 | Phase 10 design: covers in **GridFS**, `image` stays the path `images/<name>` served at the same URL (no data migration, rollback unaffected); JPEG only, ≤ 2 MB, no resizing; drag-and-drop upload in the add and edit dialogs; server-generated name `<author>-<title>.jpeg` (transliterated slug, `-2` on collision), regenerated on every upload, old file deleted; `no-cache` + ETag; import of the 163 files with `mongofiles` from the `mongo:8.0` image; `image` removed from the create DTO. |
