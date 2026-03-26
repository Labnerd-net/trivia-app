# Spec for Dark/Light Mode Toggle

Title: Dark/Light Mode Toggle
Branch: claude/feature/dark-light-mode-toggle
Spec file: context/specs/dark-light-mode-toggle.md

## Summary

The app is currently dark-only. Add a toggle button in `Navbar.tsx` that switches between the existing dark theme and a light theme. The preference is persisted to `localStorage` so it survives page refreshes. The theme is applied via a `data-theme` attribute on `<html>` (or `<body>`), and both themes are defined using the existing CSS custom properties in `index.css`.

## Functional Requirements

- A toggle button appears in the navbar (right side).
- Clicking it switches between dark mode and light mode.
- The current mode is persisted in `localStorage` under a key like `tq-theme`.
- On page load, the stored preference is read and applied before first paint (to avoid flash of wrong theme).
- The light theme redefines the CSS custom properties in `index.css` to appropriate light-mode equivalents.
- The gold accent colors remain consistent across both themes (they are brand colors, not theme-dependent).
- The background grid pattern (currently very subtle white lines on dark) should adapt or be hidden in light mode.

## Possible Edge Cases

- No stored preference: default to dark mode (current behavior).
- `localStorage` unavailable (e.g., private browsing with strict settings): silently fall back to dark mode, do not throw.
- System prefers light (`prefers-color-scheme: light`) with no stored preference: could respect system preference as the initial default, but only if explicitly scoped — avoid scope creep.

## Acceptance Criteria

- [ ] Toggle button is visible in the navbar on all pages.
- [ ] Toggling switches the visual theme across the entire app immediately.
- [ ] Refreshing the page preserves the last-selected theme.
- [ ] Light mode has sufficient contrast (text is readable, cards are distinguishable from the background).
- [ ] No flash of unstyled/wrong-theme content on load.
- [ ] All existing `tq-*` components look correct in both themes.

## Open Questions

- Should system `prefers-color-scheme` be used as the initial default if no preference is stored, or should dark always be the default? - start with dark
- What icon or label should the toggle use? (e.g., a sun/moon icon, or text "Light / Dark") - use sun and moon

## Testing Guidelines

Create or extend tests for the following cases:

- Navbar renders the toggle button.
- Clicking the toggle adds/changes the `data-theme` attribute on `<html>`.
- The preference is written to `localStorage` on toggle.
- On mount, the component reads `localStorage` and applies the correct theme.
- `localStorage` failure is handled gracefully (no error thrown).

## Personal Opinion

This is a clean, self-contained addition. The CSS custom property setup in `index.css` is already well-structured for exactly this kind of theming — swapping values under a `[data-theme="light"]` selector is minimal work.

One concern: the dark theme has a strong "quiz show" aesthetic (deep navy, gold, grid lines). A light version risks feeling generic unless some care is taken to keep the gold accent color and overall feel intact. A neutral off-white background rather than pure white would help preserve the identity.

Overall: low risk, reasonable scope. Not a must-have but a nice quality-of-life feature.
