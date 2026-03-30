# Plan: Performance Fix Provider Cache and Group List

Spec: context/specs/perf-provider-cache-and-groups.md
Branch: claude/fix/perf-provider-cache-and-groups

---

## Files to Change

1. `src/api/providers.ts` — fix both factory caches; export `providerGroups`
2. `src/pages/Menu.tsx` — import and use `providerGroups`

---

## Step 1 — Fix `makeLocalProvider` cache race (providers.ts ~line 173)

Replace the simple nullable variable with an in-flight promise variable:

**Before:**
```ts
let cache: CardQuestion[] | null = null;
// ...
if (!cache) {
  const response = await axiosInstance.get<{ questions: CardQuestion[] }>(dataFile, { signal });
  cache = response.data.questions;
}
// use cache
```

**After:**
```ts
let dataPromise: Promise<CardQuestion[]> | null = null;
// ...
if (!dataPromise) {
  dataPromise = axiosInstance
    .get<{ questions: CardQuestion[] }>(dataFile, { signal })
    .then(r => r.data.questions)
    .catch(err => { dataPromise = null; throw err; });
}
const allQuestions = await dataPromise;
// use allQuestions
```

The `.catch` resets `dataPromise` to `null` on failure so a subsequent retry fires a fresh request rather than re-awaiting a rejected promise.

---

## Step 2 — Fix `makeSnapshotProvider` cache race (providers.ts ~line 265)

Same pattern on the inner `load` helper:

**Before:**
```ts
let cache: NormalizedQuestion[] | null = null;

async function load(signal?: AbortSignal) {
  if (cache) return cache;
  const response = await axiosInstance.get<SnapshotFile>(dataFile, { signal });
  cache = response.data.questions;
  return cache;
}
```

**After:**
```ts
let dataPromise: Promise<NormalizedQuestion[]> | null = null;

async function load(signal?: AbortSignal) {
  if (!dataPromise) {
    dataPromise = axiosInstance
      .get<SnapshotFile>(dataFile, { signal })
      .then(r => r.data.questions)
      .catch(err => { dataPromise = null; throw err; });
  }
  return dataPromise;
}
```

---

## Step 3 — Export `providerGroups` (providers.ts, after `providerList`)

Add one line after the existing `providerList` export:

```ts
export const providerGroups = [...new Set(providerList.map(p => p.group))];
```

This runs once at module load time and is stable for the lifetime of the app.

---

## Step 4 — Use `providerGroups` in Menu.tsx (line 75)

Update the import from `providers`:
```ts
import { providerList, providerGroups } from '../api/providers';
```

Replace the inline computation in the JSX:
```tsx
// Before
{Array.from(new Set(providerList.map((p) => p.group))).map((group) => (

// After
{providerGroups.map((group) => (
```

---

## Notes

- No new test files needed. Existing 91 tests cover the affected components.
- The `signal` from the first concurrent caller is bound to the in-flight request. Subsequent callers share that promise and cannot individually cancel it — this is an acceptable and standard trade-off for request deduplication.
- Build verification (`npm run build`) must pass before committing.
