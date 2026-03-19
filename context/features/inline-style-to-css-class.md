# Plan: Inline Style to CSS Class Refactor (Backlog #10)

## Context

Two inline `style` props remain in the codebase while all other UI uses `tq-*` CSS classes. This is a pure style consistency fix — no logic changes, no visual change.

## Files to Modify

- `src/index.css` — add two new `tq-*` classes
- `src/pages/Menu.tsx:71` — replace inline style with class
- `src/components/ErrorBoundary.tsx:28` — replace inline style with class

## Changes

### 1. `src/index.css`

Add under the `/* ─── MENU PAGE ───` section:

```css
.tq-form-section {
  margin-bottom: 1.5rem;
}
```

Add under the `/* ─── STATUS ───` section:

```css
.tq-error-detail {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.5rem;
}
```

### 2. `src/pages/Menu.tsx:71`

Replace inline style with `className="tq-form-section"`.

### 3. `src/components/ErrorBoundary.tsx:28`

Replace inline style with `className="tq-error-detail"`.

## Verification

- `npm run build` passes with no errors
- Existing tests pass unchanged
- Visual appearance of Menu form and ErrorBoundary error display is identical
