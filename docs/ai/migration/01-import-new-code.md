# Phase 1 — Import new code

Part of [PLAN.md](PLAN.md). Status: ☑

## Goal
Copy the Spring Boot backend and React UI from `C:\Projects\readers-club` into this repo on `migration/spring-react`, with no secrets, as one import commit. No behaviour changes beyond removing secrets. The legacy app at the repo root stays untouched.

## Tasks
- [x] Copy into `backend/`: `pom.xml`, `src/` (main + test). Exclude `.idea/`, `target/`, `log/`.
- [x] Copy into `frontend/`: `ui/package.json`, `ui/package-lock.json`, `ui/tsconfig.json`, `ui/.gitignore`, `ui/src/`, `ui/public/` **except `ui/public/images/`**. Exclude `node_modules/`, `build/`, and `ui/README.md` (unmodified CRA boilerplate).
- [x] Root `.gitignore`:
  - `test` → `/test`. The unanchored entry (meant for the root scratch folder) would have ignored `backend/src/test/**`.
  - Add `backend/target/`, `backend/log/`, `frontend/node_modules/`, `frontend/build/`, `frontend/dist/`, `frontend/coverage/`, `.idea/`, `*.log`, `.env*`.
- [x] Strip secrets:
  - `backend/src/main/resources/application.yaml` → no URLs or credentials at all: `uri: ${DB_URL}` and `database: readersDB` only. Render already provides `DB_URL`; a local default comes with the `dev` profile in Phase 5. Switching to Boot 4's own properties happens in Phase 2.
  - New `configuration/PasswordProperties.java` (`readers-club.password-hash`, env `ADMIN_PASSWORD_HASH`), same style as `DatabaseProperties`. `PasswordService` gets it through its constructor, and the hash constant is removed. Phase 3 replaces this with BCrypt.
  - `PasswordServiceTests.java` → remove the commented-out literals; pass a `PasswordProperties` with a dummy hash.
- [x] Atlas password: it is live. The user rotates it at the end of the migration (Phase 7) and updates `DB_URL` on Render in the same step.
- [x] One commit: "Import Spring Boot backend and React frontend".

## Verify
- `git grep -nIE "mongodb(\+srv)?://[^$]|SECURE_PASSWORD|password: *[^$ ]" -- backend frontend` → no hits.
- `git grep` for the Atlas host and the old hash constant → no hits.
- `git ls-files backend/src/test` lists all 8 test files.
- `git ls-files backend frontend | grep -E "node_modules|target/|\.idea|/log/|images/"` → empty.
- Legacy files at the root are unchanged (`git diff main --stat -- app.js modules index.html public package.json`).
- (Building is Phase 2/4 — not expected to pass yet.)
