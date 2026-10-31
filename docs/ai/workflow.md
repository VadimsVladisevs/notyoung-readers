# Workflow

## Environment (Windows 11 dev machine)
- **Shells:** use Git Bash for `./mvnw`. `mvnw.cmd` breaks on the `'` in the `Reader's Club` path. PowerShell is fine for Windows-specific checks.
- **JDK:** Eclipse Temurin 25 (OpenJDK, never Oracle). A user-level `JAVA_HOME` points to it; old Oracle JDKs are still installed but not on `JAVA_HOME`.
- **Docker Desktop:** needed for backend tests (Testcontainers), the local Mongo and the app image. Docker can't bind host port **8080** on this machine (likely a Windows reserved port range, no listener), so map the container to `8090`.
- **Local MongoDB:** Docker Compose service `mongo` (`compose.yaml`, `mongo:8.0`, `127.0.0.1:27017`, database `readersDB`, real-looking club data restored from the old service). The compose project name is fixed (`readersclub`), so every clone shares the volume `readersclub_mongo-data`. The old Windows service `MongoDB` (5.0) is stopped and set to **Manual**. Don't start it while compose runs, because both use port 27017. Its data dir also holds unrelated databases (`blogDB`, `shopDB`, …) that were not migrated.
- **Node:** 24, version in `.nvmrc` (24.14.1). Used by the legacy app and `frontend/` (`engines` ≥ 24).
- **Line endings:** `core.autocrlf=true`; `.gitattributes` keeps `backend/mvnw` LF. Git's "LF will be replaced by CRLF" warnings are expected.

## Commands
| Task | Command |
|---|---|
| Backend build + all tests | `cd backend && ./mvnw verify` |
| Backend compile only | `./mvnw -q compile` |
| Local Mongo | `docker compose up -d --wait` / `docker compose stop` (repo root) |
| Run backend against local Mongo | `cd backend && ./mvnw spring-boot:run` → `http://localhost:8080/api/books`. `dev` profile by default; password `club-secret` unless `ADMIN_PASSWORD_HASH='<bcrypt hash>'` is set (single quotes: the hash contains `$`) |
| Try a protected write | `curl -X POST -H "X-Club-Password: club-secret" localhost:8080/api/check-password` → 200 (401 without the header) |
| Frontend build + tests | `cd frontend && npm run build && npm test` |
| Run frontend | `npm run dev` → `http://localhost:5173`, `/api` proxied to `:8080`; more in [frontend.md](frontend.md) |
| App image (frontend + backend + covers) | `docker build -t readers-club .` (repo root, ~2 min cold). Tests don't run inside; run them first |
| Run the image against local Mongo | `docker run --rm --memory=512m -p 8090:8080 -e DB_URL=mongodb://host.docker.internal:27017/readersDB -e ADMIN_PASSWORD_HASH='<bcrypt hash>' readers-club` → `http://localhost:8090` (password `club-secret` with the test hash from `application-dev.yaml`) |
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
