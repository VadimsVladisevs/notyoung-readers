# Phase 4 — Frontend: CRA → Vite, React 19, password header, tests

Part of [PLAN.md](PLAN.md). Status: ☑ (done 2026-10-31)

## Goal
Move `frontend/` from deprecated Create React App to Vite + Vitest, upgrade the libraries, make the UI work against the Phase 3 backend (password header, rating, empty DELETE body), add real component tests, and check parity with the legacy `index.html`.
Done when `npm run build` + `npm test` are green and the parity check below is complete. Results go here: `legacy-analysis.md` is a snapshot and stays unchanged.

## Decisions (2026-10-31)
- **Password:** asked every time in the approval dialog, kept only in dialog state (no storage). Phase 9 replaces it.
- **Start with no current book:** out of scope. The club always has a book in progress. It couldn't stay exactly as it was (`startBook` now needs the password), so it opens the same approval dialog with only the password field. This needed less code than before. Listed as a known gap in `frontend.md`.
- **Dev covers:** a dev-only Vite plugin serves repo-root `../public/images` at `/images`. It goes away at cutover (Phase 7), when the images move to `frontend/public/images/`.
- **Dead code removed:** `ConfirmBookDialog`, `SelectionConfirmDialog`, `setCurrentBook` (no-op), `useHomePage.handleFinishBook`, confirm-dialog state in `useCurrentBook`, `web-vitals`, CRA leftovers (`react-app-env.d.ts`, `setupTests.js`, `App.test.js`, `eslintConfig`, `browserslist`, `proxy`). API methods that match real endpoints stay.
- **Versions:** latest stable on 2026-10-31. Node 24 (legacy `.nvmrc`), Vite 8, Vitest 5, React 19.3, MUI 9, Swiper 14, Chart.js 4.6 / react-chartjs-2 5.3, MSW 3. **TypeScript 7.0**, not 5.9 as first written, because it's the latest stable release.

