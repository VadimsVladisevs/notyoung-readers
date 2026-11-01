# Phase 10: Cover images in MongoDB

Part of [PLAN.md](PLAN.md). Status: ◐ (started 2026-11-01)

## Goal
The 163 covers (all `.jpg`, ~24 MB) are files: repo-root `public/images/` → copied into the Docker image → served by Spring as `static/images/**`; in dev a Vite plugin serves them. No UI can upload a cover (Phases 8 and 9 left it out).
Done when every cover is served from MongoDB, the admin uploads a cover in the add and edit dialogs, and the Docker image holds no image files.

## Decisions (2026-11-01)
- **`image` stays a path string** `images/<name>`. The file is stored in **GridFS** under `<name>` and served at the same URL `GET /images/<name>`. No book-data migration; `coverSrc` in the UI is unchanged; legacy/rollback is unaffected (it serves its own files and never reads GridFS).
- **JPEG only**, up to 2 MB; no resizing or conversion.
- **Import** with `mongofiles` from the `mongo:8.0` Docker image (`scripts/import-covers.sh <mongo-uri>`), `--replace` so re-runs are safe. Imported files keep their `.jpg` names.
- **Upload UI:** a drag-and-drop zone in the add and edit dialogs (drop or click to pick), preview with a remove button, client-side type/size checks.
- **Generated name** `<author>-<title>.jpeg`, made on the server from the book's current author and title on every upload: Cyrillic → Latin transliteration, lowercase, anything not `[a-z0-9]` → `-`, repeated `-` collapsed and trimmed, capped at ~80 chars; `-2`, `-3`, … when another book already uses the name. E.g. `Акутагава` + `Ворота Расёмон` → `akutagava-vorota-rasemon.jpeg`.
- **Replace** stores the new file under the regenerated name and deletes the old file. Editing only title/author doesn't rename an existing cover. Deleting a book deletes its cover.
- **Caching:** `Cache-Control: no-cache` + `ETag` (the GridFS file id, new on every upload); a matching `If-None-Match` → 304.
- `image` removed from `CreateBookDto` (covers come only from upload). Add with a cover = create, then upload; a failed upload leaves the book without a cover and shows an error.

## Tasks
- [x] **1. Backend serve:** `CoverController` `GET /images/{filename}` from GridFS (content type, ETag, no-cache, 304, 404).
- [x] **2. Backend name:** `CoverNames` transliteration + slug + collision suffix. Unit tests.
- [x] **3. Backend upload:** `PUT /api/books/{id}/cover` (multipart `file`, JPEG check incl. magic bytes, 2 MB → 413 `ProblemDetail`), sets `image`, deletes the old file; `DELETE /api/books/{id}` deletes the cover; `image` dropped from `CreateBookDto`. Tests incl. 401/403.
- [x] **4. Import script** `scripts/import-covers.sh`; run on local compose Mongo; every `books.image` resolves.
- [x] **5. Frontend:** `CoverDropZone`; wire into `add-book-dialog` and `edit-book-dialog`; `api.uploadCover`; remove the `legacyCovers` Vite plugin, proxy `/images` → `:8080`. Tests.
- [x] **6. Packaging:** drop `COPY public/images/` from the `Dockerfile` and images from `.dockerignore`. `public/images/` stays in the repo until Phase 11.
- [ ] **7. Staging:** user runs the import against `readersDB_staging`, pushes, checks covers / add with cover / replace / Atlas size.
- [x] **8. Docs:** Phase 11 sub-plan (import into prod before the switch), `architecture.md`, `frontend.md`, `backend.md`, README, then the `update-ai-docs` skill.

## Findings
- Boot 4 still auto-configures `GridFsTemplate` on the `spring.mongodb.database`; no config needed.
- Soft sign `ь` → `j` (legacy style, `smertj`), so «кланяться» → `klanjatjsja`; hard sign `ъ` is dropped.
- A cover file shared by two books (possible in legacy data) is only deleted when no other book points at it.
- MockMvc doesn't enforce `spring.servlet.multipart.max-file-size`, so `CoverService` also checks 2 MB itself (same `MaxUploadSizeExceededException` → 413).
- Import: 163 files in ~16 s, 0 books with a missing cover on the local data; GridFS storage ~18 MB.
- Frontend: `coverSrc` adds `?v=<updatedAt>`, because replacing a cover often keeps its name and the page would keep showing the old image until a reload.
- Frontend tests: jsdom's `File` doesn't survive Node's `fetch` (empty part named `blob`), so the multipart body is checked with a `fetch` spy in `api.test.ts`; App tests check path, CSRF and content type only.
- Spring 7: `MockMultipartHttpServletRequestBuilder` no longer extends `MockHttpServletRequestBuilder`; `SecurityTests` uses `AbstractMockHttpServletRequestBuilder<?>`.

## Verify
- [x] `./mvnw verify` green: 170 tests, 0 failures.
- [x] `npm run build` + `npm test` green: 59 tests.
- [x] `docker build`: no `.jpg`/`static/images` in the jar; `docker run` against local Mongo (2026-11-01, port 8099, temporary `e2e-admin` and book, both deleted): cover 200 `image/jpeg` + `no-cache` + ETag, 304 on `If-None-Match`, unknown 404; upload → `images/akutagava-vorota-rasemon-e2e.jpeg`; replace → still one file with the new bytes; PNG type → 400; 2 MB + 10 B and 5 MB → 413; delete book → file gone (163 left); anonymous upload without CSRF → 403.
- [ ] Local browser: covers show; add with a dropped cover; replace in edit; delete removes the file.
- [ ] Staging (user).
