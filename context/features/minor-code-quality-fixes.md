# Plan: Minor Code Quality Fixes (Backlog #11, #14, #17, #18, #19)

## Context

Five small, independent cleanup items from the backlog. All are non-behavioral refactors — no new features, no logic changes. Goal is to reduce noise: dead code, shadowing, duplicated string literals, and a redundant ref.

---

## Changes

### #14 — Remove `handleCategorySelect` wrapper (`App.tsx`)

`App.tsx:13-15` defines a one-liner arrow function that only calls `setCategory(cat)`. Pass `setCategory` directly as the prop.

- Remove the `handleCategorySelect` declaration (lines 13-15)
- Change `<Menu setCategory={handleCategorySelect} />` → `<Menu setCategory={setCategory} />`
- Also remove the unused `Category` type import if `handleCategorySelect` was its only use (check: `useState<Category | null>` still needs it — keep import)

---

### #17 — Fix shadowed `data` variables in map callbacks (`Menu.tsx`)

Three `.map()` callbacks use `data` as the iterator variable, shadowing the outer `data` from `useFetch`. Rename:

- `categories.map((data) =>` → `categories.map((cat) =>`  (line 99, update `data.id`, `data.name` → `cat.id`, `cat.name`)
- `provider.difficulties.map((data) =>` → `provider.difficulties.map((opt) =>`  (line 113, update `data.value`, `data.label` → `opt.value`, `opt.label`)
- `provider.types.map((data) =>` → `provider.types.map((opt) =>`  (line 127, update same)

---

### #18 — Centralize `useFetch` error message strings

Create `src/constants/errorMessages.ts`:
```ts
export const ERROR_FETCH_CATEGORIES = 'Failed to retrieve Categories';
export const ERROR_FETCH_QUESTIONS = 'Failed to retrieve Questions';
```

Import in:
- `Menu.tsx`: replace inline string at `useFetch` call site with `ERROR_FETCH_CATEGORIES`
- `Quiz.tsx`: replace inline string at `useFetch` call site with `ERROR_FETCH_QUESTIONS`

---

### #19 — Switch provider objects to `satisfies Provider` (`providers.ts`)

Both provider objects already have `: Provider` annotations. Change each to use `satisfies` instead, which preserves the concrete inferred type while still enforcing the interface contract.

`const openTDBProvider: Provider = { ... };`
→ `const openTDBProvider = { ... } satisfies Provider;`

Same for `triviaAPIProvider`. The `providers` registry (`Record<string, Provider>`) accepts `Provider`-compatible values, so this is compatible.

---

### #11 — Remove dead `paginationControllerRef` (`Quiz.tsx`)

The `isFetching` guard at the top of `nextQuestions` already prevents concurrent pagination requests. The ref's abort is never triggered against a real in-flight request.

- Remove `useRef` from the React import (it has no other uses in the file)
- Remove `const paginationControllerRef = useRef<AbortController | null>(null);` (line 19)
- Inside `nextQuestions`, remove:
  - `paginationControllerRef.current?.abort();`
  - `const controller = new AbortController();`
  - `paginationControllerRef.current = controller;`
- Remove `signal: controller.signal` from the `provider.getQuestions(...)` call (or omit the `signal` key entirely — `signal` is optional in `GetQuestionsOptions`)

---

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Remove `handleCategorySelect`, pass `setCategory` directly |
| `src/pages/Menu.tsx` | Rename shadowed map variables; import error constant |
| `src/pages/Quiz.tsx` | Import error constant; remove ref and abort logic |
| `src/api/providers.ts` | Switch to `satisfies Provider` syntax |
| `src/constants/errorMessages.ts` | **New file** — two named string exports |

---

## Verification

1. `npm run build` — must pass with zero errors
2. Run existing test suite — all 69 tests must pass
3. Manual browser check:
   - Menu loads categories, difficulties, types correctly
   - "Next Questions" in Quiz still fetches a new set without errors
