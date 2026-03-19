# Plan: Route Param Injection Guard

## Context

Route params `categoryID`, `difficulty`, and `type` from `useParams()` in `Quiz.tsx` are passed directly to `provider.getQuestions()`, which interpolates them into API URLs without sanitization. React Router's `useParams()` decodes percent-encoded characters, so a crafted URL like `/quiz/9%26token%3Dinjected/easy/multiple` yields `categoryID = "9&token=injected"`, injecting extra query parameters into the outbound API request. The fix validates all three params against allowlists before any fetch occurs.

---

## Approach

Validate params in `Quiz.tsx` inside the `fetchQuestions` useCallback — throw immediately if any param is invalid. `useFetch` already catches thrown errors and surfaces them through the existing error UI, so no new state or components are needed.

**Validation rules:**
- `difficulty`: must be in `provider.difficulties.map(d => d.value)` (e.g. `"all"`, `"easy"`, `"medium"`, `"hard"`)
- `type`: must be in `provider.types.map(t => t.value)` (e.g. `"all"`, `"multiple"`, `"boolean"`)
- `categoryId`: must match `/^[a-z0-9_]*$/i` — allows numeric IDs (`"9"`), slugs (`"arts_and_literature"`), and `"all"`, while rejecting `&`, `=`, `#`, `%`, etc.

---

## Files to Modify

### `src/pages/Quiz.tsx`

Add param validation at the top of `fetchQuestions` (before the provider call). If any check fails, throw `new Error('Invalid quiz parameters.')`.

Placement — add before the existing `useCallback` body that calls `provider.getQuestions`:

```
const fetchQuestions = useCallback(
  (signal: AbortSignal) => {
    // NEW: validate before fetch
    const validDifficulties = provider.difficulties.map(d => d.value);
    const validTypes = provider.types.map(t => t.value);
    if (
      !/^[a-z0-9_]*$/i.test(categoryID ?? '') ||
      (difficulty && !validDifficulties.includes(difficulty)) ||
      (type && !validTypes.includes(type))
    ) {
      throw new Error('Invalid quiz parameters.');
    }
    return provider.getQuestions({ amount, categoryId: categoryID, difficulty, type, token, signal });
  },
  [provider, categoryID, difficulty, type, token]
)
```

No changes needed to `nextQuestions` — it uses the same params and will also reject on the next page attempt (acceptable; crafted URLs won't reach a valid first load anyway).

### `tests/Quiz.page.test.tsx`

Add a `renderQuizWith(path)` helper that accepts a custom route path, then add 4 test cases:

1. **Injected categoryId** — path `/quiz/9%26token%3Dinjected/easy/multiple/` → shows `'Invalid quiz parameters.'`, `getQuestions` never called
2. **Invalid difficulty** — path `/quiz/9/legendary/multiple/` → shows `'Invalid quiz parameters.'`, never called
3. **Invalid type** — path `/quiz/9/easy/essay/` → shows `'Invalid quiz parameters.'`, never called
4. **`"all"` params pass** — path `/quiz/all/all/multiple/` → `getQuestions` IS called (validate nothing is broken for "all")

---

## Verification

1. `npm run build` — must pass with no type errors
2. Run `npm test` — all existing 65 tests plus 4 new ones must pass
3. Manual: craft a URL like `http://localhost:3000/quiz/9%26token%3Dinjected/easy/multiple/` in the dev server — should show "Invalid quiz parameters." error, not load questions
4. Manual: normal quiz flow still works end-to-end
