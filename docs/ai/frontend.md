# Frontend (`frontend/`)

React 18 + TypeScript (strict) + MUI 6, Swiper (library carousel), Chart.js via react-chartjs-2 (statistics). One public page, Russian only. **Still on Create React App** (`react-scripts`), which is deprecated and conflicts with TypeScript 5.9. Phase 4 moves it to Vite + Vitest and React 19; until then it hasn't been built in this repo.

## Structure (`src/`)
| Path | Role |
|---|---|
| `App.tsx` | MUI theme (Merriweather, primary `#212529`, secondary `#4ECCA3`) + `BooksProvider` + `HomePage` |
| `components/<name>/` | One folder per UI block: `<name>.tsx`, and as needed `.hooks.ts` (state + handlers), `.styles.ts` (MUI `styled`/sx), `.constants.ts`, `index.ts` (default export). Re-exported from `components/index.ts` |
| `context/books-context.tsx` | Loads **all** books once; derives `newBooks`, `currentBook` (first `progress`), `finishedBooks` (sorted by rating desc); `refreshBooks()` refetches after a write |
| `services/api.ts` | `ApiService` class over `fetch`, plus function exports the components use; `checkPassword` sends form data |
| `routes.ts` | `API_ROUTES`, every backend URL (relative `/api/...`) |
| `i18n.ts` + `locales/ru.json` | Own `t('dotted.key', params)` helper; put UI text in `ru.json` |
| `types/index.ts` | `Book`, DTOs, `Statistics`; mirrors the backend contract in [architecture.md](architecture.md) |

Main flows: library swiper of `new` books → selection dialog (search, checkboxes, random pick) → approval dialog (rating for the current book + club password) → finish current, start chosen → refresh. Statistics dialog toggles count / average rating per tag. The full checklist of features the new UI must match is in [legacy-analysis.md](legacy-analysis.md).

## Known gaps (fixed in Phase 4)
- **Broken against the current backend until Phase 4:** the backend now needs header `X-Club-Password` on every write and on `check-password` (see the Auth note in [architecture.md](architecture.md)). The UI sends no header and posts `check-password` as form data, so all its writes get 401.
- `finishBook` sends `rating ?? 0` → the backend rejects 0 (400).
- `request()` calls `response.json()` on every response, so it throws on the empty `DELETE` body.
- Errors are reduced to `HTTP error! status: N`; the UI only checks `response.ok`.
- Tests: only the CRA placeholder `App.test.js` ("learn react" link), which would fail against the real page.

## Commands (CRA, until Phase 4)
`npm install`, `npm start` (dev server; `proxy` in `package.json` forwards `/api` to `http://localhost:8080`), `npm run build`, `npm test`.
