# Plan: Provider Capabilities Hook and DataValue Refactor

## Context

Two low-priority cleanup items from the backlog:

- **#17**: `provider.difficulties.length > 1` and `provider.types.length > 1` are inlined identically in both `Menu.tsx` and `Quiz.tsx`. Extracting them into a shared hook removes the duplication and gives a named home for provider capability checks.
- **#18**: `makeLocalProvider` builds two lookup maps using `c.dataValue ?? c.name`. The `dataValue` field only exists on TP Millennium categories (where it equals the category `id`, e.g. `'PP'`). For All Of Us and Mind the Gap, `dataValue` is always `undefined`, making the field misleading. The fix is to remove `dataValue` from `CategoryDef` and instead pass an optional `getCategoryFilterValue` function into `makeLocalProvider`; TP Millennium supplies it, other providers use the default.

---

## Part 1 — `useProviderCapabilities` hook (#17)

### New file: `src/hooks/useProviderCapabilities.ts`

```ts
import type { Provider } from '../types';

export function useProviderCapabilities(provider: Provider) {
  return {
    hasMultipleDifficulties: provider.difficulties.length > 1,
    hasMultipleTypes: provider.types.length > 1,
  };
}
```

This is a pure computation. Using the hook prefix keeps it consistent with `useTheme` and `useFetch`; it also allows deps to be added later without refactoring call sites.

### Update `src/pages/Menu.tsx`

- Add `import { useProviderCapabilities } from '../hooks/useProviderCapabilities';`
- Call `const { hasMultipleDifficulties, hasMultipleTypes } = useProviderCapabilities(provider);` near the top of the component.
- Replace `provider.difficulties.length > 1` (line 103) with `hasMultipleDifficulties`.
- Replace `provider.types.length > 1` (line 119) with `hasMultipleTypes`.

### Update `src/pages/Quiz.tsx`

- Add the same import and hook call.
- Replace `provider.difficulties.length > 1` (line 98) with `hasMultipleDifficulties`.

---

## Part 2 — Remove `dataValue` from `makeLocalProvider` (#18)

### Current behaviour (providers.ts ~174–175)

```ts
type CategoryDef = { id: string; name: string; dataValue?: string };

const categoryNameById   = Object.fromEntries(categories.map(c => [c.id, c.dataValue ?? c.name]));
const categoryLabelByValue = Object.fromEntries(categories.map(c => [c.dataValue ?? c.name, c.name]));
```

`categoryNameById[id]` → JSON category field value used for filtering
`categoryLabelByValue[jsonField]` → display label used in question output

For TP Millennium: `dataValue = id = 'PP'`, so `categoryNameById['PP'] = 'PP'` and `categoryLabelByValue['PP'] = 'People & Places'`.
For others: `dataValue` is undefined, so `c.name` is used as the JSON field value (identity mapping).

### New approach

Remove `dataValue` from `CategoryDef`. Add an optional `getCategoryFilterValue` parameter to `makeLocalProvider` that returns the JSON field value for a given category. Default: `c => c.name` (correct for All Of Us and Mind the Gap). TP Millennium passes `c => c.id`.

**Updated `CategoryDef`:**
```ts
type CategoryDef = { id: string; name: string };
```

**Updated `makeLocalProvider` signature:**
```ts
function makeLocalProvider(
  id: string,
  name: string,
  description: string,
  group: string,
  dataFile: string,
  categories: CategoryDef[],
  getCategoryFilterValue: (c: CategoryDef) => string = (c) => c.name,
)
```

**Updated map construction:**
```ts
const categoryNameById   = Object.fromEntries(categories.map(c => [c.id, getCategoryFilterValue(c)]));
const categoryLabelByValue = Object.fromEntries(categories.map(c => [getCategoryFilterValue(c), c.name]));
```

This produces identical runtime behaviour to the current code while removing `dataValue` from the type and the category definitions.

### Update `tpMillenniumProvider` call

Pass the custom resolver as the 7th argument and remove `dataValue` from all category objects:

```ts
const tpMillenniumProvider = makeLocalProvider(
  'tpmillennium',
  'Trivial Pursuit — Millennium',
  'Classic Trivial Pursuit questions from the Millennium Edition (1,920 questions)',
  'Card Games',
  '/data/tp_millennium.json',
  [
    { id: 'PP', name: 'People & Places' },
    { id: 'AE', name: 'Arts & Entertainment' },
    { id: 'HIS', name: 'History' },
    { id: 'SN', name: 'Science & Nature' },
    { id: 'SL', name: 'Sports & Leisure' },
    { id: 'WC', name: 'Wild Card' },
  ],
  (c) => c.id,   // JSON category field is the short code, not the full name
);
```

`allOfUsProvider` and `mindTheGapProvider` calls are unchanged (no 7th argument needed).

---

## Files to modify

| File | Change |
|------|--------|
| `src/hooks/useProviderCapabilities.ts` | **Create** — new hook |
| `src/pages/Menu.tsx` | Import and use hook; remove inline length checks |
| `src/pages/Quiz.tsx` | Import and use hook; remove inline length check |
| `src/api/providers.ts` | Remove `dataValue` from `CategoryDef`; add `getCategoryFilterValue` param; update maps; update `tpMillenniumProvider` call |

---

## Test

New file: `tests/useProviderCapabilities.hook.test.ts`

- Test with a mock provider that has `difficulties.length > 1` and `types.length > 1` → both flags `true`
- Test with a mock provider that has `difficulties.length === 1` and `types.length === 1` → both flags `false`

No new tests for the `dataValue` removal — existing `providers.test.ts` plus a clean build are sufficient verification.

---

## Verification

1. `npm run build` — must pass with no TypeScript errors (TP Millennium's `dataValue` removal will surface any type gaps immediately).
2. `npm test` — all 91 existing tests must continue to pass.
3. Manually verify TP Millennium filtering still works in dev server: select TP Millennium, pick a specific category (e.g. 'People & Places'), start quiz — confirm questions returned are from that category.
