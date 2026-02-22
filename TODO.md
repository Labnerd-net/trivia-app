# TODO

- [x] **Navbar uses `<a href>` instead of `<Link>`** — `Navbar.tsx:5` triggers a full page reload on click, losing all React state (token, selected category). Replace with React Router's `<Link to="/">`.

- [ ] **OpenTDB response codes have no unit tests** — The code 1–5 error throwing added to `providers.ts` is untested. A regression there would be silent.

- [ ] **Menu retry button has no test** — `Menu.page.test.tsx` predates the retry button; it only asserts the error message appears, not that retry triggers a re-fetch.

- [ ] **`shuffleAnswers` has no direct unit tests** — Exercised indirectly through `Question.component.test.tsx` but the boolean path and shuffle behavior are not covered in `utils.test.ts`.
