# New version analysis (Spring Boot + React)

Snapshot of `C:\Projects\readers-club` (2026-10-31). Its git repo has no commits, and nothing has been built since the upgrade to Boot 4.

## Stack
| Part | Value |
|---|---|
| Backend | Spring Boot 4.0.3 parent, Java 25, Maven (no wrapper), Lombok 1.18.42; starters: web, validation, data-mongodb |
| Tests | spring-boot-starter-test (**no test scope**), flapdoodle embedded Mongo 4.24, JUnit 5, Mockito |
| UI | CRA (`react-scripts` 5.0.1), TypeScript 5.7 range, React 18.3, MUI 6, Swiper 11, Chart.js 4 + react-chartjs-2, own `i18n.ts` + `locales/ru.json` |
| Dev wiring | CRA `proxy` → `http://localhost:8080`; UI calls relative `/api/...` |

## Status overview
| Area | Done | Half-done | Missing |
|---|---|---|---|
| Book API | list/by status/by id, add, update, start, finish, delete, random, statistics | error mapping (everything → 400) | business exceptions → proper codes |
| Auth | `/api/check-password` | hard-coded PBKDF2 hash | **any** server-side protection of writes |
| Validation | DTO `@NotNull`/`@Min`/`@Max`/`@Pattern` on create/finish | `@ValidBookStatus` exists but is unused and buggy | `BookDto` (update) not `@Valid` |
| Config | — | `DatabaseProperties` on the old `spring.data.mongodb` prefix | env-based config, profiles; DEBUG root logging + file log |
| UI | every public-page feature (see parity below) | password sent only to the check endpoint | sending the password with writes; real tests |
| Build/deploy | — | — | Maven wrapper, `spring-boot-maven-plugin`, Dockerfile, SPA serving, health check |
| Tests | `BookServiceTests` (status lookup), `BookValidatorTests` (status), `PasswordServiceTests` (negatives) | `BookControllerTests` (1 empty-ish test), `MongoDbTestConfiguration` (all commented) | controller/MockMvc tests, `WebControllerTests` (empty class) |

## API vs legacy
| New endpoint | Legacy equivalent | Difference |
|---|---|---|
| `GET /api/books[?status=]` | `GET /books` | Invalid status → 400; no rating sort for `finished` |
| `GET /api/books/{id}` | — | new |
| `POST /api/books/add` | `POST /addbook` | Status forced to `new`; image must match `images/*.jpg` |
| `PATCH /api/books/{id}/update` | — | new; partial update |
| `PATCH /api/books/{id}/start` | `POST /start` | Only from `new` |
| `PATCH /api/books/{id}/finish` | `POST /finish` | Only from `progress`; rating 1–10 required |
| `DELETE /api/books/{id}` | `DELETE /deletebook` (by title) | By id |
| `GET /api/books/random[?booksId=]` | (client-side) | Server-side pick |
| `GET /api/statistics` | (client-side) | Counts per tag only; **unused by the UI** (UI computes count + avg itself) |
| `POST /api/check-password?password=` | `POST /check` | Form/query param, 200/400 instead of `{result}` |
| — | `POST /createuser` | dropped (good) |

## Schema compatibility
`Book` maps to the same `books` collection: `id`↔`_id`, title, author, image, status, tag, wiki, rating (Double), createdAt/updatedAt via `@EnableMongoAuditing`. `BookStatus` is stored and read as lowercase `new`/`progress`/`finished` through custom converters → matches legacy data. Legacy `__v` is ignored on read. `wiki` is `@NotNull` on the entity, but this isn't enforced on read; legacy books without `wiki` still load. `users` is not modelled. **Conclusion: no data migration expected**; verify against prod in Phase 6.

## Bugs (verified in code)
| # | Where | Bug |
|---|---|---|
| 1 | `BookService.updateAndSave` | Rebuilds `Book` without `createdAt` → creation date is lost on update |
| 2 | `BookService.getRandomFromList` | `random.nextInt(0)` throws on an empty list |
| 3 | `ApiExceptionHandler` | Catches `Exception.class` → every error (incl. not-found, 500s) returns 400 |
| 4 | `BookController.finishBook/startBook` | Wrong-status cases throw a generic `Exception` |
| 5 | `BookStatusTypeSubSetValidator.isValid` | `value != null \|\| ...` accepts any non-null value (should be `&&`) |
| 6 | UI `services/api.ts` `finishBook` wrapper | `rating ?? 0`, and the approve dialog does `parseFloat(...) \|\| 0` → empty rating sends 0 → fails `@Min(1)` with a generic "wrong password" message |
| 7 | UI «Случайный выбор» | Calls `/api/books/random` **without ids** → picks from *all* books (incl. finished); starting it then fails. Legacy picks from `new` only |
| 8 | UI start flow | With no current book, `startBook` runs with no password at all |
| 9 | `pom.xml` | `spring-boot-starter-test` without `<scope>test</scope>`; no `spring-boot-maven-plugin`; redundant `spring-data-mongodb` 5.0.3 pin |
| 10 | `DatabaseProperties` | Binds `spring.data.mongodb.*`; Boot 4 moved Mongo properties to `spring.mongodb.*` |
| 11 | UI `index.css`, `App.css` | `@import` after other rules in `index.css` (Font Awesome) — invalid order |
| 12 | UI `book-selection-dialog.tsx` | Uses deprecated MUI `InputProps` (→ `slotProps.input`) |
| 13 | UI misc | `ConfirmBookDialog` and `selection-confirm-dialog.tsx` unused; `manifest.json` is the CRA sample; `App.test.js` is the CRA "learn react" test (fails) |
| 14 | `BookValidator` | Unused `java.awt.geom.Arc2D` import; large commented-out blocks |

## UI parity vs legacy
Covered: navbar + anchors, social links, library Swiper, current book, finished list, selection dialog with checkboxes + count badge, random pick, approve dialog (rating + password), statistics count/rating toggle with tooltip, footer.
Differences: search can filter by title/author/tag (legacy: tag only), finished list sorted by rating desc (same as legacy's visible order), bug 7 above.

## Secrets found (locations only; strip in Phase 1)
- `src/main/resources/application.yaml`: a local Mongo URI with credentials, `username`/`password` keys, and a **commented-out Atlas `mongodb+srv` URI with credentials** → rotate the Atlas password.
- `src/main/java/.../service/PasswordService.java`: hard-coded password hash constant.
- `src/test/java/.../service/PasswordServiceTests.java`: commented-out string literals, possibly the plaintext password — check and remove.

## Import notes for Phase 1
- Exclude: `.idea/`, `target/`, `log/`, `ui/node_modules/`, `ui/build/`.
- `ui/public/images/` has 152 covers, a strict subset of this repo's 163 → don't import; this repo's `public/images/` stays the single source.
- Oddities shared by both image sets: `rushdi-deti.jpg.jpg`, and both `jukio-hram.jpg` and `ukio-hram.jpg`.
- UI uses `package-lock.json` (npm); this repo uses Yarn — decide during Phase 4 (Vite move).
