# Architecture

## The pieces
| Part | Where | Status |
|---|---|---|
| Legacy app | branch `legacy` only (removed from this branch in Phase 11): Express `app.js`, jQuery `index.html`, the 163 cover files in `public/images/` | **Production** on Render until the Phase 11 switch, then the rollback target (README → Production deploy) |
| Backend | `backend/` | Spring Boot REST API under `/api`. On staging inside the app image (below) |
| Frontend | `frontend/` | React SPA; calls relative `/api/...` URLs (dev proxy → `:8080`). On staging inside the app image (below) |
| App image | `Dockerfile`, `.dockerignore` (allow-list), `render.yaml` (repo root) | Node stage builds `frontend/dist` → Maven stage puts it in `static/` and packages the jar → `eclipse-temurin:25-jre`, non-root, JVM flags for 512 MB. **No cover files in the image** (Phase 10). Spring serves `/` (`index.html`), `/assets/**`, `/images/**` (covers from GridFS, `CoverController`), `/api/**`, `/actuator/health`. No SPA fallback (no client router). `render.yaml` defines only the **staging** service (`readers-club-staging`, Free, branch `migration/spring-react`, DB `readersDB_staging` with its own Atlas user), live at `https://readers-club-staging.onrender.com` |
| Local MongoDB | `compose.yaml` (repo root) | Dev only: `mongo:8.0` on `127.0.0.1:27017`, no auth, volume `readersclub_mongo-data`. Run steps in the root `README.md` |
| Covers | GridFS in each database | Imported once from the legacy files with `scripts/import-covers.sh` (removed in Phase 11; `git show 470bd6d:scripts/import-covers.sh`): local, staging and prod (2026-11-01, 163 files each). New covers come only through the upload in the add/edit dialogs |

Target: the app image on Render against the **same Atlas data** (staging in Phase 6 on a copy, `readersDB_staging`; prod at cutover, Phase 11). Atlas runs MongoDB 8.0.36, the same major version as the `mongo:8.0` used by Testcontainers and compose. Covers live in **GridFS** (Phase 10); the book's `image` field holds the relative path `images/<file>`, which is also the cover's URL. The legacy app reads the same field and serves its own files, so it keeps working on the same data.

## Data model
MongoDB database `readersDB`, collection **`books`**, shared with the legacy app. **Keep it compatible with the legacy app:** both apps read and write this collection until cutover, so no schema migration.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | `Book.id` (String) |
| `title`, `author`, `tag` | string | Legacy Mongoose declares a unique index on `title`, but **prod has none** (only `_id`, checked Phase 6); the new app creates no indexes |
| `image` | string | `images/<file>`: the GridFS file name, also the cover URL. Legacy covers are `<name>.jpg`; uploads are `<author>-<title>.jpeg`. Set only by the cover upload. **Missing on books without a cover**; the UI shows a placeholder |
| `status` | string | Lowercase `new` / `progress` / `finished`. Mapped to `BookStatus` by `BookWritingConverter` / `BookStatusReadingConverter` |
| `wiki` | string | The book's description text shown under the title (not a link). Required on new books; **missing in some legacy docs** |
| `rating` | number | 1–10 when finished; legacy may store ints → read as `Double` |
| `createdAt`, `updatedAt` | date | Spring Data auditing; **missing in some old docs** |
| `__v` | int | Legacy Mongoose version key; ignored |

Workflow of a book: `new` → (start) `progress` → (finish with rating) `finished`. The admin can also set any status by editing the book (Phase 9). The club reads one book at a time; the UI treats the first `progress` book as "current", and an edit that would make a second `progress` book is refused (409).

Collection **`users`**, shared with the legacy app: login accounts. Today there is one shared club account, `admin`.

