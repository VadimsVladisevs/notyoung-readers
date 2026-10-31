---
name: update-ai-docs
description: Sync the agent docs in docs/ai/ with code changes. Use after changing backend/, frontend/, build or config files, after finishing a migration-plan task, or before committing code.
---

# Update AI docs

The living docs in `docs/ai/` describe the code as it is **now**. After a change, every statement they make about the changed code must be true again. The docs are a **cache**: they hold what the agent can't see by looking (conventions, reasons, gotchas, contracts spread over many files). They don't copy what one file or command already shows, such as dependency versions or every class name.

## Steps

### 1. Collect the change set
Use the range the user names. Otherwise use everything not yet committed plus the commits on this branch since the docs were last touched:

```bash
git status --short
git log --oneline -1 -- docs/ai AGENTS.md          # last docs update
git diff --name-status <that commit>..HEAD          # committed since then
git diff --name-status HEAD                         # uncommitted
```

Done when you have a list of changed paths with what changed in each, from reading the diffs, not only the file names.

### 2. Map each path to its docs
| Changed path | Docs to check |
|---|---|
| `backend/src/main/java/**/api/**`, DTOs, `ApiExceptionHandler`, exceptions | `architecture.md` (API contract table, error format), `backend.md` (conventions) |
| `backend/src/main/java/**/model/**`, converters, repository | `architecture.md` (data model), `backend.md` |
| other `backend/src/main/**`, `application*.yaml` | `backend.md` (package map, config table) |
| `backend/src/test/**` | `backend.md` (Tests) |
| `backend/pom.xml`, `.mvn/` | `backend.md` (only if the stack, test setup or a gotcha changed), `workflow.md` (commands) |
| `frontend/**` | `frontend.md`; `architecture.md` if API usage changed |
| root legacy files (`app.js`, `modules/`, `index.html`, `public/`) | `architecture.md` (pieces) |
| `Dockerfile`, `compose.yaml`, `render.yaml`, CI, env vars | `workflow.md`, `architecture.md` (pieces), `backend.md` (config) |
| a new top-level area, or an always-relevant gotcha | `AGENTS.md`, `docs/ai/README.md` |
| a migration-plan task done or a decision made | `migration/PLAN.md` + the phase's `0N-*.md` (see step 4) |

Done when every changed path maps to at least one doc, or is noted as "no doc impact" with a reason (e.g. a pure refactor inside a method).

### 3. Edit the mapped docs
For each mapped doc, read it in full next to the changed code, then:
- **Correct** each statement the change made false (names, paths, status codes, commands, behaviour).
- **Add** what an agent now needs and can't see by looking: a new convention, endpoint, env var, gotcha, or the reason behind a choice.
- **Delete** what became stale or now duplicates another doc. Each fact lives in one doc; the others link to it.
- Match the doc's existing shape (tables, terse bullets). Keep `AGENTS.md` short: it loads every session, so it holds only pointers and gotchas that apply to every task.
- Check each new claim against the code or by running it. A doc that guesses is worse than one that is silent.

Snapshots (`adr-*.md`, `legacy-analysis.md`, `new-version-analysis.md`) stay as written; add a new doc or a decision-log row instead.

Done when each mapped doc is either edited or confirmed accurate, statement by statement, for the changed areas.

### 4. Migration plan
If the change completes or advances a task in `docs/ai/migration/`, follow the upkeep rules in `docs/ai/workflow.md` → "Migration plan upkeep": tick the task, record findings in the sub-plan, add dated decision-log rows for user decisions, and set the phase status.

### 5. Report
List each doc you changed, with a one-line reason, and each changed path you mapped to "no doc impact". Leave the doc edits uncommitted unless the user asked for a commit; when they did, commit them with the code they describe.
