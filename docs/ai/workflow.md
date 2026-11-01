# Workflow

## Environment (Windows 11 dev machine)
- **Shells:** use Git Bash for `./mvnw`. `mvnw.cmd` breaks on the `'` in the `Reader's Club` path. PowerShell is fine for Windows-specific checks.
- **JDK:** Eclipse Temurin 25 (OpenJDK, never Oracle). A user-level `JAVA_HOME` points to it; old Oracle JDKs are still installed but not on `JAVA_HOME`.
- **Docker Desktop:** needed for backend tests (Testcontainers), the local Mongo and the app image. Docker can't bind host port **8080** on this machine (likely a Windows reserved port range, no listener), so map the container to `8090`.
- **Local MongoDB:** Docker Compose service `mongo` (`compose.yaml`, `mongo:8.0`, `127.0.0.1:27017`, database `readersDB`, real-looking club data restored from the old service). The compose project name is fixed (`readersclub`), so every clone shares the volume `readersclub_mongo-data`. The old Windows service `MongoDB` (5.0) is stopped and set to **Manual**. Don't start it while compose runs, because both use port 27017. Its data dir also holds unrelated databases (`blogDB`, `shopDB`, …) that were not migrated.
- **Node:** 24, version in `.nvmrc` (24.14.1). Used by `frontend/` (`engines` ≥ 24).
- **Line endings:** `core.autocrlf=true`; `.gitattributes` keeps `backend/mvnw` LF. Git's "LF will be replaced by CRLF" warnings are expected.

## Commands
| Task | Command |
|---|---|
| Backend build + all tests | `cd backend && ./mvnw verify` |
| Backend compile only | `./mvnw -q compile` |
| Local Mongo | `docker compose up -d --wait` / `docker compose stop` (repo root) |
| Run backend against local Mongo | `cd backend && ./mvnw spring-boot:run` → `http://localhost:8080/api/books`. `dev` profile by default; creates login `admin` / `club-secret` (ADMIN) if there's no `admin` user. The local compose data already has `admin` (the real club password, `roles: ["ADMIN"]` added 2026-11-01), so the seed is skipped there |
| Try a protected write | `curl -c jar -b jar localhost:8080/api/auth/me` (sets `XSRF-TOKEN`), then send the cookie's value as `-H "X-XSRF-TOKEN: <token>"` with `-b jar -c jar` on `POST /api/auth/login` (JSON body) and the write. Without a login → 401, without the token → 403. The session cookie is `Secure`; curl still sends it to `localhost` |
| Frontend build + tests | `cd frontend && npm run build && npm test` |
| Run frontend | `npm run dev` → `http://localhost:5173`, `/api` and `/images` proxied to `:8080`; more in [frontend.md](frontend.md) |
| App image (frontend + backend) | `docker build -t readers-club .` (repo root, ~2 min cold). Tests don't run inside; run them first. Covers aren't in the image: they come from the DB |
| Run the image against local Mongo | `docker run --rm --memory=512m -p 8090:8080 -e DB_URL=mongodb://host.docker.internal:27017/readersDB readers-club` → `http://localhost:8090`. Log in with an account from `users` (the image runs without `dev`, so there's no seed) |
| Legacy app | Only on branch `legacy` (prod rollback); not built or run on this branch |

When you start the backend in the background, stop it afterwards and check that port 8080 is free. For a write check, a temporary ADMIN user in the local `users` with the test hash from `IntegrationTest.PASSWORD_HASH` (`club-secret`) works; delete it afterwards. Git Bash `curl -F file=@…` needs a path curl can open (relative, or `cygpath -m`); a `/c/...` scratchpad path fails with curl error 26 and sends nothing. Writes against the local Mongo change real-looking data; prefer read-only checks or tests.

## Git
- `main` is production: every push to it deploys on Render (auto-deploy). Work on a short branch and open a PR to `main`. Commit only when the user asks.
- Commit subject: `Phase N (part k): <summary>` for plan work; body lists the changes as bullets.
- Never commit secrets (`.env*` is ignored). The Atlas password was rotated at cutover (2026-11-01); the one in old local files is dead.
- Deleting directories: remove files one by one, then `rmdir` the empty directory. No recursive force-delete.

## Migration plan upkeep
`docs/ai/migration/PLAN.md` is the master plan: a phase table (☐ / ◐ / ☑) and a **decision log**. Each phase gets a sub-plan `0N-<name>.md` with tasks, progress and its own verify steps.
- When a phase starts: write its sub-plan in detail and set the row to ◐.
- During it: tick tasks and record non-obvious findings in the sub-plan.
- Each decision the user makes → a dated decision-log row.
- Mark ☑ only after the sub-plan's verify steps pass.
