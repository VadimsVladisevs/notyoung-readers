# Architecture

## The pieces
| Part | Where | Status |
|---|---|---|
| Legacy app | repo root: `app.js`, `modules/db.js`, `index.html`, `public/` (jQuery + 163 covers in `public/images/`) | **Production** on Render (Heroku-style `Procfile`), MongoDB Atlas. Frozen until cutover (Phase 7) |
| Backend | `backend/` | Spring Boot REST API under `/api`. Not deployed yet |
| Frontend | `frontend/` | React SPA; calls relative `/api/...` URLs (dev proxy → `:8080`). Not deployed yet |

Target (Phase 6): one Docker image where Spring Boot serves the built SPA, on Render, against the **same Atlas data**. Until Phase 8, cover images stay files at `images/<name>.jpg`; the book's `image` field holds that relative path.

## Data model
MongoDB database `readersDB`, collection **`books`**, shared with the legacy app. **Keep it compatible with the legacy app:** both apps read and write this collection until cutover, so no schema migration.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | `Book.id` (String) |
| `title`, `author`, `tag` | string | Legacy Mongoose put a unique index on `title`; the new app creates no indexes |
| `image` | string | `images/<file>.jpg` (validated on create/update) |
| `status` | string | Lowercase `new` / `progress` / `finished`. Mapped to `BookStatus` by `BookWritingConverter` / `BookStatusReadingConverter` |
| `wiki` | string | Link; **missing in some legacy docs** |
| `rating` | number | 1–10 when finished; legacy may store ints → read as `Double` |
| `createdAt`, `updatedAt` | date | Spring Data auditing; **missing in some old docs** |
| `__v` | int | Legacy Mongoose version key; ignored |

Workflow of a book: `new` → (start) `progress` → (finish with rating) `finished`. The club reads one book at a time; the UI treats the first `progress` book as "current".

Collection **`users`** (legacy only): the `admin` user's **bcrypt** hash of the club password. The new backend does not read it yet. Today it compares against `ADMIN_PASSWORD_HASH` (PBKDF2, fixed salt). Phase 3 switches to the existing bcrypt hash.

## API contract (backend)
Errors are RFC 9457 `ProblemDetail` (`application/problem+json`): `title`, `status`, `detail`, `instance`. Validation errors add `errors: {field: message}`. Any unexpected exception → 500 with a generic detail; the real message is only logged.

| Endpoint | Input | Success | Errors |
|---|---|---|---|
| `GET /api/books` | `?status=new\|progress\|finished` optional | 200 list | 400 unknown status |
| `GET /api/books/{id}` | | 200 book | 404 |
| `POST /api/books/add` | JSON `CreateBookDto`: title, author, image, tag, wiki, all required | 201 book, status `new` | 400 + `errors` |
| `PATCH /api/books/{id}/update` | JSON `BookDto`, any subset of fields; omitted fields keep their value | 200 book | 400, 404 |
| `PATCH /api/books/{id}/start` | | 200 book in `progress` | 409 unless `new`; 404 |
| `PATCH /api/books/{id}/finish` | JSON `{"rating": 1..10}`, number or numeric string | 200 book in `finished` | 400 + `errors.rating`; 409 unless `progress`; 404 |
| `DELETE /api/books/{id}` | | 200, **empty body** | 404 |
| `GET /api/books/random` | `?booksId=a&booksId=b` optional | 200 random book from the ids; with no ids, from `new` books only | 404 nothing to pick / unknown id |
| `GET /api/statistics` | | 200 `{"statistics": {tag: count}}`, count of non-`new` books, sorted desc; a tag with only `new` books → 0 | |
| `POST /api/check-password` | `password` request param (the UI sends form data) | 200 | 400 wrong, blank or missing |

**Writes are not protected yet** (Phase 3 adds the password check server-side). `@CrossOrigin` allows all origins (Phase 3 limits it to dev origins).

The legacy app's endpoints (`/books`, `/finish`, `/start`, `/addbook`, ...) are in [legacy-analysis.md](legacy-analysis.md); the new API is not a drop-in replacement for them.