| Field | Type | Notes |
|---|---|---|
| `username` | string | Unique (legacy Mongoose index) |
| `password` | string | **bcrypt** hash of the club password (`$2b$` from Node `bcrypt`; Spring's `BCryptPasswordEncoder` reads it) |
| `roles` | string[] | **New in Phase 7**, e.g. `["ADMIN"]`. Missing in legacy docs → no roles → can log in, can't write. The legacy app ignores it |
| `createdAt`, `updatedAt`, `__v` | | Legacy Mongoose fields; ignored |

The new backend only **reads** `users` (no password re-hashing on login). The one writer is the `dev`-profile seed (`DevAdminSeed`).

GridFS bucket **`fs`** (`fs.files` + `fs.chunks`), new in Phase 10: the cover JPEGs. `filename` = the part of `books.image` after `images/`; content type `image/jpeg`. The legacy app never reads it. A cover is deleted when its book is deleted or gets a new cover, unless another book points at the same file.

## API contract (backend)
Errors are RFC 9457 `ProblemDetail` (`application/problem+json`): `title`, `status`, `detail`, `instance`. Validation errors add `errors: {field: message}`. Any unexpected exception → 500 with a generic detail; the real message is only logged.

**Auth:** login with a **server session** (in-memory; a restart or Render Free sleep logs everyone out). `GET`/`HEAD /api/**` and `/api/auth/**` are public. **Every other `/api/**` request** needs a logged-in user with role **ADMIN** plus the **CSRF token**. Spring Security sets the JS-readable cookie `XSRF-TOKEN` (e.g. on `GET /api/auth/me`), and the client sends it back in header `X-XSRF-TOKEN` on every non-GET request, `/api/auth/login` included. Errors are checked before validation or lookup, so nothing changes:
- not logged in → **401** ("Login required")
- missing or wrong CSRF token, or no ADMIN role → **403** ("Not allowed")

The session cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, and the login changes the session id. **No CORS:** the dev server proxies `/api` and prod is same-origin, so cross-origin browser calls are blocked.

| Endpoint | Input | Success | Errors |
|---|---|---|---|
| `GET /api/books` | `?status=new\|progress\|finished` optional | 200 list | 400 unknown status |
| `GET /api/books/{id}` | | 200 book | 404 |
| `POST /api/books/add` | JSON `CreateBookDto`: title, author, tag, wiki required and not blank (stored trimmed). No `image` (ignored if sent; the cover is uploaded separately) | 201 book, status `new`, `image` null | 400 + `errors` |
| `PATCH /api/books/{id}/update` | JSON `BookDto`, a **full edit**: title, author, tag, wiki required and not blank (stored trimmed); `status` required; `rating` 1–10, required for `finished`, stored as null for any other status. No `image` (ignored if sent; the stored cover is kept) | 200 book | 400 + `errors` (missing rating → `errors.ratingGivenWhenFinished`); 409 `progress` while another book is in progress; 404 |
| `PATCH /api/books/{id}/start` | | 200 book in `progress` | 409 unless `new`; 404 |
| `PATCH /api/books/{id}/finish` | JSON `{"rating": 1..10}`, number or numeric string | 200 book in `finished` | 400 + `errors.rating`; 409 unless `progress`; 404 |
| `PUT /api/books/{id}/cover` | multipart, part `file`: a JPEG (`image/jpeg` and bytes starting `FF D8 FF`), ≤ 2 MB | 200 book with `image` = `images/<author>-<title>.jpeg` (transliterated slug, `-2`, `-3`… if another book has the name; regenerated on every upload). The old cover file is deleted | 400 not a JPEG / no `file` part; 413 over 2 MB; 404 |
| `DELETE /api/books/{id}` | | 200, **empty body**; also deletes the cover file | 404 |
| `GET /images/{file}` | | 200 `image/jpeg` from GridFS, `Cache-Control: no-cache` + `ETag` (the GridFS file id, new on every upload); 304 on a matching `If-None-Match`. Public (outside `/api`) | 404 ProblemDetail |
| `GET /api/books/random` | `?booksId=a&booksId=b` optional | 200 random book from the ids; with no ids, from `new` books only | 404 nothing to pick / unknown id |
| `GET /api/statistics` | | 200 `{"statistics": {tag: count}}`, count of non-`new` books, sorted desc; a tag with only `new` books → 0 | |
| `POST /api/auth/login` | JSON `{"username", "password"}`, both required | 200 `{"username", "roles": ["ADMIN"]}`, session cookie set | 400 + `errors` blank field; 401 wrong username or password; 403 no CSRF token |
| `POST /api/auth/logout` | | 204, session invalidated (also when not logged in) | 403 no CSRF token |
| `GET /api/auth/me` | | 200 `{"username", "roles"}` | 401 not logged in |

All non-`GET` book rows also return 401/403 as described in Auth above. The UI calls `me` on page load and sends the CSRF header on every write (see [frontend.md](frontend.md)).

`POST /api/books/add` rejects a missing or blank `wiki` (400), although some legacy books have none (decided in Phase 8: required for new books, legacy ones stay as they are).

The legacy app's endpoints (`/books`, `/finish`, `/start`, `/addbook`, ...) are in [legacy-analysis.md](legacy-analysis.md); the new API is not a drop-in replacement for them.