## Tasks
- [x] **1. Sub-plan + PLAN.md row** → ◐.
- [x] **2. Vite migration:** drop `react-scripts`; `index.html` at `frontend/`; `vite.config.ts` (react plugin, `/api` proxy → `:8080`, dev covers plugin, Vitest config); `tsconfig.json` for bundler resolution; scripts `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `test`.
- [x] **3. Upgrades:** React 19, MUI, Swiper, Chart.js; fix breakages; `InputProps` → `slotProps.input`.
- [x] **4. CSS:** `@import` lines first in `index.css`; no duplicate Merriweather import in `App.css`.
- [x] **5. API:** `X-Club-Password` on writes; `Content-Type` only with a body; empty body → `undefined`; `ApiError` with `status`; `checkPassword` via header; no rating `?? 0`.
- [x] **6. Approval flow:** rating required (1–10, comma or dot); check password → finish → start with the password; wrong password message; generic error otherwise.
- [x] **7. Cleanup:** dead code above; `manifest.json` with the club's name and colours.
- [x] **8. Tests** (Vitest + React Testing Library + MSW): `api.ts`, `books-context`, approval dialog, selection dialog, statistics toggle, `App` smoke render.
- [x] **9. Parity check** against the legacy page.
- [x] **10. Docs:** `update-ai-docs` (`frontend.md`, `architecture.md`, `workflow.md`); decision log; PLAN.md row ☑.

## Findings
- **TypeScript 7** (native compiler) works with this setup. The only tsc errors after the upgrade came from MUI 9: `TextField` `InputProps` removed (→ `slotProps.input`), and `Box` system props like `textAlign` removed (→ `sx`).
- **jsdom 30** needs Node ≥ 24.15; the machine has 24.14.1 (legacy `.nvmrc`). jsdom is pinned to `^29`.
- **MSW 3** renamed `onUnhandledRequest` to `onUnhandledFrame`. The old name is silently ignored, so unhandled requests only warn. `tsc` caught it.
- jsdom lacks `window.matchMedia` (Swiper needs it); stubbed in `src/test/setup.ts`.
- The Font Awesome `@import` in `index.css` came after rules, so browsers ignored it. The Discord icon only showed via the kit script in `index.html`. Both sources are kept.
- `useCurrentBook` (`current-book.hooks.ts`) was never imported, so the whole hook was dead.
- **Backend:** `POST /api/books/add` requires `wiki`, but 4 of the 9 books in the local `readersDB` have none (legacy `wiki` is optional). Not fixed here; decide before images/add-book work (Phase 8).
- **Data:** the local `readersDB` has **2** books in `progress`, and «Приют Грез» three times (new / progress / finished). The UI shows the first `progress` book as current. Check prod in Phase 7's data check.
- A mutation check (password header removed in `api.ts`) fails 5 tests, so the header is really covered.

## Parity check (task 9)
Done on 2026-10-31 without a browser (the Chrome extension wasn't connected): backend on `:8090` against a throwaway `mongo:8.0`, seeded from the local API (read-only GET); Vite with `/api` proxied to it.
- Through the Vite proxy: page 200; covers served from `../public/images`; nothing outside `frontend/` served. `check-password` wrong → 401, right → 200; finish without the header → 401; rating 0 → 400; finish 8.50 → `finished`; start → `progress`; random → a `new` book.
- Component tests cover: `new`-only selection list, tag / title filters, checkbox count, pick among checked, random via the backend with no ids, rating rules, wrong password, finish → start order with the header, generic error, statistics count / rating values.
- **Browser walk-through** (Chrome, same setup), legacy checklist in [legacy-analysis.md](../legacy-analysis.md):
  - [x] Fixed dark navbar: title, anchors Библиотека / Выбранная книга / Прочитанные книжки (smooth scroll to `#library`, `#in-progress`, `#finished-books`)
  - [x] Navbar buttons Выбор книги / Статистика; social icons Discord / Facebook / Miro open in a new tab; Discord icon renders
  - [x] Library swiper of all books (cover, title, author), loop, 5 per view at ≥ 1280px; vertical at 700px and 400px, with the hamburger menu
  - [x] Current book: "author. title", wiki text, cover
  - [x] Finished list: rating desc, numbered, alternating image side, wiki, «Оценка клуба - N»
  - [x] Selection dialog: `new` books only, search with filter, checkboxes, count badge; random-result dialog → approve dialog
  - [x] Approve dialog: rating (comma) + code; wrong code → «Неправильный пароль!»; right code → current finished with 7.5, chosen book started, page data refreshed
  - [x] Statistics: horizontal bars per tag; tooltip lists books, ratings, average; toggle Количество / Рейтинг
  - [x] Footer «© Copyright <year> Reader's club»; no console errors, no broken images
- **Deviations from legacy (accepted):** Confirm with 0 checked is disabled instead of the error modal; after confirming, the page refreshes its data instead of reloading; footer shows the current year instead of 2022; the swiper shows 1–5 books per view depending on width instead of a fixed 5.
- **Visual fixes after the walk-through:**
  - Navbar title was clipped (closing quote at 1400px, «НЕЮНЫЙ ЧИТ» at 400px; at 1000px it shrank to 109px). The desktop nav needs ~1150px, so the desktop/hamburger switch moved from `md` (900px) to `lg` (1200px). The desktop title doesn't shrink; the mobile title is 0.9rem and wraps at 320px. Checked at 320–1366px: no clipping, no toolbar overflow.
  - Section headings were hidden under the fixed navbar after an anchor click: `scrollMarginTop: 48px` on current-book and finished-books. The heading now sits at 112px, below the 93px navbar.
- **Not fixed:** at a 320px viewport the library heading and swiper slides overflow sideways (from before Phase 4; 360px+ fine).

## Verify
- [x] `npm run build` and `npm test` green (19 tests).
- [x] API flows through the dev proxy (see Parity check). Rating rules, wrong password, statistics toggle and random pick are covered by tests.
- [x] Visual parity walk-through in a browser (list above).
