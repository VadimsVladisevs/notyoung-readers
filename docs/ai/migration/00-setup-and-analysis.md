# Phase 0 — Setup & analysis docs

Part of [PLAN.md](PLAN.md). Status: ☑

## Goal
Produce documentation only, on branch `migration/spring-react` — no app code changes. A written baseline of the legacy Node app and the Spring/React rewrite, plus the stack decision, before importing code in Phase 1.

## Facts checked (2026-10-31)
- Branched from `main` (`36ce2fe`), clean except untracked `@`.
- `@` is an old package.json backup (Node 16, Express 4, Mongoose 6, `nodejs` pkg). Untracked, so deleting it needs no commit.
- `.env` is gitignored (`/*.env`). Docs name env vars, never values.
- Rewrite at `C:\Projects\readers-club` exists (`pom.xml`, `src/`, `ui/`); its git repo has no commits.

## Decisions
- Delete `@` in this phase.
- Analysis docs: concise tables + bullets (~1–2 pages each).
- Write everything, review together, then a single commit.

## Tasks
- [x] Create branch `migration/spring-react` → `git branch --show-current`
- [x] Write `PLAN.md` and this sub-plan
- [x] Delete `@` → `git status` no longer lists it
- [x] `docs/ai/legacy-analysis.md` — from `app.js`, `modules/*`, `index.html`, `public/js/index.js`, `package.json`, `Procfile`, `.nvmrc`. Sections: routes table (method, path, body, auth, effect), Mongo models/collections, env var names, auth flow (bcrypt `admin` user), frontend features (parity checklist for Phase 4), deploy (Render, Procfile leftover), known issues.
- [x] `docs/ai/new-version-analysis.md` — from `C:\Projects\readers-club` (backend `src/`, `pom.xml`, `ui/src`, `ui/package.json`). Sections: done / half-done / missing, API table vs legacy routes, schema comparison, bug list (re-verified against code), secrets found (location only, no values).
- [x] `docs/ai/adr-001-tech-stack.md` — context, options (Spring+React vs Node/TS rewrite), Render cold-start/RAM trade-off, decision Spring+React, consequences.
- [x] `docs/ai/migration/01-import-new-code.md` in detail.
- [x] Review with user → one commit → mark Phase 0 ☑ in `PLAN.md`.

## Done when
- All docs exist and are committed on `migration/spring-react`; `main` untouched.
- `git grep -iE "mongodb\+srv|password\s*[:=]|\$2[aby]\$"` on the branch finds no secret values.
- User has reviewed the analysis docs.
