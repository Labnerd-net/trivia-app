# Spec for Test Coverage Gaps

Title: Test Coverage Gaps
Branch: claude/feature/test-coverage-gaps
Spec file: context/specs/test-coverage-gaps.md

## Summary

Backlog #29 identified four test coverage gaps: `App.tsx`, `Navbar.tsx`, `ErrorBoundary.tsx`, and the Menu → Quiz integration flow. Since the backlog was generated, `App.tsx` and `ErrorBoundary.tsx` have been fully covered by new tests. Two gaps remain:

1. **`Navbar.tsx`** — no tests exist. The component is trivial (brand link only), so value is low but coverage is straightforward.
2. **Menu → Quiz integration** — no test exercises the full user flow: fill the form in Menu, submit, and confirm the app navigates to the Quiz route with the correct params. Current tests mock navigation and test each page in isolation.

## Functional Requirements

- Add a test file for `Navbar.tsx` covering its rendered output and link behavior.
- Add an integration test (or extend `Menu.page.test.tsx`) that:
  - Renders the full form in Menu with mocked provider data
  - Simulates user selecting a category, difficulty, and type, then submitting
  - Asserts that `navigate` is called with the correct `/quiz/:categoryId/:difficulty/:type/` path

## Possible Edge Cases

- Navbar uses `react-router`'s `Link` — tests need a `MemoryRouter` wrapper.
- The integration test must mock `useProvider` to supply a provider and categories, then verify the navigate call includes the correct route params.
- Provider switching in the integration context (selecting a different provider tab resets the category) is out of scope for this item.

## Acceptance Criteria

- `tests/Navbar.component.test.tsx` exists with at least: renders the brand text, renders a link to `/`.
- An integration-style test exists that mounts Menu with real form interactions and asserts `navigate` is called with the expected quiz URL.
- All existing 73 tests continue to pass.
- `npm run build` passes with no errors.

## Open Questions

- Should the Menu → Quiz test live in `Menu.page.test.tsx` (extended) or a separate `integration/` file? Keeping it in the existing page test file is simpler; a separate folder signals intent better. Recommend extending `Menu.page.test.tsx` unless the project grows to need an `integration/` folder.

## Testing Guidelines

- `tests/Navbar.component.test.tsx`:
  - Renders the nav with a `MemoryRouter` wrapper
  - Asserts brand text "TRIVIA CHALLENGE" is present
  - Asserts the link's `href` is `/`
- `tests/Menu.page.test.tsx` (new test block):
  - Renders Menu with mocked `useProvider` returning categories, difficulties, and types
  - Selects a category from the dropdown
  - Clicks Submit
  - Asserts `mockNavigate` was called with a URL matching `/quiz/<categoryId>/all/all/`

## Personal Opinion

This is a straightforward cleanup item — no design decisions, just filling coverage gaps the auditor flagged. The Navbar test is low-value (the component has one line of logic), but it costs almost nothing and prevents silent regressions. The Menu → Quiz integration test has real value: it catches route param construction bugs that unit tests miss. Worth doing.

Not complex. Estimated 2–3 new tests total.
