# Phase 9: Edit and delete a book

Part of [PLAN.md](PLAN.md). Status: ◐ (started 2026-11-01)

## Goal
The logged-in admin (role ADMIN) edits and deletes a book from the UI. `PATCH /api/books/{id}/update` and `DELETE /api/books/{id}` already exist and Phase 7 limits them to ADMIN. But no UI calls them, and update has no blank check, no trim and no status rules.
Done when a logged-in admin edits and deletes a book from the UI, and every other request is refused: anonymous, or logged in without ADMIN.

## Decisions (2026-11-01)
- **Admin only:** the server already enforces it (`/api/**` writes → `hasRole("ADMIN")`); this phase adds tests for it. The UI shows the pencil and the dialog only when `isAdmin`.
- **Entry point:** a pencil icon, admin only, on the current book, the library swiper cards and the finished books. It opens one shared edit dialog filled with the book.
- **Cover:** no field. The stored `image` is kept. Phase 10 adds upload.
- **Fields:** title, author, tag (free text with suggestions), wiki, and status.
- **One book in progress:** setting `progress` while another book is in progress → 409. The book already in progress can be saved as `progress` again.
- **Rating:** shown and required (1–10) only for `finished`. Any other status stores the rating as null.
- **Delete:** «Удалить» in the edit dialog, with an inline confirmation step.
- **Wiki:** required when editing, like add. A legacy book without one has to get one when edited, and stays untouched otherwise.

## Tasks
- [x] **1. Backend:** `BookDto` full edit (`@NotBlank` text, `@NotNull` status, rating 1–10, no `image`); `BookService.updateAndSave` trims, keeps `id`/`createdAt`/`image`, rating rules (400 / null), second `progress` → 409. Tests in `BookControllerTests` + `SecurityTests` (anonymous, non-ADMIN, ADMIN).
- [x] **2. Frontend API + types:** `BookDto` with status and rating; `editBook` / `deleteBook` exports.
- [x] **3. Edit dialog:** `edit-book-dialog` (fields as in add, status select, rating for finished, delete with confirmation; 401 / 409 / generic messages).
- [x] **4. Wiring:** admin-only pencil in `current-book`, `library-swiper` and `finished-books`; state in `home-page.hooks.ts`. Tests.
- [x] **5. Docs:** `architecture.md`, `frontend.md`, `backend.md`, then the `update-ai-docs` skill.

## Findings
- `PATCH /update` is now a full edit, so `{}` gets 400 (validation runs before the lookup), not 404.
- The missing-rating error's field is `ratingGivenWhenFinished` (the `@AssertTrue` method), not `rating`. The UI doesn't read field errors, so it doesn't matter there.
- The local check found a backend already running on 8080 with the old code (started before the session). It was restarted with the new code, with the user's OK.
- The legacy book «Крупная рыба» has no `wiki`. Editing it needs a description first (decided above).

## Verify
- [x] `./mvnw verify` green: 155 tests, 0 failures.
- [x] `npm run build` + `npm test` green: 47 tests.
- [x] Local (2026-11-01, `dev` + compose Mongo, temporary users `e2e-admin` / `e2e-reader` and book `E2E Phase 9`, all deleted afterwards):
  - curl via the Vite proxy: anonymous PATCH/DELETE → 401; non-ADMIN → 403; blank title → 400; finished without a rating → 400; second `progress` → 409; edit (trimmed), new → finished (8) → new (rating cleared) → 200
  - browser logged out: no pencils; as admin: pencils on the swiper, the current book and the finished list; the dialog opens filled; «Прочитана» + «8,5» moves the book to the finished list with 8.5; delete → confirmation → gone, list renumbered; no console errors
- [ ] Staging (user): edit and delete work as admin.
