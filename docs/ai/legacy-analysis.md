# Legacy app analysis (Node.js / Express)

Snapshot of `main` @ `36ce2fe` (2026-10-31). This is the app currently live on Render.

## Stack & runtime
| Item | Value |
|---|---|
| Runtime | Node `24.14.1` (`.nvmrc`, `package.json` engines), Yarn |
| Server | Express 5 (`app.js`), body-parser 2 (JSON only) |
| DB | Mongoose 9 → MongoDB Atlas (`modules/db.js`) |
| Frontend | Static `index.html` + `public/js/index.js` (jQuery 3.6, Bootstrap 5.1, Swiper 8, Chart.js 2.9, Font Awesome kit — all from CDNs) |
| Assets | `public/images/` — 163 covers; `public/css/styles.css` |
| Deploy | Render (no `render.yaml`); `Procfile` (`web: node app.js`) is a Heroku leftover |
| Tests | None (`npm test` is the placeholder; `test/` is gitignored scratch) |

## Env vars
| Name | Used in | Purpose |
|---|---|---|
| `DB_URL` | `modules/db.js` | Mongo connection string (incl. DB name) |
| `PORT` | `app.js` | Listen port, default 3000 |

Loaded by `dotenv` from a local `.env` (gitignored).

## Routes
| Method | Path | Input | Auth | Effect |
|---|---|---|---|---|
| GET | `/` | — | none | Serves `index.html` |
| GET | `/books` | `?status=` optional | none | All books, or by status; `finished` sorted by rating asc |
| POST | `/` | — | none | Redirect to `/` (dead) |
| POST | `/finish` | `{_id, rating}` | **none** | Sets `status=finished`, `rating` |
| POST | `/start` | `{_id}` | **none** | Sets `status=progress` (no check of current status) |
| POST | `/addbook` | book JSON | **none** | Inserts a book (not used by the UI) |
| DELETE | `/deletebook` | `{title}` | **none** | Deletes by title (not used by the UI) |
| POST | `/createuser` | `{username, password}` | **none** | Creates a user with a bcrypt(12) hash — anyone can add users |
| POST | `/check` | `{pw}` | — | `bcrypt.compareSync` against user `admin`; returns `{result: bool}` |

Errors: every `.catch` does `res.send(err)` → HTTP 200 with the raw error object.

## Data model (Mongo)
**`books`** (Mongoose model `Book`, `timestamps: true`)
| Field | Type | Rules |
|---|---|---|
| `title` | String | required, unique index |
| `author` | String | required |
| `image` | String | required, e.g. `images/<name>.jpg` |
| `status` | String | required; values used: `new`, `progress`, `finished` — **not enforced** |
| `tag` | String | required (genre) |
| `wiki` | String | optional |
| `rating` | Number | `minimum/maximum` are not Mongoose validators → **not enforced** |
| `createdAt`, `updatedAt`, `__v` | auto | — |

**`users`** (`timestamps: true`): `username` (unique), `password` (bcrypt hash). The `admin` user's hash is the club password.

## Auth flow
1. User types the confirmation code in the approve dialog.
2. Browser POSTs `/check`; server compares with `admin`'s bcrypt hash.
3. If `true`, the **browser** calls `/finish` and `/start`. The server never checks the password on write routes, so the check is client-side only.

## Frontend features (parity checklist for Phase 4)
- [ ] Fixed dark navbar: title «Клуб "НЕЮНЫЙ ЧИТАТЕЛЬ"», anchors Библиотека / Выбранная книга / Прочитанные книжки
- [ ] Navbar buttons: Выбор книги (selection modal), Статистика (stats modal)
- [ ] Social icons: Discord, Facebook group, Miro board (open in new tab)
- [ ] Library: Swiper of **all** books (cover, title, author), 5 per view, loop, vertical at ≤760px width
- [ ] Current book: the `progress` book — "author. title", wiki text, cover
- [ ] Finished list: newest-rated order (rating desc), numbered, alternating image side, wiki, «Оценка клуба - N»
- [ ] Selection modal: cards of `new` books, filter input (matches **tag**), checkbox per card, count badge
- [ ] «Случайный выбор»: random pick from all `new` books
- [ ] «Подтвердить» with ≥1 checked: random pick among checked books; with 0 checked: error modal «Добавьте книжки для выбора»
- [ ] Random-result modal: cover, author, title → «Подтвердить» opens the approve dialog
- [ ] Approve dialog: rating for the current book (comma or dot decimal) + confirmation code → finish current, start chosen, reload page; wrong code → alert «Неправильный пароль!»
- [ ] Statistics modal: horizontal bar per tag; toggle Количество (count of progress+finished) / Рейтинг (average rating); tooltip lists books + ratings + average
- [ ] Footer «© Copyright 2022 Reader's club»

## Known issues
- **No server-side auth** on any write route; `/createuser` lets anyone create users.
- No validation of `status`/`rating`; `/start` and `/finish` trust the client's `_id` and don't check current status.
- Errors return HTTP 200 with raw error objects; `/check` crashes (unhandled) if `admin` is missing.
- Finish and start run in parallel (`Promise.all`), so one can succeed while the other fails.
- `index.html` has duplicate `id="library"`, an unclosed `</div>` / misnested `</form>`, and Chart.js 2 APIs.
- Global leaks in `index.js` (`index`, `i`); `addBooksToCarousel` targets a non-existent `.library-prev-btn`.
- Startup log always says "port 3000".
- Dead deps: `ejs` (view engine set, never used), `browserify`, `uniq`, `https` (npm placeholder), `body-parser` (Express 5 has `express.json()`), `npm-check-updates` (should be dev), `nodemon` (should be dev), `bluebird`, `underscore` (one `sortBy`).
- Unused `require`s in `app.js`: `fs`, `https`, `mongoose`.
