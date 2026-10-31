# Agent docs

Docs for AI agents working on this repo. **Living docs** describe the code as it is now and are updated with every change (skill `update-ai-docs`). **Snapshots** record a past moment; read them for history and leave them unchanged.

## Living docs
| Doc | Read when |
|---|---|
| [architecture.md](architecture.md) | You need the API contract, the data model, or how the legacy app, backend and frontend fit together |
| [backend.md](backend.md) | You change `backend/`: package map, error/validation conventions, config, test patterns |
| [frontend.md](frontend.md) | You change `frontend/`: structure, state, API client, known gaps |
| [workflow.md](workflow.md) | You build, test, run, commit, or update the migration plan |
| [migration/PLAN.md](migration/PLAN.md) | You need the current phase, its scope, or past decisions (decision log) |
| `migration/0N-*.md` | You work on phase N (task list, progress, environment notes) |

## Snapshots
| Doc | Content |
|---|---|
| [adr-001-tech-stack.md](adr-001-tech-stack.md) | Why Spring Boot + React was kept |
| [legacy-analysis.md](legacy-analysis.md) | The legacy Express app: endpoints, schema, page features (the UI parity checklist) |
| [new-version-analysis.md](new-version-analysis.md) | The imported rewrite before Phase 2, with its bug list |
