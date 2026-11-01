# Frontend (`frontend/`)

React 19 + TypeScript 7 (strict) + MUI 9, Swiper (library carousel), Chart.js via react-chartjs-2 (statistics). Built with **Vite**, tested with **Vitest**. One public page, Russian only.

## Structure (`src/`)
| Path | Role |
|---|---|
| `App.tsx` | MUI theme (Merriweather, primary `#212529`, secondary `#4ECCA3`) + `AuthProvider` + `BooksProvider` + `HomePage` |
| `components/<name>/` | One folder per UI block: `<name>.tsx`, and as needed `.hooks.ts` (state + handlers), `.styles.ts` (MUI `styled`/sx), `.constants.ts`, `index.ts` (default export). Re-exported from `components/index.ts` |
| `context/auth-context.tsx` | `user` (from `me()` on mount; `null` = logged out), `isAdmin`, `login()`, `logout()`, `sessionExpired()` (forget the user after a 401 on a write) |
| `context/books-context.tsx` | Loads **all** books once; derives `newBooks`, `currentBook` (first `progress`), `finishedBooks` (sorted by rating desc); `refreshBooks()` refetches after a write |
| `services/api.ts` | `ApiService` over `fetch`, plus function exports the components use. Every non-GET request copies the `XSRF-TOKEN` cookie into header `X-XSRF-TOKEN` (`CSRF_COOKIE` / `CSRF_HEADER`); the session cookie goes along by itself (same-origin `fetch`). Non-2xx → `ApiError` (`status`, ProblemDetail `detail`); empty body → `undefined`. `login()`, `logout()`; `me()` → the user, or `null` on 401 |
| `routes.ts` | `API_ROUTES`, every backend URL (relative `/api/...`) |
| `i18n.ts` + `locales/ru.json` | Own `t('dotted.key', params)` helper; put UI text in `ru.json` |
| `types/index.ts` | `Book`, DTOs, `Statistics`; mirrors the backend contract in [architecture.md](architecture.md) |
| `utils/cover.ts` | `coverSrc(book)`: the cover, or `cover-placeholder.svg` (in `public/`) for a book without `image`. Use it wherever a cover is rendered |
| `test/` | Vitest setup (`setup.ts`: jest-dom, MSW server lifecycle, `matchMedia` stub), MSW `server.ts` (default `GET /api/books`), fixture `books.ts` |

Main flows: library swiper of all books → selection dialog (`new` books; search by tag / title / author, checkboxes, random pick) → random-result dialog → approval dialog → refresh. Statistics dialog toggles count / average rating per tag. The legacy feature list is in [legacy-analysis.md](legacy-analysis.md); results of the parity check are in [migration/04-frontend-vite.md](migration/04-frontend-vite.md).

**Login:** «Войти» / «Выйти» right after «Статистика», in the desktop nav (before the social icons) and in the drawer. There is no «Контакты» button any more (removed 2026-11-01). «Войти» opens `login-dialog` (username + password, a form so Enter submits). A 401 shows «Неверный логин или пароль». **Book selection, «Добавить книгу» and the edit pencils are shown only when `isAdmin`:** the «Выбор книги» and «Добавить книгу» nav items and the current-book «Выбрать книгу» button (props `onOpenBookSelection` / `onOpenAddBook` / `onSelectClick` / `onEdit` are passed as `undefined` to hide them). Browsing and statistics stay public.

**Approval dialog:** asks for the current book's rating (required, 1–10, comma or dot); no password. Confirm → `finishBook` → `startBook`, then `refreshBooks()` (also after a failure, since finish may have succeeded). A 401 (the session is gone) shows «Сессия истекла. Войдите снова.», and `home-page.hooks.ts` calls `sessionExpired()`, which hides selection. Any other error shows a generic message. The hook (`approval-dialog.hooks.ts`) picks the message from the error type.

**Add-book dialog** (`add-book-dialog`, from «Добавить книгу»): title, author, tag («Участник», MUI `Autocomplete freeSolo` with the distinct tags from all books as suggestions), description (`wiki`, multiline). All required and not blank, the same rules as the backend; on submit it highlights blank fields with «Заполните все поля» and makes no call. No cover field until Phase 10. Values are sent trimmed; `home-page.hooks.ts` calls `addBook`, then `refreshBooks()` and closes. 401 → «Сессия истекла…» + `sessionExpired()`, as in the approval dialog; any other error → generic message.

