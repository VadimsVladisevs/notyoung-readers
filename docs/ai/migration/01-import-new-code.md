# Phase 1 — Import new code

Part of [PLAN.md](PLAN.md). Status: ☐

## Goal
Copy the Spring Boot backend and React UI from `C:\Projects\readers-club` into this repo on `migration/spring-react`, with no secrets, as one import commit. No behaviour changes beyond removing secrets. The legacy app at the repo root stays untouched.

## Tasks
- [ ] Copy into `backend/`: `pom.xml`, `src/` (main + test). Exclude `.idea/`, `target/`, `log/`.
- [ ] Copy into `frontend/`: `ui/package.json`, `ui/package-lock.json`, `ui/tsconfig.json`, `ui/README.md`, `ui/.gitignore` content, `ui/src/`, `ui/public/` **except `ui/public/images/`**. Exclude `node_modules/`, `build/`.
- [ ] Merge ignores into the root `.gitignore`: `backend/target/`, `backend/log/`, `frontend/node_modules/`, `frontend/build/`, `frontend/dist/`, `frontend/coverage/`, `.idea/`, `*.log`, `.env*` (keep existing entries).
- [ ] Strip secrets:
  - `backend/src/main/resources/application.yaml` → no URIs or credentials; `uri: ${DB_URL}` and `database` only (switching to Boot 4's own properties happens in Phase 2).
  - `PasswordService.java` → remove the hash constant; read it from property `readers-club.password-hash` (env `ADMIN_PASSWORD_HASH`). Phase 3 replaces it with BCrypt.
  - `PasswordServiceTests.java` → remove the commented-out string literals.
- [ ] Recommend the user rotate the Atlas password (it sat in plaintext in a local file).
- [ ] One commit: "Import Spring Boot backend and React frontend".

## Verify
- `git grep -nIE "mongodb(\+srv)?://[^$]|SECURE_PASSWORD|password: *[^$ ]"` → no hits under `backend/` and `frontend/`.
- `git status` clean after the commit; `git ls-files backend frontend | grep -E "node_modules|target/|\.idea|/log/"` → empty.
- Legacy files at the root are unchanged (`git diff main --stat -- app.js modules index.html public package.json`).
- (Building is Phase 2/4 — not expected to pass yet.)
