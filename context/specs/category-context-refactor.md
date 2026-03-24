# Spec for Category Context Refactor

Title: Category Context Refactor
Branch: claude/feature/category-context-refactor
Spec file: context/specs/category-context-refactor.md

## Summary

`category` state is currently owned by `App.tsx` and prop-drilled: passed as a `setCategory` callback to `Menu.tsx` and as a `category` prop to `Quiz.tsx`. This is inconsistent with how `provider` and `token` are managed — those live in `ProviderContext` and are consumed via `useProvider()`. Move `category` into `ProviderContext` (alongside `provider` and `token`) so consumers access it through `useProvider()` with no prop-drilling.

## Functional Requirements

- `category` state and `setCategory` are moved into `ProviderContext`
- `useProvider()` exposes `category` and `setCategory` to consumers
- `App.tsx` no longer owns `category` state or passes any category-related props
- `Menu.tsx` calls `setCategory` from `useProvider()` instead of receiving it as a prop
- `Quiz.tsx` reads `category` from `useProvider()` instead of receiving it as a prop
- `QuizProps` interface in `Quiz.tsx` is removed (or emptied) since it no longer receives props
- All existing behavior is preserved: `category.name` still displays in the stats bar

## Possible Edge Cases

- `category` may be `null` on first load or if the user navigates directly to a quiz URL — `Quiz.tsx` already handles this with `category?.name ?? '—'`; that guard must remain
- `ProviderContext` currently resets `token` when `selectedProvider` changes — confirm that a provider switch should also reset `category` to `null` (likely yes, since categories differ per provider)

## Acceptance Criteria

- `App.tsx` passes no props to `Menu` or `Quiz` related to category
- `useProvider()` return value includes `category: Category | null` and `setCategory`
- `Quiz.tsx` has no `category` prop in its component signature
- Stats bar still shows the correct category name after a quiz starts
- No TypeScript errors; `npm run build` passes

## Open Questions

- Should a provider switch also reset `category` to `null`? Currently switching provider does not clear category — with category in context this becomes easy to do, but it changes behavior.

## Testing Guidelines

- Update `ProviderContext.test.tsx`: add test that `category` starts as `null` and updates correctly via `setCategory`
- Update any existing tests in `Quiz.test.tsx` or `Menu.test.tsx` that pass `category` as a prop — switch them to use the mocked context value instead
- No new test files needed; adjust existing ones

## Personal Opinion

This is a good, low-risk cleanup. The change is small and mechanical — it follows the exact pattern already established for `provider` and `token`. The codebase will be more consistent and `App.tsx` will be simpler. No behavior changes, just restructuring where state lives. The only mild concern is that `ProviderContext` is growing in responsibility, but it already owns the provider/token lifecycle so category fits naturally alongside them.
