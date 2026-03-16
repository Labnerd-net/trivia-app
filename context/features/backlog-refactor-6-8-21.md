# Plan: Backlog Refactor #6, #8, #21

## Context

Three low-risk cleanup items grouped together: consolidate duplicate change handlers in Menu.tsx, eliminate a manually maintained duplicate array in providers.ts, and remove a conflicting CSS block in App.css. No behavioral changes — pure dead code and redundancy removal.

---

## #6 — Consolidate change handlers in Menu.tsx

**File:** `src/pages/Menu.tsx`

Replace the three identical single-line handlers (`selectCategory`, `selectDifficulty`, `selectType`) with one factory:

```ts
const handleChange = (key: keyof MenuFormData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
  setFormData(prev => ({ ...prev, [key]: e.target.value }));
};
```

Update each select's `onChange`:
- `onChange={handleChange('category')}`
- `onChange={handleChange('difficulty')}`
- `onChange={handleChange('type')}`

Remove the three old handler declarations.

---

## #8 — Derive providerList from providers object in providers.ts

**File:** `src/api/providers.ts`

Replace the hardcoded `providerList` array:

```ts
// Before
export const providerList: ProviderListItem[] = [
  { id: 'opentdb', name: 'Open Trivia Database' },
  { id: 'triviaapi', name: 'The Trivia API' },
];

// After
export const providerList = Object.values(providers);
```

Remove the `ProviderListItem` import from the `import type` line in `providers.ts` (it will no longer be used there). Verify `ProviderListItem` is not used elsewhere before removing the type itself from `src/types/index.ts` — if it's only used in `providers.ts`, remove it from types too.

---

## #21 — Remove duplicate #root block from App.css

**File:** `src/App.css`

Delete the entire `#root { ... }` block. The authoritative styles are in `src/index.css`. App.css will be empty after this change (leave the file in place — no need to delete it).

---

## Verification

1. `npm run build` — must pass with no errors or type errors
2. Manual smoke test: open the app, verify provider tabs render, all three selects work, page layout is unchanged

