# Frontend (`frontend/`)

React 19 + TypeScript 7 (strict) + MUI 9, Swiper (library carousel), Chart.js via react-chartjs-2 (statistics). Built with **Vite**, tested with **Vitest**. One public page, Russian only.

## Structure (`src/`)
| Path | Role |
|---|---|
| `App.tsx` | MUI theme (Merriweather, primary `#212529`, secondary `#4ECCA3`) + `BooksProvider` + `HomePage` |
| `components/<name>/` | One folder per UI block: `<name>.tsx`, and as needed `.hooks.ts` (state + handlers), `.styles.ts` (MUI `styled`/sx), `.constants.ts`, `index.ts` (default export). Re-exported from `components/index.ts` |
| `context/books-context.tsx` | Loads **all** books once; derives `newBooks`, `currentBook` (first `progress`), `finishedBooks` (sorted by rating desc); `refreshBooks()` refetches after a write |
| `services/api.ts` | `ApiService` over `fetch`, plus function exports the components use. Writes take the club password and send it as `X-Club-Password`; non-2xx → `ApiError` (`status`, ProblemDetail `detail`); empty body → `undefined`; `checkPassword()` → `true` / `false` on 401 |
| `routes.ts` | `API_ROUTES`, every backend URL (relative `/api/...`) |
| `i18n.ts` + `locales/ru.json` | Own `t('dotted.key', params)` helper; put UI text in `ru.json` |
| `types/index.ts` | `Book`, DTOs, `Statistics`; mirrors the backend contract in [architecture.md](architecture.md) |
| `test/` | Vitest setup (`setup.ts`: jest-dom, MSW server lifecycle, `matchMedia` stub), MSW `server.ts` (default `GET /api/books`), fixture `books.ts` |

Main flows: library swiper of all books → selection dialog (`new` books; search by tag / title / author, checkboxes, random pick) → random-result dialog → approval dialog → refresh. Statistics dialog toggles count / average rating per tag. The legacy feature list is in [legacy-analysis.md](legacy-analysis.md); results of the parity check are in [migration/04-frontend-vite.md](migration/04-frontend-vite.md).

**Approval dialog:** asks for the current book's rating (required, 1–10, comma or dot) and the club password, every time; the password lives only in dialog state. Confirm → `checkPassword` → `finishBook` → `startBook`, then `refreshBooks()` (also after a failure, since finish may have succeeded). A 401 shows «Неправильный пароль!»; any other error a generic message. The hook (`approval-dialog.hooks.ts`) picks the message from the error type; `home-page.hooks.ts` just throws.

## Layout notes
- **Navbar:** desktop nav from MUI `lg` (1200px) up, hamburger below. The desktop nav needs ~1150px, so at `md` it squeezed the title. The desktop title has `flexShrink: 0`; the mobile title is 0.9rem on `xs` and wraps on the narrowest phones.
- **Anchors:** the current-book and finished-books sections have `scrollMarginTop: 48px`, so a nav click lands the heading below the fixed navbar (up to 93px tall on desktop). Keep it if the navbar or section spacing changes.

## Dev setup
- `vite.config.ts` proxies `/api` → `http://localhost:8080`.
- Covers: a dev-only plugin (`legacyCovers`) serves the repo-root `public/images/` at `/images` (the `image` field is a relative `images/<file>.jpg`). Delete it at cutover (Phase 7), when the images move to `frontend/public/images/`. `vite build` doesn't include covers.
- `index.html` lives in `frontend/` (Vite entry); `public/` holds `manifest.json` and `robots.txt`.

## Tests
Vitest + React Testing Library + MSW 3, jsdom. Test files sit next to the code (`*.test.ts(x)`); `App.test.tsx` drives the full flows through MSW.
- MSW 3: the strict option is `onUnhandledFrame: 'error'` (v2's `onUnhandledRequest` is silently ignored). Import `http`, `HttpResponse` from `msw`, `setupServer` from `msw/node`. Add write handlers per test with `server.use(...)`.
- jsdom has no canvas: `statistics-dialog.test.tsx` mocks `react-chartjs-2`'s `Bar` to print labels and values.
- jsdom is pinned to 29: jsdom 30 needs Node ≥ 24.15, the dev machine has 24.14.

## Known gaps
- Starting a book with no book in progress goes through the approval dialog with only the password field. The club never does this (there's always a current book), so it's untested in the browser.
- Confirm in the selection dialog is **disabled** with 0 books checked; the legacy page showed an error modal «Добавьте книжки для выбора» instead. The `noSelectedError` text is unused.
- Unused `ru.json` keys from before Phase 4: `bookSelection.selectBookButton`, `bookSelection.closeButton`, `bookSelection.confirmMessage`, `randomBook.anotherButton`.
- At a 320px viewport the library heading «Библиотека» (2.5rem) and the swiper slides are wider than the screen, so the page scrolls sideways. 360px and up are fine.
- One JS chunk of ~750 kB (MUI + Chart.js); Vite warns about chunk size. No code splitting yet.

## Commands
Run from `frontend/`: `npm install`, `npm run dev` (Vite dev server, `http://localhost:5173`), `npm run build` (`tsc --noEmit` + `vite build` → `dist/`), `npm test` (Vitest once), `npm run test:watch`, `npm run preview`.
