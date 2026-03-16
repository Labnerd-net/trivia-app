# Spec for Dead Code and Naming Cleanup

Title: Dead Code and Naming Cleanup
Branch: claude/fix/dead-code-and-naming-cleanup
Spec file: context/specs/dead-code-and-naming-cleanup.md

## Summary

Remove dead code and fix a naming inconsistency across four backlog items (#9, #7, #4, #5). All changes are cosmetic or structural with no behavior impact.

- **#9** — `App.css` contains leftover Vite template styles (`.logo`, `.read-the-docs`, keyframe animations) that are never referenced in the app.
- **#7** — `ProviderListItem` has an `icon` field (emoji strings) that is defined in the type and populated in `providerList` data but never rendered anywhere in the UI.
- **#4** — `App.tsx` root `<div>` has a single inline `style={{ minHeight: '100vh' }}`, which is the only inline style in the project and inconsistent with the `tq-*` CSS approach.
- **#5** — A callback in `App.tsx` is named `selectedCategory`, which reads like a state value rather than an event handler.

## Functional Requirements

- Remove lines 8–42 from `App.css` (the unused Vite template block: `.logo`, `.logo:hover`, `.logo.react:hover`, `.read-the-docs`, `@keyframes logo-spin`).
- Remove the `icon` field from the `ProviderListItem` type in `src/types/index.ts` (or wherever the type is defined).
- Remove the `icon` values from the two entries in `providerList` in `src/api/providers.ts`.
- Move the `minHeight: '100vh'` inline style on the root `<div>` in `App.tsx` into a CSS class (e.g., `tq-root`) in `index.css` or `App.css`, and apply the class instead.
- Rename `selectedCategory` in `App.tsx` to `handleCategorySelect` and update the prop reference passed to `Menu`.

## Possible Edge Cases

- Removing CSS from `App.css` — low risk; lines are unreferenced. Verify no other file imports or references `.logo` or `.read-the-docs`.
- Removing the `icon` field — check if `icon` is referenced anywhere outside `providers.ts` (e.g., Menu.tsx provider tab rendering) before deleting.
- Renaming `selectedCategory` — grep for all usages before renaming to avoid a missed reference.

## Acceptance Criteria

- `App.css` no longer contains `.logo`, `.read-the-docs`, or the `logo-spin` keyframes.
- `ProviderListItem` type has no `icon` field; `providerList` entries have no `icon` values.
- The root `<div>` in `App.tsx` has no inline `style` prop; the `minHeight` is applied via a CSS class.
- The callback is named `handleCategorySelect` everywhere it is defined and used.
- `npm run build` passes with no errors.
- No visual or functional regression in the UI.

## Open Questions

- Should `tq-root` go in `App.css` (component-scoped) or `index.css` (global)? Likely `index.css` since it targets the root layout, but either works. - index.css is good

## Testing Guidelines

No new test files needed — these are all dead code removal and rename changes. Existing tests should continue to pass. Run the full test suite to confirm no regressions.

## Personal Opinion

All four items are legitimate housekeeping. They are low risk, high clarity, and make the codebase more consistent. None of them are contentious. The only item worth a second look is #7 (removing `icon`) — if there's any chance tabs will get icons in the near future, the field could stay. But given it's currently dead, removing it is the cleaner call. Complexity: very low.
