# ADR-001: Tech stack for the Readers Club rewrite

- **Status:** Accepted
- **Date:** 2026-10-31

## Context
The live site is a small Express + jQuery app on Render with MongoDB Atlas. It has no server-side auth on writes, no validation and no tests (see `legacy-analysis.md`). A rewrite in Spring Boot 4 + React/TypeScript already exists and covers the public page (see `new-version-analysis.md`). Traffic is tiny: one club, a handful of writes per month. The site must keep using the existing Atlas data.

## Options
| | A. Spring Boot + React (existing rewrite) | B. Node/TypeScript rewrite (e.g. Express/Fastify + React) |
|---|---|---|
| Work left | Finish + harden existing code | Rewrite the backend again (UI reusable) |
| Typing / validation | Java types, Bean Validation | TS + a schema lib (zod etc.) |
| Security | Spring Security, BCrypt built in | Hand-wired middleware + bcrypt |
| Memory on Render | JVM: roughly 250–400 MB resident; needs tuned flags on a 512 MB instance | ~60–120 MB |
| Cold start | Slower: several seconds of JVM + Spring start after the free tier spins down | ~1 s |
| Image size | Larger (JRE base) | Smaller |
| Owner familiarity / intent | Chosen by the owner; rewrite already in progress | Closer to current code |

## Decision
**Option A: Spring Boot + React**, shipped as one Docker image (Spring serves the Vite-built SPA) on Render.

## Consequences
- **Positive:**
  - Reuses the finished rewrite.
  - Strong validation and a standard security stack.
  - One deployable unit.
- **Negative:**
  - Higher RAM use and slower cold starts on Render.
  - Mitigations: tuned JVM flags (e.g. `-XX:MaxRAMPercentage`, SerialGC), lazy init if needed, a health endpoint, and measuring on the staging service (Phase 5) before cutover.
- **Revisit if:**
  - Staging shows the instance can't fit in its memory limit.
  - Cold starts are unacceptable to the club.
- **Fallbacks:**
  - Use a paid always-on instance.
  - Consider GraalVM native image.
