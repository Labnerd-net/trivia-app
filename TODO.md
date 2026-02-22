# TODO

- [x] **Menu error state missing retry button** — `Menu.tsx:80` shows only the error text with no retry action. `App.tsx` and `Quiz.tsx` both have Retry buttons; Menu should be consistent.

- [x] **OpenTDB response codes not handled** — The OpenTDB API returns a `response_code` in every response (0=success, 1=no results, 4=token exhausted, etc.). `providers.ts:40` ignores it. A token-exhausted session silently returns an empty list.

- [x] **`App.tsx` has no test coverage** — Token fetch, provider switching, and the retry flow in `App.tsx` are untested.
