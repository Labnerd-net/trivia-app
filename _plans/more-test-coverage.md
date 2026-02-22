# Plan: More Test Coverage

## Context

The existing test suite (`tests/Question.test.ts`, `tests/utils.test.ts`, `tests/providers.test.ts`) only covers pure utility functions and the provider registry. No tests exist for the React components or the async fetch logic in the page-level components. This plan adds component and page-level tests without requiring any new dependencies.

## Key Finding: No Dependency Changes Needed

All required tooling is already installed and configured:
- `@testing-library/react@^16.3.2` — installed
- `jsdom@^28.1.0` — installed
- `vite.config.ts` already sets `environment: 'jsdom'` and `globals: true`

## Files to Create

### 1. `tests/Question.component.test.tsx`

The `Question` component (`src/components/Question.tsx`) has no routing dependencies, so no router wrapper is needed. Mock strategy: none required — the component uses only `decodeHtml` and `shuffleAnswers` from `src/utils`, both of which work correctly in jsdom.

Tests to write:
- Renders question text (plain string)
- Renders decoded HTML-encoded question text (e.g. `&amp;` → `&`)
- Renders question number chip when `number` prop is provided
- Does not render number chip when `number` prop is omitted
- All 4 answer options are present in the DOM for a multiple choice question
- Button initially reads "Reveal Answer"
- After clicking "Reveal Answer": button reads "Hide Answer", correct answer `div` has class `correct`, incorrect answers have class `revealed-wrong`
- Clicking "Hide Answer" removes the reveal classes and restores button text

### 2. `tests/Menu.page.test.tsx`

`Menu` uses `useNavigate` (react-router) and `getProvider`/`providerList` (providers module). Both must be mocked.

Mock strategy:
```typescript
vi.mock('../src/api/providers', () => ({
  getProvider: vi.fn(() => mockProvider),
  providerList: [{ id: 'opentdb', name: 'OpenTDB' }],
}))
```
Where `mockProvider` has `getCategories` returning a resolved promise with a fixture category array, and `difficulties`/`types` arrays with one entry each.

Wrap renders in `<MemoryRouter>` from `react-router` (already installed).

Use `waitFor` / `findByText` from `@testing-library/react` to handle async state updates.

Tests to write:
- Shows "Loading categories..." immediately on render
- After fetch resolves: populates the category `<select>` with the mock categories
- After fetch resolves: renders the form (category, difficulty, type selects)
- After fetch rejects (non-cancel error): shows "Failed to retrieve Categories"
- Submitting the form calls `navigate` with the correct URL path (`/quiz/{category}/{difficulty}/{type}/`)

### 3. `tests/Quiz.page.test.tsx`

`Quiz` uses `useParams` and `useNavigate` (react-router) and `getProvider` (providers module).

Mock strategy: same `vi.mock('../src/api/providers', ...)` pattern, with `getQuestions` returning a promise resolving to `{ results: [...10 NormalizedQuestion fixtures...] }`.

Route params (`categoryID`, `difficulty`, `type`) must be supplied via a real router wrapper — use `MemoryRouter` + `Routes` + `Route`:
```tsx
<MemoryRouter initialEntries={['/quiz/9/easy/multiple/']}>
  <Routes>
    <Route path="/quiz/:categoryID/:difficulty/:type/" element={<Quiz ... />} />
  </Routes>
</MemoryRouter>
```

Tests to write:
- Shows "Loading questions..." immediately on render
- After fetch resolves: renders 10 `Question` components (check for 10 question text elements)
- After fetch rejects: shows "Failed to retrieve Questions" and a "Retry" button
- Clicking "Retry" triggers a second call to `getQuestions`
- "Next Questions" button is `disabled` while fetching

## Mocking Approach Rationale

- Use `vi.mock()` at the module level for `../src/api/providers` — this avoids real HTTP calls and gives precise control over what the components receive.
- Do **not** mock axios directly; mocking the provider module is cleaner and tests the components at the right boundary.
- Use `fireEvent.click` from `@testing-library/react` for button interactions — `@testing-library/user-event` is not installed and `fireEvent` is sufficient for these cases.
- Use explicit DOM queries (`getByText`, `findByText`, `getByRole`) rather than snapshots — easier to maintain and more readable.

## Assertion Style

Avoid snapshots. Use:
- `screen.getByText(...)` / `screen.findByText(...)` for async
- `element.className` or `classList.contains(...)` for CSS class assertions
- `expect(mockFn).toHaveBeenCalledTimes(n)` for call count checks

## Critical Files

- `tests/Question.component.test.tsx` — new file
- `tests/Menu.page.test.tsx` — new file
- `tests/Quiz.page.test.tsx` — new file
- `vite.config.ts` — read-only reference; no changes needed
- `src/components/Question.tsx` — read-only reference
- `src/pages/Menu.tsx` — read-only reference
- `src/pages/Quiz.tsx` — read-only reference
- `src/api/providers.ts` — will be mocked in tests, not modified

## Verification

Run `npm run test` after writing each file. All tests should pass with no real network calls. If a test fails due to act() warnings, wrap state-updating interactions in `act()` or switch to `await findBy*` queries.
