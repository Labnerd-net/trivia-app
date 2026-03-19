# Plan: Fix ProviderContext Unmount and Memo Issues

## Fix #3 — Cancelled flag guard in `useEffect`

**Problem:** `AbortController` / `axios.isCancel` only prevents the error setter on a network-level cancel. All three state setters (`setToken`, `setError`, `setLoading`) can still fire after unmount. The `cancelled` flag is a synchronous, unconditional guard covering all three paths.

**Changes to `src/context/ProviderContext.tsx`:**

1. After `const controller = new AbortController();` — add:
   ```
   let cancelled = false;
   ```

2. `setToken(tokenData)` — guard:
   ```
   if (!cancelled) setToken(tokenData);
   ```

3. `setToken(null)` — guard:
   ```
   if (!cancelled) setToken(null);
   ```

4. `setError('Failed to retrieve Token')` — guard (keep `axios.isCancel` check too):
   ```
   if (!cancelled && !axios.isCancel(err)) setError('Failed to retrieve Token');
   ```

5. `setLoading(false)` in `finally` — guard:
   ```
   if (!cancelled) setLoading(false);
   ```

6. Expand the cleanup return to set the flag before aborting:
   ```
   return () => {
     cancelled = true;
     controller.abort();
   };
   ```

---

## Fix #15 — Inline `handleRetry` on the `onClick` prop

**Changes to `src/context/ProviderContext.tsx`:**

1. Delete the entire `handleRetry` function declaration (the `const handleRetry = () => { ... }` block).

2. Replace `onClick={handleRetry}` on the Retry button with an inlined arrow:
   ```
   onClick={() => { setLoading(true); setError(null); setRetryCount(c => c + 1); }}
   ```

---

## Test updates (`tests/ProviderContext.test.tsx`)

**New test — unmount during in-flight fetch (Fix #3):**
- Spy on `console.error` before the test.
- Set `mockGetToken` to return a promise that never settles.
- Render `ProviderProvider` then immediately call `unmount()`.
- Flush microtasks with `await act(async () => {})`.
- Assert `console.error` was not called with a state-update-on-unmounted-component warning.

**New test — retry increments correctly (Fix #15):**
- Trigger the error state (first fetch fails).
- Click Retry.
- Assert `mockGetToken` was called a second time (confirms `retryCount` incremented).

---

## Ordering

Both fixes are independent. Apply in any order. After both changes:
- Run `npm run build` — no TypeScript errors expected.
- Run `npm test` — existing + new tests should pass.

## Files Changed

- `src/context/ProviderContext.tsx` — both fixes
- `tests/ProviderContext.test.tsx` — two new test cases
