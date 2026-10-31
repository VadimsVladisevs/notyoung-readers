# Workflow

## Environment (Windows 11 dev machine)
- **Shells:** use Git Bash for `./mvnw`. `mvnw.cmd` breaks on the `'` in the `Reader's Club` path. PowerShell is fine for Windows-specific checks.
- **JDK:** Eclipse Temurin 25 (OpenJDK, never Oracle). A user-level `JAVA_HOME` points to it; old Oracle JDKs are still installed but not on `JAVA_HOME`.
- **Docker Desktop:** needed for backend tests (Testcontainers), later for the image (Phase 6) and the local Mongo (Phase 5).
- **Local MongoDB:** today a Windows service (5.0, `localhost:27017`, database `readersDB`, real-looking club data). Phase 5 moves it into Docker Compose.
- **Node:** version in `.nvmrc` (legacy app).
- **Line endings:** `core.autocrlf=true`; `.gitattributes` keeps `backend/mvnw` LF. Git's "LF will be replaced by CRLF" warnings are expected.

## Commands
| Task | Command |
|---|---|
| Backend build + all tests | `cd backend && ./mvnw verify` |
| Backend compile only | `./mvnw -q compile` |
| Run backend against local Mongo | `ADMIN_PASSWORD_HASH='<bcrypt hash>' ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` → `http://localhost:8080/api/books`. Single quotes: the hash contains `$`. Test hash for password `club-secret`: `$2a$04$abDVDCCBrxHefMnW2MlYw.Ur41qnEcwu6CCGLV4vkwsv4/3RJ0eqK` (from `IntegrationTest`) |
| Try a protected write | `curl -X POST -H "X-Club-Password: club-secret" localhost:8080/api/check-password` → 200 (401 without the header) |
| Frontend | see [frontend.md](frontend.md) |
| Legacy app | `node app.js` → `http://localhost:3000` (needs `DB_URL` in root `.env`, gitignored) |

When you start the backend in the background, stop it afterwards and check that port 8080 is free. Writes against the local Mongo change real-looking data; prefer read-only checks or tests.

## Git
- Work on `migration/spring-react`; `main` is what production deploys. Commit only when the user asks.
- Commit subject: `Phase N (part k): <summary>` for plan work; body lists the changes as bullets.
- Never commit secrets (`.env*` is ignored). The Atlas password in an old local file is live and gets rotated at cutover.
- Deleting directories: remove files one by one, then `rmdir` the empty directory. No recursive force-delete.

## Migration plan upkeep
`docs/ai/migration/PLAN.md` is the master plan: a phase table (☐ / ◐ / ☑) and a **decision log**. Each phase gets a sub-plan `0N-<name>.md` with tasks, progress and its own verify steps.
- When a phase starts: write its sub-plan in detail and set the row to ◐.
- During it: tick tasks and record non-obvious findings in the sub-plan.
- Each decision the user makes → a dated decision-log row.
- Mark ☑ only after the sub-plan's verify steps pass.
