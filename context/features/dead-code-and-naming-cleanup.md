# Plan: Dead Code and Naming Cleanup

## Context

Four low-priority backlog items (#4, #5, #7, #9) accumulated from the original Vite scaffold and early development. They are: leftover Vite CSS, an unused `icon` field in the provider type, one-off inline style, and a misnamed callback. None affect behavior — this is purely consistency cleanup.

## Changes

### 1. #9 — Remove dead Vite CSS from `src/App.css`

Remove lines 8–42 (`.logo`, `.logo:hover`, `.logo.react:hover`, `@keyframes logo-spin`, the `@media (prefers-reduced-motion)` block that references it, and `.read-the-docs`). Lines 1–7 (`#root` block) stay untouched.

**File:** `src/App.css`

---

### 2. #7 — Remove unused `icon` field from provider types and data

- `src/types/index.ts` lines 47–51: remove `icon: string` from `ProviderListItem` interface.
- `src/api/providers.ts` lines 161–164: remove `icon: '📚'` and `icon: '🎯'` from the two `providerList` entries.

`icon` is never read in `Menu.tsx` (only `p.name` is rendered in the tab buttons). No other file references it.

---

### 3. #4 — Move root div inline style to `index.css`

- `src/App.tsx` line 19: change `<div style={{ minHeight: '100vh' }}>` to `<div className="tq-root">`.
- `src/index.css` — add `.tq-root { min-height: 100vh; }` rule.

---

### 4. #5 — Rename `selectedCategory` to `handleCategorySelect` in `src/App.tsx`

- Rename the function definition from `selectedCategory` to `handleCategorySelect`.
- Update the prop pass from `setCategory={selectedCategory}` to `setCategory={handleCategorySelect}`.

No other files reference this callback.

---

## Files Modified

| File | Change |
|------|--------|
| `src/App.css` | Deleted dead Vite template styles (lines 8–42) |
| `src/types/index.ts` | Removed `icon: string` from `ProviderListItem` |
| `src/api/providers.ts` | Removed `icon` values from `providerList` entries |
| `src/index.css` | Added `.tq-root { min-height: 100vh; }` |
| `src/App.tsx` | Replaced inline style with `className="tq-root"`; renamed `selectedCategory` → `handleCategorySelect` |

## Verification

1. `npm run build` — must pass with no errors or type errors.
2. Full test suite (`npm test`) — all existing tests must pass; no new tests needed.
3. Visual check: app root should still fill viewport height.
