# Spec for Backlog Refactor #6, #8, #21

Title: Backlog Refactor #6 #8 #21
Branch: claude/fix/backlog-refactor-6-8-21
Spec file: context/specs/backlog-refactor-6-8-21.md

## Summary

Three small, unrelated cleanup refactors grouped into one commit: consolidate duplicate change handlers in Menu.tsx, derive providerList from the providers object to eliminate redundancy, and remove a conflicting `#root` CSS block from App.css.

## Functional Requirements

- **#6**: Replace the three single-line change handlers (`selectCategory`, `selectDifficulty`, `selectType`) in `Menu.tsx` with a single generic handler or inline `onChange` callbacks. Behavior must be identical.
- **#8**: In `providers.ts`, replace the manually maintained `providerList` array with one derived from `Object.values(providers)` so `id` and `name` are not duplicated.
- **#21**: Remove the `#root` block from `App.css` (which contains `max-width: 1280px`, `padding: 2rem`, `text-align: center`). The authoritative `#root` styles live in `index.css` and should be the single source of truth.

## Possible Edge Cases

- **#6**: Any consumer that imports the individual handler names directly would break — check that they are only used internally in Menu.tsx.
- **#8**: Any code that relies on `providerList` having fields beyond `id` and `name` (e.g., `description`) must still work after the derivation. Verify the full provider object shape is preserved.
- **#21**: Removing the App.css `#root` block may expose the `index.css` values. Confirm the layout renders correctly after removal (no broken padding or alignment).

## Acceptance Criteria

- [ ] `Menu.tsx` has no more than one change handler for form selects, and all three selects still update state correctly.
- [ ] `providerList` is derived from `Object.values(providers)` with no duplicate `id`/`name` fields.
- [ ] `App.css` has no `#root` block; the `index.css` `#root` block is the only one.
- [ ] `npm run build` passes with no errors.
- [ ] UI behavior is unchanged: provider tabs, category/difficulty/type selects, and page layout all work as before.

## Open Questions

- None.

## Testing Guidelines

No new test files needed — these are non-behavioral refactors. Verify existing tests still pass after the changes. A quick manual smoke test of the Menu form (select changes update state) and a build check are sufficient.

## Personal Opinion

All three are straightforward and low-risk. #8 and #21 are pure dead-code removals with no behavioral surface. #6 is slightly more involved but still trivial. Grouping them is fine — they're all the same class of change (remove redundancy) and the combined diff will be small and easy to review.
