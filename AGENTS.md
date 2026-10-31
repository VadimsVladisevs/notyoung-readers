# Readers Club

Website of a book club ("НЕЮНЫЙ ЧИТАТЕЛЬ"): the books the club plans to read, is reading and has finished, plus per-tag statistics. A shared club password protects changes.

## Where things are
- **Branch `migration/spring-react`:** the Node.js → Spring Boot + React migration is in progress. The plan and its current phase are in `docs/ai/migration/PLAN.md`.
- **Repo root** (`app.js`, `modules/`, `index.html`, `public/`): the **legacy** Express app that runs in production. It is frozen until cutover; change it only when asked.
- **`backend/`**: Spring Boot 4 + Java 25 + MongoDB. **`frontend/`**: React + TypeScript + MUI.

## Read before working
`docs/ai/README.md` indexes the agent docs. Open the matching doc before the task:
- API, data model, how the parts connect → `docs/ai/architecture.md`
- code in `backend/` → `docs/ai/backend.md`
- code in `frontend/` → `docs/ai/frontend.md`
- build, test, run, environment, git, migration-plan upkeep → `docs/ai/workflow.md`

## Gotchas for every task
- Run Maven as `./mvnw` from **Git Bash**. `mvnw.cmd` breaks on the apostrophe in the `Reader's Club` path.
- Backend tests need **Docker** running (Testcontainers).
- Keep secrets out of the repo. Config comes from env vars (`DB_URL`, `ADMIN_PASSWORD_HASH`, `PORT`).

## After changing code
Run the `update-ai-docs` skill so `docs/ai/` keeps matching the code.
