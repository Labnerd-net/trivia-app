# Plan: Extract Provider Adapters to Separate Modules

## Context

`src/api/providers.ts` is a 357-line monolithic file containing all provider logic: two hardcoded live provider objects, two factory functions with shared utility logic, 7 provider instantiations, and the registry exports. The `shuffleArray` utility and the in-flight promise pattern are duplicated across `makeLocalProvider` and `makeSnapshotProvider`. Extracting into separate adapter modules makes each provider independently readable and reduces the surface area of `providers.ts` to registry-only logic.

---

## Approach: Extract into `src/api/adapters/`

No consumer changes are needed — all existing exports (`providers`, `providerList`, `providerGroups`, `getProvider`) remain on `providers.ts`. This is a pure structural refactor.

---

## Files to Create

### `src/api/adapters/utils.ts`
- `shuffleArray<T>` function (currently duplicated between the two factories)
- Local types: `CardQuestion`, `CategoryDef`, `SnapshotFile`

### `src/api/adapters/opentdb.ts`
- Move `openTDBProvider` object verbatim
- Imports: `axiosInstance` from `../axiosInstance`, types from `../../types`

### `src/api/adapters/triviaapi.ts`
- Move `triviaAPIProvider` object verbatim
- Imports: `axiosInstance` from `../axiosInstance`, types from `../../types`

### `src/api/adapters/localProviders.ts`
- Move `makeLocalProvider` factory (uses `shuffleArray` from `./utils`)
- Move `allOfUsProvider`, `mindTheGapProvider`, `tpMillenniumProvider` instantiations
- Imports: `axiosInstance` from `../axiosInstance`, types from `../../types`, `shuffleArray`/`CardQuestion`/`CategoryDef` from `./utils`

### `src/api/adapters/snapshotProviders.ts`
- Move `makeSnapshotProvider` factory (uses `shuffleArray` from `./utils`)
- Move `opentdbOfflineProvider`, `triviaAPIOfflineProvider` instantiations
- Imports: `axiosInstance` from `../axiosInstance`, types from `../../types`, `shuffleArray`/`SnapshotFile` from `./utils`

---

## Files to Modify

### `src/api/providers.ts` (reduce to registry only)
- Remove all provider logic (factories, utilities, inline objects)
- Import all 7 provider instances from their adapter files
- Keep existing exports unchanged: `providers`, `providerList`, `providerGroups`, `getProvider`

---

## Files Unchanged

- `src/context/ProviderContext.tsx` — imports `getProvider` from `providers.ts`
- `src/pages/Menu.tsx` — imports `providerList`, `providerGroups` from `providers.ts`
- `tests/providers.test.ts` — imports `getProvider` from `providers.ts`; mocks `axiosInstance` by module path, which still resolves correctly after refactor

---

## Critical Files

| File | Role |
|------|------|
| `src/api/providers.ts` | Rewritten to registry-only |
| `src/api/axiosInstance.ts` | Imported by all adapter files (path: `../axiosInstance`) |
| `src/types/index.ts` | `Provider`, `GetQuestionsOptions`, `NormalizedQuestion` types used in adapters |
| `tests/providers.test.ts` | Must pass unchanged after refactor |

---

## Verification

1. `npm run build` — must pass with no TypeScript errors
2. Run full test suite — `tests/providers.test.ts` must pass without modification
3. Manual smoke test in browser: verify all 7 providers load, categories fetch, questions fetch
