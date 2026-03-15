# Spec for Fix Backlog Bugs

Title: Fix All Backlog Bugs
Branch: claude/fix/fix-backlog-bugs
Spec file: context/specs/fix-backlog-bugs.md

## Summary

Fix all four bugs identified in context/backlog.md across Quiz.tsx and Menu.tsx. These are correctness and resource-management issues, not cosmetic changes.

## Functional Requirements

- **Bug 1 (High) — Quiz.tsx:51**: Remove `retryCount` from the `useCallback` dependency array for `retrieveQuestions`. Move `retryCount` into the `useEffect` dependency array so it triggers re-runs without causing a new callback reference on each retry.
- **Bug 2 (High) — Quiz.tsx:59-67**: Add AbortController support to `nextQuestions`. Store a pagination AbortController in a `useRef`, abort the previous request on each new `nextQuestions` call, and pass the signal to `retrieveQuestions`.
- **Bug 3 (Medium) — Menu.tsx:59**: Remove `currentProvider` from the `useEffect` dependency array. Only `provider` (the prop) is needed as the trigger; `currentProvider` is a derived value that should not be a dependency.
- **Bug 4 (Low) — Quiz.tsx:117**: Change the `key` prop on `Question` components from `${data.category}-${data.question}-${data.difficulty}` to `` `${page}-${idx}` `` to guarantee uniqueness across batches.

## Possible Edge Cases

- Aborting a pagination fetch while the previous one is still in flight — ensure the signal is correctly passed and AbortController is reset before the new fetch starts.
- If `retrieveQuestions` ignores the signal, the abort won't help; confirm the signal is wired into the axios call.
- `page` starts at 0 — ensure `page` is in scope where the `key` prop is set.

## Acceptance Criteria

- `retryCount` is no longer in `useCallback`'s dependency array; the callback does not change reference on retry.
- Clicking "Next Questions" while a fetch is in flight cancels the prior request (verifiable via browser DevTools Network tab — prior request shows "cancelled").
- No React warnings about duplicate keys when a batch returns questions with matching category/difficulty/question text.
- `currentProvider` is absent from the `useEffect` dep array in Menu.tsx; no infinite render loop occurs when switching providers.
- `npm run build` passes with no errors or warnings introduced by these changes.

## Open Questions

- None. All fixes are clearly scoped.

## Testing Guidelines

Create or update tests in `./tests` (or wherever existing tests live) for:
- `Quiz`: retry increments do not cause double-fetch (check fetch call count stays at 1 per retry).
- `Quiz`: `nextQuestions` aborts an in-flight fetch before starting a new one.
- `Quiz`: Question keys are unique within a rendered batch.
- `Menu`: Switching `provider` prop triggers the effect exactly once; no duplicate triggers from `currentProvider`.

## Personal Opinion

All four fixes are straightforward and low-risk. They address real correctness issues — the concurrent fetch on retry and the missing abort on pagination are the two that could cause observable bugs in production (duplicate data loads, stale state). The dep array and key fixes are minor but correct. This batch is a good idea to ship together since they're all small and the scope is limited to two files.
