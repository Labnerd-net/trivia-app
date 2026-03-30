# Project Backlog

> Generated: 2026-03-26
> Focus: Full audit

---

## Security

### High
_None identified._

### Medium
_None identified._

### Low
_None identified._

---

## Bugs

### High
_None identified._

### Medium
_None identified._

### Low
_None identified._

---

## Performance

### High
- **#6 [src/api/providers.ts:173, 265]**: Race condition in `makeLocalProvider` and `makeSnapshotProvider` cache. Both use a simple `if (!cache)` guard — if two calls arrive before the first fetch resolves (e.g., React Strict Mode double-invoke or a mid-flight retry), both enter the branch and fire duplicate requests for multi-MB JSON files. **Fix**: Use an in-flight promise pattern: store the pending promise and `await` it on subsequent calls instead of re-fetching.

### Medium
- **#7 [src/pages/Menu.tsx:74–80]**: Provider group list is recomputed via `Array.from(new Set(...))` on every render. `providerList` is a module-level constant that never changes. **Fix**: Hoist the group computation to module scope in `providers.ts` or `Menu.tsx` so it runs once at import time.

### Low
_None identified._

---

## Improvements & Refactors

### High
- **#10 [src/api/providers.ts]**: Three factory/adapter patterns (`makeLocalProvider`, `makeSnapshotProvider`, plus two hardcoded live provider objects) create similar structures with duplicated logic across ~346 lines. **Fix**: Extract live providers to separate adapter modules (`src/api/adapters/opentdb.ts`, etc.) and unify factory logic to make adding future providers straightforward.

### Medium
- **#11 [src/context/ProviderContext.tsx:80]**: `ProviderProvider` renders a full-page loading/error div that replaces `children`, including `Navbar`. The theme toggle becomes inaccessible during token fetch. **Fix**: Move `ProviderProvider` below `Navbar` in `App.tsx`, or pass loading/error state through context and handle display inside `Menu`.
- **#12 [src/context/ProviderContext.tsx]**: Token lifecycle is tightly coupled to provider selection. Token refetch triggers even when switching to a provider that doesn't need one. `retryCount` is an ad-hoc retry mechanism. **Fix**: Extract token management to a `useProviderToken(provider)` hook; decouple from provider selection.
- **#16 [src/components/Question.tsx]**: Missing accessibility attributes — reveal button lacks `aria-expanded`, answer options lack `role="radio"` or keyboard navigation. **Fix**: Add `aria-expanded={showAnswers}` to the reveal button; add keyboard handlers to answer options.

### Low
- **#17 [src/pages/Menu.tsx, src/pages/Quiz.tsx]**: Provider capability checks (`provider.difficulties.length > 1`, etc.) are duplicated across both files. **Fix**: Extract to a `useProviderCapabilities(provider)` hook.
- **#18 [src/api/providers.ts:174–175]**: `categoryNameById` and `categoryLabelByValue` maps are built for all local providers but the `dataValue` field only exists in TP Millennium. **Fix**: Move the `dataValue` logic to the TP Millennium provider config only.

---

## Feature Ideas

### High
- **#22 [src/pages/Quiz.tsx, src/pages/Menu.tsx]**: No score tracking or session feedback. Users get no indication of how they performed. **Idea**: Track correct/incorrect count per question set; display accuracy on Quiz page; persist session history in `localStorage` to show "Last score: 7/10" on Menu.

### Medium
- **#23 [src/components/Question.tsx, src/api/providers.ts]**: No way to save interesting questions for later. **Idea**: Add a bookmark button to `Question.tsx` that persists to `localStorage`; create a "My Bookmarks" pseudo-provider accessible from the Menu provider select. Especially useful for card game sets used at trivia nights.
- **#24 [src/pages/Quiz.tsx]**: No post-quiz review capability. **Idea**: Add a lightweight export option — copy quiz results (questions + answers + score) as JSON or plain text for post-game review or sharing.

### Low
- **#25 [src/pages/Menu.tsx, src/context/ProviderContext.tsx]**: No way to search across providers. Users must know which provider has what content. **Idea**: A search box on Menu that filters questions across all loaded providers. High implementation complexity; only worth it once question counts grow further.
- **#26 [src/api/providers.ts]**: Local card providers use simple random sampling with no visibility into category distribution. **Idea**: UI toggle for "balanced sampling" that distributes questions evenly across categories. Low impact currently given small card sets.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 1 | 1 | 0 | 2 |
| Improvements & Refactors | 1 | 4 | 1 | 6 |
| Feature Ideas | 1 | 2 | 2 | 5 |
| **Total** | **3** | **7** | **3** | **13** |
