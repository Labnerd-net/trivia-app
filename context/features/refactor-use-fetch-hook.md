# Implementation Plan: useFetch Hook + ErrorBoundary Cap

**Branch:** `claude/feature/refactor-use-fetch-hook`
**Files touched:** `src/hooks/useFetch.ts` (new), `src/pages/Menu.tsx`, `src/pages/Quiz.tsx`, `src/components/ErrorBoundary.tsx`, `tests/useFetch.hook.test.ts` (new), `tests/ErrorBoundary.component.test.tsx` (new), `tests/Menu.page.test.tsx` (update), `tests/Quiz.page.test.tsx` (update)

---

## Context

`Menu.tsx` and `Quiz.tsx` both implement the same fetch/loading/error/retry/AbortController pattern from scratch. Any future change (loading skeletons, global error handling) requires touching both files. Extracting a shared `useFetch` hook removes the duplication. The ErrorBoundary fix is a one-liner that prevents long API error strings from breaking layout.

---

## Step 1 — Create branch

```
git checkout -b claude/feature/refactor-use-fetch-hook
```

---

## Step 2 — ErrorBoundary message cap (src/components/ErrorBoundary.tsx)

In the `render()` method, replace the direct `this.state.error.message` reference with a truncated version:

```typescript
const msg = this.state.error.message;
const display = msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
```

Render `display` instead of `this.state.error.message`. No other changes.

---

## Step 3 — Create useFetch hook (src/hooks/useFetch.ts)

```typescript
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  errorMessage: string
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => setRetryCount(c => c + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);

    fetchFn(controller.signal)
      .then(result => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled && !axios.isCancel(err)) {
          setError(errorMessage);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [fetchFn, retryCount]);

  return { data, loading, error, retry };
}
```

Key design decisions:
- `fetchFn` is a dependency — consumers must memoize it with `useCallback` if it has changing deps (same pattern as existing `retrieveQuestions`).
- `retryCount` is internal — exposed only via `retry()` callback.
- `cancelled` flag guards against setState after unmount in the `.then`/`.catch`/`.finally` chain (axios isCancel handles abort in catch, but the flag protects the others).
- `setLoading(true)` at the top of the effect handles re-fetches (provider change in Menu).

---

## Step 4 — Refactor Menu.tsx

Replace the manual fetch boilerplate with `useFetch`. Key changes:

- Remove: `loading`, `error`, `retryCount` state; the `useEffect` with `retrieveCategories`; bare `axios` import.
- Add: `useFetch` import; memoized `fetchFn` via `useCallback`.
- `categories` comes from hook `data` (default to `[]` when null for safe mapping).
- Form initialization (setting default category/difficulty/type) moves to a separate `useEffect` watching `categories`.

```typescript
const fetchCategories = useCallback(
  (signal: AbortSignal) => getProvider(provider).getCategories({ signal }),
  [provider]
);

const { data, loading, error, retry } = useFetch(fetchCategories, 'Failed to retrieve Categories');
const categories = data ?? [];

useEffect(() => {
  if (data && data.length > 0) {
    const prov = getProvider(provider);
    setFormData(prev => ({
      ...prev,
      category: data[0].id,
      difficulty: prov.difficulties[0].value,
      type: prov.types[0].value,
    }));
  }
}, [data, provider]);
```

The Retry button calls `retry()` instead of `setRetryCount(c => c + 1)`.

---

## Step 5 — Refactor Quiz.tsx

Quiz is more complex: pagination (`nextQuestions`) needs to update `questions` state outside the hook. Strategy: hook owns the initial load; local `questions` state syncs from hook data and is updated by pagination.

- Remove: `loading`, `error`, `retryCount` state; the `retrieveQuestions` `useCallback`; the initial `useEffect`; bare `axios` import from the initial load path.
- Keep: `isFetching`, `paginationControllerRef`, `questions` state, `nextQuestions` function.
- Add: `useFetch` import; memoized `fetchFn`; sync effect; `axiosInstance` import for pagination.

```typescript
const fetchQuestions = useCallback(
  (signal: AbortSignal) => currentProvider.getQuestions({
    amount: NUMBER_OF_QUESTIONS, categoryId: categoryID, difficulty, type, token, signal
  }),
  [currentProvider, categoryID, difficulty, type, token]
);

const { data: fetchedQuestions, loading, error, retry } = useFetch(fetchQuestions, 'Failed to retrieve Questions');

// Sync initial load into local state (pagination also writes here)
const [questions, setQuestions] = useState<QuestionsResult | null>(null);
useEffect(() => {
  if (fetchedQuestions) setQuestions(fetchedQuestions);
}, [fetchedQuestions]);
```

For pagination, `nextQuestions` fetches directly using `currentProvider.getQuestions(...)` with its ref-managed AbortController, then calls `setQuestions` on success. It uses `axios.isCancel` to ignore aborts — keep the `import axios from 'axios'` for this.

Retry button calls `retry()`.

---

## Step 6 — Tests

**New: tests/useFetch.hook.test.ts**
- Mock a fetch function; assert `loading: true` initially, then `data` populated on resolve.
- Assert `error` is set (with the provided message) when fetch rejects.
- Assert abort is called on cleanup (unmount).
- Assert calling `retry()` triggers a second call to `fetchFn`.
- Assert axios cancellation errors do not set `error` state.

**New: tests/ErrorBoundary.component.test.tsx**
- Throw an error with a message > 120 chars from a child component.
- Assert the rendered message is truncated to 120 chars + `…`.
- Throw an error with a message ≤ 120 chars; assert it renders as-is (no truncation).

**Update: tests/Menu.page.test.tsx**
- `retryCount`-based assertions become `retry()` button click assertions — behavior is identical, no structural change needed.
- Ensure mocked `getCategories` is still called via `getProvider`.

**Update: tests/Quiz.page.test.tsx**
- Same: retry button behavior unchanged. Verify pagination still works.

---

## Verification

- `npm run build` — must pass with no errors or new warnings.
- Manual browser test: load Menu, verify categories populate; change provider, verify categories reload; click Retry on network error.
- Manual browser test: load Quiz, answer questions, click Next Questions, verify pagination works.
- Run test suite: `npm run test` (or vitest).
