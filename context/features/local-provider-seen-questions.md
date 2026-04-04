# Plan: Local Provider Seen Questions Tracker

## Context

Local providers (All Of Us, Mind the Gap, Trivial Pursuit Millennium) currently call `shuffleArray(pool).slice(0, amount)` on every `getQuestions` invocation. This means repeated questions can appear across "Next Questions" fetches within the same session. The fix adds per-category seen-question tracking inside the `makeLocalProvider` closure so already-shown questions are excluded until the pool is exhausted, at which point the tracker silently resets.

## Critical Files

- `src/api/adapters/localProviders.ts` — only file to modify
- `tests/providers.test.ts` — existing test file; new local provider tests go here (or a new dedicated file)

## Implementation

### 1. Add seen-question tracking to `makeLocalProvider` closure (`localProviders.ts`)

Add a `Map<string, Set<CardQuestion>>` to the factory closure alongside `dataPromise`:

```
const seenByCategory = new Map<string, Set<CardQuestion>>();
```

### 2. Replace the shuffle-and-slice logic in `getQuestions`

Current (line 39):
```
results: shuffleArray(pool).slice(0, amount).map(...)
```

Replace the pool selection with:
1. Compute `cacheKey = categoryId ?? 'all'`
2. Get or initialize the `seen` Set for that key
3. Compute `unseen = pool.filter(q => !seen.has(q))`
4. If `unseen.length < amount`, clear the seen set and use the full `pool` as the source
5. Shuffle the source, slice to `amount`, record picked questions in `seen`
6. Map picked questions to normalized results (same `.map()` as today)

This uses object reference equality — safe because `allQuestions` is the same cached array across all calls.

No changes needed to `utils.ts`, `snapshotProviders.ts`, or any other file.

## Tests (`tests/providers.test.ts` or new `tests/localProviders.test.ts`)

Mock `axiosInstance.get` to return a small known dataset (e.g., 5 questions across 2 categories). Cover:

1. Repeated calls exhaust the pool without duplicates before reset
2. After exhaustion, the next call resets and returns questions again (no error, full pool available)
3. Per-category tracking is independent (seen in category A doesn't affect category B)
4. `'all'` category (no `categoryId`) tracks separately from named categories
5. Requesting `amount` larger than the pool resets and returns all available questions

## Verification

- `npm run build` — no TypeScript errors
- `npm run lint` — clean
- Run tests — all existing 95 pass, new tests pass
- Manual smoke test: open a local provider in the browser, click "Next Questions" repeatedly — confirm no duplicates appear until the pool resets
