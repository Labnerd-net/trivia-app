# Spec for Fix ProviderContext Unmount and Memo Issues

Title: Fix ProviderContext Unmount and Memo Issues
Branch: claude/fix/fix-provider-context-unmount-memo
Spec file: context/specs/fix-provider-context-unmount-memo.md

## Summary

Two small bugs in `src/context/ProviderContext.tsx`:

1. **#3 (High Bug)** — The `finally` block in `retrieveToken` calls `setLoading(false)` unconditionally, even if the component has unmounted. This can cause a React "state update on unmounted component" warning and potential memory leaks. The `useFetch` hook already solves this correctly with a `cancelled` flag.

2. **#15 (Low Improvement)** — `handleRetry` is recreated on every render because it is not wrapped in `useCallback`. This is inconsistent with the memoized `setSelectedProvider` and is unnecessary — it should be inlined as an arrow in the `onClick` prop directly.

## Functional Requirements

- `retrieveToken` must not call any state setters (`setLoading`, `setError`, `setToken`) after the component has unmounted.
- Guard all state setters in `retrieveToken` with a `cancelled` flag that is set to `true` in the effect cleanup function.
- `handleRetry` should be removed as a named function and inlined as an arrow in the `onClick` prop where it is used.

## Possible Edge Cases

- If the provider switches while a token fetch is in flight, the cleanup should cancel the in-flight state updates correctly without affecting the new fetch.
- The `cancelled` flag must be declared inside the effect (not as a ref) so each effect invocation has its own flag.

## Acceptance Criteria

- No "state update on unmounted component" warning when the component unmounts during a token fetch.
- `handleRetry` no longer exists as a named function; its logic is inlined.
- All existing tests for `ProviderContext` continue to pass.
- `npm run build` passes with no errors or warnings introduced by this change.

## Open Questions

- None.

## Testing Guidelines

Create or update tests in the existing `ProviderContext.test.tsx`:
- Test that state setters are NOT called when the component unmounts mid-fetch (simulate with a delayed mock that resolves after unmount).
- Verify the retry button still triggers a token refetch after the inline refactor.

## Personal Opinion

Both fixes are straightforward and low-risk. #3 is a real bug — it will fire the React warning in development and could cause subtle issues in strict mode. Worth fixing. #15 is purely cosmetic but keeps the file consistent. Neither is complex. No concerns.
