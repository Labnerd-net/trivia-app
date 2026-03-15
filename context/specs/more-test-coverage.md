# Spec for more-test-coverage

branch: claude/feature/more-test-coverage

## Summary

Expand the test suite beyond pure utility functions to cover component rendering and page-level fetch logic. Current tests (`Question.test.ts`, `providers.test.ts`, `utils.test.ts`) only exercise `shuffleAnswers`, `decodeHtml`, and the provider registry. No tests exist for the `Question` component's UI behaviour or the async fetch logic in `Menu` and `Quiz`.

## Functional Requirements

- Add component tests for `Question.tsx` covering render output and interactive state.
- Add page-level tests for `Menu.tsx` covering category fetch, form population, and navigation on submit.
- Add page-level tests for `Quiz.tsx` covering question fetch, error state, retry, and "Next Questions" pagination.
- All new tests must integrate with the existing Vitest setup without new tooling unless required.
- Tests that involve React rendering must use a DOM testing library (e.g. `@testing-library/react`).
- Async fetch logic must be tested with mocked HTTP calls — do not make real network requests in tests.

## Possible Edge Cases

- `Question.tsx` — HTML-encoded strings from OpenTDB must be decoded before rendering; test that `decodeHtml` output appears in the DOM.
- `Question.tsx` — Answer shuffle is random; tests must assert presence of answers without relying on order.
- `Quiz.tsx` — AbortController cancellation on unmount should not trigger an error state update.
- `Quiz.tsx` — "Next Questions" button should be disabled while a fetch is in flight to prevent double-clicks.
- `Menu.tsx` — Provider change resets form fields (category, difficulty, type) to the new provider's defaults.
- `Menu.tsx` — If the categories fetch fails, the error state is shown and no form is rendered.

## Acceptance Criteria

- `Question` component: renders question text, renders all shuffled answers, toggling "Reveal Answer" applies `correct` and `revealed-wrong` CSS classes to the appropriate answer elements.
- `Menu` page: renders a loading state initially, populates category/difficulty/type selects on successful fetch, shows an error message on fetch failure, and calls `navigate` with the correct path on form submit.
- `Quiz` page: renders a loading state initially, renders the correct number of `Question` components on successful fetch, shows an error message and a Retry button on fetch failure, and clicking Retry triggers a new fetch.
- No real network requests are made; all `axios` or `fetch` calls are mocked.
- All new tests pass under `npm run test` (or `npx vitest`).

## Open Questions

- Is `@testing-library/react` already installed, or does it need to be added as a dev dependency? - I don't think it is installed
- Should `jsdom` be configured in `vitest.config.ts` as the test environment, or is `happy-dom` preferred? - I have never heard of either of those, so I do not know.
- Are snapshot tests acceptable, or should all assertions be explicit DOM queries? - whatever you this is best

## Testing Guidelines

Create test files in the `./tests` folder. Suggested files: `tests/Question.component.test.tsx`, `tests/Menu.page.test.tsx`, `tests/Quiz.page.test.tsx`. Create meaningful tests for the following cases, without going too heavy:

- `Question`: renders question text correctly (including HTML-decoded content)
- `Question`: all answer options are present in the DOM
- `Question`: answers are hidden before reveal, shown after clicking "Reveal Answer"
- `Question`: correct answer receives `correct` class after reveal; incorrect answers receive `revealed-wrong`
- `Menu`: shows loading state before fetch resolves
- `Menu`: populates selects with categories returned by the provider
- `Menu`: shows error message when fetch rejects
- `Menu`: navigates to the correct quiz route on form submit
- `Quiz`: shows loading state before fetch resolves
- `Quiz`: renders 10 `Question` components after successful fetch
- `Quiz`: shows error message and Retry button when fetch rejects
- `Quiz`: clicking Retry triggers a new fetch

## Personal Opinion

This is a good and overdue improvement. The current test suite gives a false sense of coverage — the component that users actually interact with (`Question`) is untested at the render level, and both async pages (`Menu`, `Quiz`) have zero test coverage for their core behaviour.

The main concern is setup cost: if `@testing-library/react` and a jsdom environment are not yet configured, there's a small but non-trivial amount of scaffolding to do before writing any test. That shouldn't block the work, but it should be scoped into the task so it isn't a surprise. The tests themselves are straightforward once the harness is in place.
