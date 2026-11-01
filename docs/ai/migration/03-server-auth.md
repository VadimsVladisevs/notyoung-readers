# Phase 3 — Server-side auth

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-10-31)

## Goal
Protect every write on the server with the club's existing password. Reads stay public.
Done when tests show that writes return 401 without the password and succeed with it.

## Decisions (2026-10-31)
- **Transport:** custom header `X-Club-Password` on every non-GET `/api/**` request, checked by a Spring Security filter. No HTTP Basic, so no browser login popup. It's temporary: **Phase 9 removes it**. All of it lives in package `org.readersclub.security` so it's easy to delete.
- **Hash:** bcrypt, from env `ADMIN_PASSWORD_HASH` (`readers-club.password-hash`). Copy it once from Atlas `users.admin.password`. The new app never reads `users`. Spring's `BCryptPasswordEncoder` accepts the `$2b$` prefix written by the legacy Node `bcrypt` library. A value that isn't bcrypt fails at startup.
- **`POST /api/check-password`:** takes the same header and is protected like a write: 200 if right, 401 if wrong or missing. The `password` form param is gone. The frontend adapts in Phase 4.
- **401 shape:** `ProblemDetail` like every other error (`title` "Unauthorized", generic `detail`). The entry point hands the exception to `ApiExceptionHandler`.
- **CORS:** `@CrossOrigin` removed, and there is no CORS config. Dev proxies `/api` to `:8080` and prod is same-origin. This replaces "CORS dev origins only".
- CSRF off, sessions `STATELESS`, no cookies. Boot's default in-memory user (`UserDetailsServiceAutoConfiguration`) is excluded.
- **Brute force:** no rate limit yet. A wrong password logs a WARN with method + path and no password value. Rate limiting is noted for later.
- **Deny by default:** only `GET`/`HEAD /api/**` are public. Any other method on `/api/**` needs the password, including future endpoints. Non-`/api` paths (SPA files later) are public.

## Tasks
- [x] **1. Dependencies:** `spring-boot-starter-security`; test `spring-boot-starter-security-test` (Boot 4 starter).
- [x] **2. Password check:** `PasswordService` uses `BCryptPasswordEncoder.matches`. Blank → false. PBKDF2 code removed. `PasswordProperties`: `@Validated` + `@Pattern` (bcrypt).
- [x] **3. Security:** `security/SecurityConfiguration` (filter chain) + `security/ClubPasswordFilter`. `ApiExceptionHandler` maps `AuthenticationException` → 401.
- [x] **4. Controllers:** `@CrossOrigin` removed. `WebController.checkPassword()` has no params. `InvalidPasswordException` deleted.
- [x] **5. Tests:** `IntegrationTest` has a bcrypt `PASSWORD_HASH` (cost 4) and `clubPassword()` / `clubPassword(String)` helpers. New `SecurityTests`: every write × no/wrong/blank header → 401 problem+json with no data changed; correct header → OK; GETs public; no session cookie; no CORS headers. `PasswordPropertiesTests`: startup fails on a non-bcrypt or missing hash. `PasswordServiceTests` covers a `$2b$` hash. `BookControllerTests` / `WebControllerTests` send the header. `ApiExceptionHandlerTests` imports `SecurityConfiguration`.
- [x] **6. Docs:** PLAN.md (row, Phase 9 note, decision log), `architecture.md`, `backend.md`, `workflow.md`.

## Findings
- `@WebMvcTest` slices don't pick up `SecurityConfiguration`. Without `@Import(SecurityConfiguration.class)` (plus a mocked `PasswordService`), Boot's default chain answers 401 to everything. Slices also ignore the main class's `exclude`, so exclude `UserDetailsServiceAutoConfiguration` on the slice too, or it logs a generated password.
- The filter is built inside `SecurityConfiguration`, not declared as a `@Component`. Otherwise Boot would also register it as a plain servlet filter.
- Bcrypt hashes contain `$`. Quote them in single quotes in Bash, and escape them as `$$` in Docker Compose / `.env` files (Phases 5–6).

## Verify
- [x] `./mvnw verify` green: 120 tests.
- [x] Manual, `dev` profile + local Mongo + a bcrypt hash: `GET /api/books` → 200. `PATCH .../start` with no header / wrong header → 401 problem+json (WARN logged). Right header on a missing id → 404. `check-password` right → 200, none → 401. No "generated security password" in the log.
- [ ] Before cutover (Phase 7): check, read-only, that the hash in Atlas `users.admin` matches the club password.