**Edit-book dialog** (`edit-book-dialog`): opened by the pencil (`edit-book-button`, aria-label «Изменить «title»») on the library swiper cards, the current book and the finished books. `home-page.hooks.ts` holds `editingBook` (`null` = closed). Same fields as add (it reuses the `dialogs.addBook.*` labels and the add-dialog styles) plus «Статус» (select) and «Оценка», shown only for «Прочитана» and required 1–10 there (`parseRating` from the approval dialog). The values are sent trimmed as a full `BookDto`, with no `rating` unless finished. «Удалить» switches the actions to an inline confirmation («Да, удалить» / «Нет»), with no browser `confirm()`. After a save or delete: `refreshBooks()` and close. 401 → «Сессия истекла…» + `sessionExpired()`; 409 → «Уже есть текущая книга…»; otherwise a generic message. No cover field until Phase 10.

## Layout notes
- **Navbar:** desktop nav from MUI `lg` (1200px) up, hamburger below. The desktop nav needs ~1150px, so at `md` it squeezed the title. The desktop title has `flexShrink: 0`; the mobile title is 0.9rem on `xs` and wraps on the narrowest phones.
- **Anchors:** the current-book and finished-books sections have `scrollMarginTop: 48px`, so a nav click lands the heading below the fixed navbar (up to 93px tall on desktop). Keep it if the navbar or section spacing changes.

## Dev setup
- `vite.config.ts` proxies `/api` → `http://localhost:8080`.
- Covers: a dev-only plugin (`legacyCovers`) serves the repo-root `public/images/` at `/images` (the `image` field is a relative `images/<file>.jpg`). Delete it when the covers move (Phase 10 into MongoDB, or `frontend/public/images/` at cutover in Phase 11). `vite build` doesn't include covers.
- `index.html` lives in `frontend/` (Vite entry); `public/` holds `manifest.json`, `robots.txt` and `cover-placeholder.svg`.

## Tests
Vitest + React Testing Library + MSW 3, jsdom. Test files sit next to the code (`*.test.ts(x)`); `App.test.tsx` drives the full flows through MSW.
- Auth in `App.test.tsx`: `renderApp({ loggedIn })` installs `mockAuth` (`me` / `login` / `logout` handlers sharing one fake session; login `admin` / `secret`) and waits for «Войти» or «Выйти», so the auth state is settled. A test sets `document.cookie = 'XSRF-TOKEN=…'` to check the CSRF header. An open MUI dialog makes the rest of the page `aria-hidden`, so query the app bar behind it with `{ hidden: true }`.
- MSW 3: the strict option is `onUnhandledFrame: 'error'` (v2's `onUnhandledRequest` is silently ignored). Import `http`, `HttpResponse` from `msw`, `setupServer` from `msw/node`. Add write handlers per test with `server.use(...)`.
- jsdom has no canvas: `statistics-dialog.test.tsx` mocks `react-chartjs-2`'s `Bar` to print labels and values.
- jsdom is pinned to 29: jsdom 30 needs Node ≥ 24.15, the dev machine has 24.14.

## Known gaps
- Starting a book with no book in progress goes through the approval dialog with no fields (just confirm). The club never does this (there's always a current book), so it's untested in the browser.
- Confirm in the selection dialog is **disabled** with 0 books checked; the legacy page showed an error modal «Добавьте книжки для выбора» instead. The `noSelectedError` text is unused.
- Unused `ru.json` keys from before Phase 4: `bookSelection.selectBookButton`, `bookSelection.closeButton`, `bookSelection.confirmMessage`, `randomBook.anotherButton`.
- At a 320px viewport the library heading «Библиотека» (2.5rem) and the swiper slides are wider than the screen, so the page scrolls sideways. 360px and up are fine.
- One JS chunk of ~820 kB (MUI + Chart.js); Vite warns about chunk size. No code splitting yet.

## Commands
Run from `frontend/`: `npm install`, `npm run dev` (Vite dev server, `http://localhost:5173`), `npm run build` (`tsc --noEmit` + `vite build` → `dist/`), `npm test` (Vitest once), `npm run test:watch`, `npm run preview`.
