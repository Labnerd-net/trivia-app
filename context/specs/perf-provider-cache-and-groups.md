# Spec for Performance Fix Provider Cache and Group List

Title: Performance Fix Provider Cache and Group List
Branch: claude/fix/perf-provider-cache-and-groups
Spec file: context/specs/perf-provider-cache-and-groups.md

## Summary

Fix two performance issues identified in the backlog:

1. **#6 — Race condition in `makeLocalProvider` / `makeSnapshotProvider` cache**: Both factories use a simple `if (!cache)` guard. If two calls arrive before the first fetch resolves, both enter the branch and fire duplicate requests for potentially multi-MB JSON files. Fix by storing the in-flight promise so subsequent calls await it rather than starting a new fetch.

2. **#7 — Provider group list recomputed on every render in `Menu.tsx`**: `Array.from(new Set(...))` runs on every render to derive unique provider groups from `providerList`, which is a module-level constant that never changes. Fix by hoisting this computation to module scope so it executes once at import time.

## Functional Requirements

- `makeLocalProvider` and `makeSnapshotProvider` must only fire one HTTP request per resource, even if called concurrently before the first response returns.
- The derived list of unique provider groups used in `Menu.tsx` must not be recomputed after the initial module load.

## Possible Edge Cases

- If the in-flight fetch for a provider fails, subsequent callers awaiting the same promise will also receive the rejection. The caller (Quiz.tsx) already handles errors via useFetch, so this is acceptable and matches the existing error path.
- If `providerList` is ever made dynamic in the future, the hoisted group list would need to be replaced with a memoized or reactive alternative. This is not a current concern.

## Acceptance Criteria

- [ ] `makeLocalProvider` caches the in-flight promise and does not issue more than one fetch per provider data file, even under concurrent calls.
- [ ] `makeSnapshotProvider` has the same behaviour.
- [ ] The provider group list in `Menu.tsx` is computed once (at module scope or as a constant outside the component), not inside the render function.
- [ ] All existing tests pass.
- [ ] `npm run build` completes without errors.

## Open Questions

- None.

## Testing Guidelines

No new test files needed. The cache fix is an internal implementation detail not easily unit-tested without mocking; verify via code inspection and existing test suite. Confirm the group-list change does not break Menu rendering tests.

## Personal Opinion

Both fixes are straightforward and low-risk. #7 is trivial — a one-liner hoist with no behavioural change. #6 is slightly more involved but the in-flight promise pattern is well-established and the change is self-contained within each factory. Both are worth doing. No concerns.
