# Dark/Light Mode Toggle — Implementation Plan

## Overview

Theme switching is implemented entirely at the CSS variable level. The `data-theme` attribute on `<html>` acts as the single source of truth for the active theme. A small inline script in `index.html` reads `localStorage` before the first paint to prevent flash. A `useTheme` hook manages state and synchronization. The Navbar gets a toggle button on its right side.

---

## Step 1 — `index.html`: No-Flash Theme Init Script

**File:** `index.html`
**Location:** Inside `<head>`, before any stylesheet links

Add an inline `<script>` tag (not `type="module"`) that runs synchronously before the browser paints. It should:

1. Attempt to read `localStorage.getItem('tq-theme')` inside a `try/catch`.
2. If the value is `'light'`, set `document.documentElement.setAttribute('data-theme', 'light')`.
3. If the value is anything else (including `null`, `'dark'`, or a storage error), do nothing — dark is the default and no attribute is needed.

The script must be inline (not an external file) because external scripts can be deferred or blocked. The try/catch ensures that environments where `localStorage` is unavailable fall through silently to the default dark theme.

---

## Step 2 — `src/index.css`: Light Theme Variables and Body Grid

**File:** `src/index.css`

### 2a — Existing `:root` CSS variables

The current `:root` block defines these variables (dark theme defaults — do not change):
- `--bg: #0a0a12`, `--surface: #11111e`, `--card: #181830`, `--border: #232342`
- `--gold`, `--gold-light`, `--gold-bright`, `--gold-glow`, `--gold-glow-strong` (keep identical in both themes)
- `--text: #d8d8ec`, `--text-dim: #666688`, `--text-muted: #3a3a5a`
- `--correct-bg`, `--correct-border`, `--correct-text`
- `--radius`, `--radius-md`

### 2b — Add `[data-theme="light"]` override block after `:root`

Override only the color variables that differ. Suggested light values:
- `--bg: #f2efe8`
- `--surface: #e8e4db`
- `--card: #ddd9ce`
- `--border: #c2bdb0`
- `--text: #1a1a2e`
- `--text-dim: #5a5870`
- `--text-muted: #9a98a8`
- `--correct-bg: rgba(40, 110, 40, 0.12)`
- `--correct-border: #3a8a3a`
- `--correct-text: #2a7a2a`

Gold variables remain unchanged — do not include them in the light block.

### 2c — Body background grid lines

The `body` background-image uses hardcoded `rgba(255,255,255,0.02)` grid lines — invisible in light mode. Extract this into a CSS variable:

- Add `--grid-line: rgba(255,255,255,0.02)` to `:root`
- Add `--grid-line: rgba(0,0,0,0.05)` to `[data-theme="light"]`
- Update the `body` background-image to reference `var(--grid-line)` in both gradient declarations

---

## Step 3 — `src/hooks/useTheme.ts`: New Hook

**File:** `src/hooks/useTheme.ts` (new file)

### Initial state

On mount, read `document.documentElement.getAttribute('data-theme')`. If `'light'`, initialize state to `'light'`; otherwise `'dark'`. This mirrors what the inline script already applied — no second DOM write needed.

### Toggle function

`toggleTheme` should:
1. Compute next theme (flip current).
2. Update React state.
3. For `'light'`: `document.documentElement.setAttribute('data-theme', 'light')`. For `'dark'`: `document.documentElement.removeAttribute('data-theme')`.
4. Write to `localStorage` inside a `try/catch`, silently ignoring errors.

### Return value

`{ theme, toggleTheme }` where `theme` is `'dark' | 'light'`.

No `useEffect` for DOM sync — the toggle function handles DOM and state atomically.

---

## Step 4 — `src/components/Navbar.tsx`: Toggle Button

**File:** `src/components/Navbar.tsx`

1. Import `useTheme` from `../hooks/useTheme`.
2. Destructure `{ theme, toggleTheme }`.
3. Turn the existing `<nav>` inner container into a flex row with `justify-content: space-between` (or add `margin-left: auto` to the button).
4. Add a `<button>` with:
   - `className="tq-theme-toggle"`
   - `onClick={toggleTheme}`
   - `aria-label`: `"Switch to light mode"` when theme is `'dark'`, `"Switch to dark mode"` when `'light'`
   - Content: `☀` when `theme === 'dark'` (clicking switches to light), `🌙` when `theme === 'light'` (clicking switches to dark) — icon shows what you'll get after clicking

---

## Step 5 — `src/index.css`: Toggle Button Styles

**File:** `src/index.css` — add to the NAVBAR section

`.tq-theme-toggle`:
- `background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem`
- Font size large enough to read the Unicode icon (e.g., `1.2rem`)
- `color: var(--text-dim)` with hover state `color: var(--gold-light)`
- `transition: color 0.15s`
- No separate `[data-theme="light"]` rules needed — uses CSS variables that already update

Also update `.tq-navbar .container` (or equivalent) to use `display: flex; align-items: center; justify-content: space-between` to push the button to the right.

---

## Step 6 — `tests/Navbar.component.test.tsx`: Test Updates

**File:** `tests/Navbar.component.test.tsx`

Add `beforeEach` to reset state: `localStorage.clear()` and `document.documentElement.removeAttribute('data-theme')`.

### New test cases

1. **Renders toggle button** — button with accessible label `"Switch to light mode"` exists on initial render.
2. **Clicking sets data-theme to light** — after click, `document.documentElement.getAttribute('data-theme')` equals `'light'`.
3. **localStorage updated on toggle** — after click, `localStorage.getItem('tq-theme')` equals `'light'`.
4. **Second click removes data-theme** — after two clicks, `document.documentElement.getAttribute('data-theme')` is `null`.
5. **Respects pre-set theme** — set `document.documentElement.setAttribute('data-theme', 'light')` before render; button label is `"Switch to dark mode"`.
6. **localStorage failure is silent** — mock `localStorage.setItem` to throw; click toggle; assert no error thrown and `data-theme` attribute was still set.

---

## Implementation Order

1. `index.html` — no-flash script (independent, no deps)
2. `src/index.css` — light theme variables + grid variable
3. `src/hooks/useTheme.ts` — new hook
4. `src/components/Navbar.tsx` — wire hook and button
5. `src/index.css` — toggle button styles
6. `tests/Navbar.component.test.tsx` — extend tests

---

## Potential Issues

- **Icon encoding**: `☀` and `🌙` are multi-byte Unicode. File must be UTF-8. If garbled, use JSX `{'\u2600'}` and `{'\uD83C\uDF19'}` as fallbacks.
- **CSS variable names**: The exact `:root` variable names in `index.css` must be matched exactly in the `[data-theme="light"]` block — a name mismatch silently fails.
- **Navbar layout**: If `.tq-navbar .container` is not yet a flex container, adding `display: flex` could affect existing brand link layout. Inspect before changing.
- **Body background-image specificity**: No component-level overrides seen — the variable substitution approach should work cleanly.
