# Plan: Category Context Refactor (Backlog #13)

## Context

`category` state lives in `App.tsx` and is prop-drilled in two directions: `setCategory` callback down to `Menu.tsx`, and `category` value down to `Quiz.tsx`. This is inconsistent with how `provider` and `token` are managed — both live in `ProviderContext` and are consumed via `useProvider()`. Moving `category` into `ProviderContext` eliminates the prop-drilling and makes `App.tsx` a clean shell with no state of its own.

On the open question: **yes, reset `category` to `null` on provider switch.** Category objects from OpenTDB are not valid for The Trivia API. Carrying a stale category across a provider switch would show a wrong name in the stats bar. The reset is one line inside the existing `setSelectedProvider` callback.

---

## Files to Modify

### 1. `src/context/ProviderContext.tsx`

- Add `Category` to the import from `'../types'`
- Add to `ProviderContextValue` interface:
  ```
  category: Category | null;
  setCategory: (cat: Category | null) => void;
  ```
- Add inside `ProviderProvider`:
  ```
  const [category, setCategory] = useState<Category | null>(null);
  ```
- Inside the `setSelectedProvider` useCallback, add `setCategory(null)` alongside the existing state resets
- Add `category` and `setCategory` to the `contextValue` useMemo array and object

### 2. `src/App.tsx`

- Remove `useState` import (no longer needed)
- Remove `Category` type import
- Remove `const [category, setCategory] = useState<Category | null>(null);`
- Remove `setCategory={setCategory}` prop from `<Menu>`
- Remove `category={category}` prop from `<Quiz>`

### 3. `src/pages/Menu.tsx`

- Remove `MenuProps` interface
- Remove `{ setCategory }` from the function signature (no props)
- Add `setCategory` to the `useProvider()` destructure call

### 4. `src/pages/Quiz.tsx`

- Remove `QuizProps` interface
- Remove `{ category }` from the function signature (no props)
- Add `category` to the `useProvider()` destructure call
- Remove `Category` from the type import (only used in the now-deleted interface)

---

## Test Updates

### `tests/Quiz.page.test.tsx`

- Update `useProvider` mock to include `category: null, setCategory: vi.fn()`
- In `renderQuiz`, change `element={<Quiz category={null} />}` → `element={<Quiz />}`

### `tests/Menu.page.test.tsx`

- Update `useProvider` mock to include `setCategory: vi.fn()`
- In `renderMenu`, remove the local `vi.fn()` for `setCategory` and remove `setCategory={setCategory}` from `<Menu />`
- Remove the `return { setCategory }` — no callers depend on it (no tests assert on `setCategory`)

### `tests/ProviderContext.test.tsx`

Add 3 new tests inside the existing `describe('ProviderProvider')` block:
1. `category` is `null` by default
2. `setCategory` updates the `category` value
3. Switching provider resets `category` to `null`

---

## Verification

1. `npm run build` — must pass with no TypeScript errors
2. `npm test` — all existing tests pass; 3 new context tests added (total +3)
3. Manual browser check: start a quiz, confirm category name appears in the stats bar; switch provider on Menu, confirm no stale category carries over
