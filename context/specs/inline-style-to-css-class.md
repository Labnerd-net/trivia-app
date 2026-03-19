# Spec for Inline Style to CSS Class Refactor

Title: Inline Style to CSS Class Refactor
Branch: claude/fix/inline-style-to-css-class
Spec file: context/specs/inline-style-to-css-class.md

## Summary

Two places in the codebase use inline `style` props while the rest of the UI uses `tq-*` CSS classes exclusively. This creates inconsistency and makes styles harder to override or theme. Extract both inline styles into named `tq-*` classes in `index.css`.

Affected locations:
- `src/pages/Menu.tsx:71` — `style={{ marginBottom: '1.5rem' }}` on the Data Source section wrapper div
- `src/components/ErrorBoundary.tsx:28` — `style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}` on the error detail div

## Functional Requirements

- Replace `style={{ marginBottom: '1.5rem' }}` in `Menu.tsx` with a `tq-*` class that applies the same margin.
- Replace `style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}` in `ErrorBoundary.tsx` with a `tq-*` class that applies the same styles.
- Add both new classes to `src/index.css` under relevant existing sections.
- No visual change — pixel-for-pixel equivalent output.

## Possible Edge Cases

- Class name collision with an existing `tq-*` rule that applies different values — verify before adding.
- The `opacity` value on the error detail text may interact with parent element opacity; confirm the extracted class behaves identically.

## Acceptance Criteria

- No inline `style` props remain in `Menu.tsx` or `ErrorBoundary.tsx`.
- Visual appearance in both components is unchanged.
- New `tq-*` classes exist in `index.css` and nowhere else (no duplication).
- `npm run build` passes with no errors or warnings.

## Open Questions

- None.

## Testing Guidelines

No new tests needed — this is a pure style refactor with no logic changes. Existing tests for `Menu.tsx` and `ErrorBoundary.tsx` should still pass unchanged.

## Personal Opinion

This is a straightforward, low-risk cleanup. The change is small and the value is real: consistent styling convention makes the codebase easier to scan and reduces the chance of duplicated style logic. Recommend doing it.
