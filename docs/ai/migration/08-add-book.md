# Phase 8: Add a book

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-11-01)

## Goal
The logged-in admin adds a book from the UI. `POST /api/books/add` already exists and Phase 7 limits it to ADMIN, but the UI has no add form (Phase 4 removed the unused dialogs).
Done when a logged-in user adds a book from the UI and anonymous adds are refused.

## Decisions (2026-11-01)
- **Cover optional:** covers are files baked into the Docker image, and upload only arrives in Phase 10. A new book may have no `image`; the UI shows a placeholder. The form has no cover field. Phase 10 adds upload to add/edit.
- **`wiki` required:** it is the description text shown under the title, not a link. New books need a non-blank one. Legacy books without one stay as they are.
- **Tag:** the club member who proposed the book. Free text with autocomplete from the existing tags.
- **Validation:** title, author, tag and wiki `@NotBlank`, trimmed on save. `image` still has to match `images/*.jpg` when sent.

## Tasks
- [x] **1. Backend:** `CreateBookDto` `@NotBlank`, `image` optional; `BookService.createAndSave` trims, stores a missing image as null. Tests in `BookControllerTests`; `SecurityTests` covers anonymous adds.
- [x] **2. Placeholder:** `frontend/public/cover-placeholder.svg` + a `coverSrc(book)` helper (`src/utils/cover.ts`) in the five places that render covers; `image` optional in the types.
- [x] **3. Add-book dialog:** title, author, tag (`Autocomplete freeSolo`), description; client validation; `addBook` → `refreshBooks()`; 401 → session-expired message.
- [x] **4. Wiring:** "Добавить книгу" in the app bar (desktop + drawer), logged in only; state in `home-page.hooks.ts`. Tests.
- [x] **5. Docs:** `architecture.md`, `frontend.md`, then the `update-ai-docs` skill.

## Findings
- Covers are rendered in **five** places, not four: `random-book-dialog` too.
- Only 401 shows «Сессия истекла», like the approval dialog. A 403 (missing CSRF token, no ADMIN role) gets the generic error.
- `Autocomplete` adds ~70 kB to the one JS chunk (now ~820 kB).
- The first staging deploy after the push still served the Phase 7 build (no «Добавить книгу», `cover-placeholder.svg` 404). A manual redeploy fixed it. To check what staging serves: the bundle name in `/` and `GET /cover-placeholder.svg`.

## Verify
- [x] `./mvnw verify` green: 0 failures.
- [x] `npm run build` + `npm test` green: 34 tests.
- [x] Local (2026-11-01, `dev` + compose Mongo, temporary user `e2e-temp` and book `E2E Phase 8`, both deleted afterwards):
  - curl via the Vite proxy: anonymous add → 401; blank `wiki` → 400 `errors.wiki`
  - browser logged out: no «Добавить книгу»; logged in: the item shows
  - empty submit: fields red + «Заполните все поля», no request; tag suggestions list the existing tags
  - add without a cover: the dialog closes, the book shows with the placeholder in the library and the selection dialog; stored trimmed, no `image`, status `new`; no console errors
- [x] Staging (user, `caecbfc`, after a redeploy): logged in, «Добавить книгу» shows and works. Checked by curl: the served bundle matches the local build, the placeholder is served (200), anonymous add without a CSRF token → 403.
