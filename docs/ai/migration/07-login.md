# Phase 7: Login

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-11-01)

## Goal
Replace the per-request club password (header `X-Club-Password`) with a login and a server session. Writes need a logged-in user with role ADMIN.
Done when the header auth is gone and writes need a logged-in user with the right role.

## Decisions (2026-11-01)
- **One shared account:** the existing `admin` document in Mongo `users`, which keeps today's club password (the legacy bcrypt hash). No sign-up and no user-admin UI.
- **Role:** ADMIN only, stored as a new `roles` field on the user (`["ADMIN"]`). A user without ADMIN can log in but gets 403 on writes. The field is additive; the legacy app ignores it.
- **Session:** a server session with an HttpOnly cookie (`secure`, `SameSite=Lax`) plus a CSRF token (`csrf.spa()`: cookie `XSRF-TOKEN`, header `X-XSRF-TOKEN`). Sessions live in memory, so a restart or Free-plan sleep logs people out. That's accepted.
- **API:** `POST /api/auth/login` (JSON `{username, password}`), `POST /api/auth/logout`, `GET /api/auth/me` (401 when anonymous). It's a custom controller, not `formLogin`, so errors stay ProblemDetail.
- **Read-only users:** the app never writes `users`. There is no password-upgrade service. The only writer is a dev-profile seed.
- **UI:** a username + password login dialog opened from the app bar ("Войти" / "Выйти"). No router.
- **Logged out:** the book-selection function is hidden. That covers the "Выбор книги" nav item and the select button on the current book. Browsing and statistics stay public.
- **Removed:** `X-Club-Password`, `ClubPasswordFilter`, `PasswordService`, `PasswordProperties`, `/api/check-password`, env `ADMIN_PASSWORD_HASH`.

## Tasks
- [x] **1. Backend auth:** `User` + `UserRepository`, `MongoUserDetailsService`, `AuthController`, `SecurityConfiguration` rewrite (session, CSRF, `hasRole("ADMIN")`, 401/403 ProblemDetail). Delete the header auth, `PasswordService`, `PasswordProperties`, `check-password`, `readers-club.password-hash`.
- [x] **2. Dev seed:** a `dev`-profile runner inserts `admin` / `club-secret` with `["ADMIN"]` when there's no `admin` user.
- [x] **3. Backend tests:** `SecurityTests` rewritten around a real login; new `AuthControllerTests`, `CsrfCookieTests`; `IntegrationTest` seeds `admin`; controller tests use `admin()` (mock ADMIN user + CSRF). `WebControllerTests`, `PasswordServiceTests`, `PasswordPropertiesTests` deleted.
- [x] **4. Frontend:** `api.ts` (no password, CSRF header, login/logout/me), auth context, login dialog, app bar login/logout, selection hidden when logged out, approval dialog without a password, session-expired handling, locales, tests.
- [x] **5. Staging:** `render.yaml` without `ADMIN_PASSWORD_HASH`. The user added `roles: ["ADMIN"]` to `readersDB_staging.users.admin` (`docker run --rm mongo:8.0 mongosh '<uri>' --eval …`; no `-it` in Git Bash) and removed the env var on Render.
- [x] **6. Cutover doc:** add the prod `roles` update and the env removal to [11-data-check-cutover.md](11-data-check-cutover.md).
- [x] **7. Docs:** README, `architecture.md`, `backend.md`, `frontend.md`, `workflow.md`, then the `update-ai-docs` skill.

## Findings
- **spring-security-test `csrf()` mutates the shared context:** it swaps the `CsrfFilter`'s repository for a test one backed by the session, so later requests in any test class never get the `XSRF-TOKEN` cookie. The cookie is tested in a separate `@WebMvcTest` slice (`CsrfCookieTests`).
- **MockMvc session fixation:** a session passed with `.session()` has `isRequestedSessionIdValid() == false`, so `ChangeSessionIdAuthenticationStrategy` skips the change. The test sets it to `true`, which is what a browser cookie gives.
- **Local compose data** already had `admin` (the real club password hash) without `roles`, so the dev seed is skipped there. With the user's OK, `roles: ["ADMIN"]` was added on the local DB only (2026-11-01).
- Anonymous `POST /api/check-password` now returns 401 (deny by default comes before routing), and 404 for an ADMIN.
- The CSRF token is not rotated on login (custom login, cookie double-submit). This is accepted for one shared account.

## Verify
- [x] `./mvnw verify` green: 121 tests.
- [x] `npm run build` + `npm test` green: 28 tests.
- [x] Local API (curl, `dev` + compose Mongo, temporary user `e2e-temp`, deleted afterwards):
  - `me` anonymous → 401 + `XSRF-TOKEN` cookie
  - writes: anonymous → 401, no CSRF token → 403, old header → 401
  - wrong login → 401 + WARN
  - login → 200, session cookie `HttpOnly` + `Secure`; `me` → user
  - writes after login pass auth (404 missing id, 409 finished book, no data changed)
  - logout → 204, then write → 401
- [x] Local browser (user): log in as `admin` with the club password, finish and start a book, log out; selection hidden when logged out.
- [x] Staging (user, `d481373`): log in with the real club password, run start/finish once, log out.
