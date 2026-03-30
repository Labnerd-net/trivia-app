# Spec for Provider Capabilities Hook and DataValue Refactor

Title: Provider Capabilities Hook and DataValue Refactor
Branch: claude/fix/provider-capabilities-datavalue
Spec file: context/specs/provider-capabilities-datavalue.md

## Summary

Two small low-priority cleanups from the backlog:

**#17 — `useProviderCapabilities` hook**: The checks `provider.difficulties.length > 1` and `provider.types.length > 1` are inlined in both `Menu.tsx` and `Quiz.tsx`. Extract these into a shared `useProviderCapabilities(provider)` hook so the logic lives in one place.

**#18 — `dataValue` scoping**: `makeLocalProvider` always builds `categoryNameById` and `categoryLabelByValue` maps using a `c.dataValue ?? c.name` fallback. The `dataValue` field only exists on TP Millennium categories, where it equals the category `id` (e.g., `'PP'`). For all other local providers (All Of Us, Mind the Gap), `dataValue` is always `undefined`, making the fallback to `name` implicit and the field itself misleading. The `dataValue` field and its map logic should be removed or scoped to TP Millennium only.

## Functional Requirements

- Extract a `useProviderCapabilities(provider)` hook in `src/hooks/` that returns `{ hasMultipleDifficulties: boolean, hasMultipleTypes: boolean }`.
- Replace the two `provider.difficulties.length > 1` checks in `Menu.tsx` and the one in `Quiz.tsx` with the hook's output.
- Remove `dataValue` from `CategoryDef` in `providers.ts`.
- Remove `dataValue` from all category definitions (it only appears in `tpMillenniumProvider`'s categories).
- Ensure TP Millennium's category filtering still works correctly after removal. Since TP Millennium's `id` values (`'PP'`, `'AE'`, etc.) match the JSON category field values exactly, the factory's `categoryNameById` map can use `c.id` as the lookup value for TP Millennium without `dataValue`.
- The `categoryLabelByValue` map in `makeLocalProvider` exists to remap short codes back to human-readable labels for the question output. For TP Millennium this map is needed (`'PP'` → `'People & Places'`). For All Of Us and Mind the Gap it is identity (`'Boomers'` → `'Boomers'`). After removing `dataValue`, the factory should still produce correct `category` values in question results for all three providers.

## Possible Edge Cases

- After removing `dataValue`, TP Millennium filtering must still match the JSON `category` field. Verify the JSON uses `'PP'`, `'AE'`, etc. (short codes), not full names.
- `categoryLabelByValue` must still map correctly for TP Millennium. With `dataValue` gone, the key in that map must still be the short code, not the full name.

## Acceptance Criteria

- `src/hooks/useProviderCapabilities.ts` exists and is used in `Menu.tsx` and `Quiz.tsx`.
- `CategoryDef` no longer has a `dataValue` field in `providers.ts`.
- No `dataValue` references remain anywhere in the codebase.
- TP Millennium questions still have readable category labels (e.g., `'People & Places'` not `'PP'`) in the quiz view.
- All Of Us and Mind the Gap category filtering still works.
- Build passes with no TypeScript errors.

## Open Questions

- Should `useProviderCapabilities` also expose `provider.difficulties` and `provider.types` directly, or just the boolean flags? (Probably just booleans — the selects already read `provider.difficulties` and `provider.types` directly.)

## Testing Guidelines

- Add a unit test for `useProviderCapabilities` covering a provider with multiple difficulties/types and one with single values.
- No new tests needed for the `dataValue` removal — existing provider tests and a passing build are sufficient.

## Personal Opinion

Both are valid cleanups. `useProviderCapabilities` is a minor but sensible DRY improvement — the duplicated length checks are easy to miss when adding a new capability. The `dataValue` removal is the more useful of the two: the field is genuinely confusing (it equals `id` on the only provider that uses it, making it look like a no-op), and removing it reduces cognitive overhead in the factory. Neither change is risky. Together they are small enough to ship as a single commit.
