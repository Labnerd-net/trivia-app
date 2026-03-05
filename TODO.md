# TODO

- [ ] **Duplicate `shuffleAnswers` tests** — `tests/Question.test.ts` and `tests/utils.test.ts` cover the same two cases. Remove `Question.test.ts` or consolidate into `utils.test.ts`.

- [ ] **`window.scrollTo` warning in test output** — jsdom doesn't implement `window.scrollTo`, producing a console warning on every Quiz test run. Add a vitest setup file with a mock to silence it.

- [ ] **`ErrorBoundary` has no error logging** — `componentDidCatch` is not implemented, so caught render crashes are silently swallowed with no console output or reporting hook.
