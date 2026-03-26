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
- **#3 [src/pages/Quiz.tsx:61–64]**: Pagination errors in `nextQuestions` are silently swallowed. If "Next Questions" fails (network error, API rate limit, OpenTDB response code 1/4/5), `isFetching` resets to `false` and the old questions remain with no user feedback. **Fix**: Add a `paginationError` state and render a dismissible error message.

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
- **#8 [src/components/Question.tsx, src/utils/index.ts]**: `decodeHtml` is called on every render for question and answer text, running multiple regex passes per string. **Fix**: Memoize with `useMemo` in `Question.tsx`, or pre-decode at the API normalization layer in `providers.ts`.

---

## Improvements & Refactors

### High
- **#9 [src/utils/index.ts:6–20]**: `decodeHtml` uses a partial named-entity table and will pass through any entity not in its list (e.g., `&nbsp;`, `&eacute;`, `&ndash;`) as literal HTML in rendered text. **Fix**: Replace with the browser's native textarea trick: `const el = document.createElement('textarea'); el.innerHTML = html; return el.value;` — handles all named entities without any regex.
- **#10 [src/api/providers.ts]**: Three factory/adapter patterns (`makeLocalProvider`, `makeSnapshotProvider`, plus two hardcoded live provider objects) create similar structures with duplicated logic across ~346 lines. **Fix**: Extract live providers to separate adapter modules (`src/api/adapters/opentdb.ts`, etc.) and unify factory logic to make adding future providers straightforward.

### Medium
- **#11 [src/context/ProviderContext.tsx:80]**: `ProviderProvider` renders a full-page loading/error div that replaces `children`, including `Navbar`. The theme toggle becomes inaccessible during token fetch. **Fix**: Move `ProviderProvider` below `Navbar` in `App.tsx`, or pass loading/error state through context and handle display inside `Menu`.
- **#12 [src/context/ProviderContext.tsx]**: Token lifecycle is tightly coupled to provider selection. Token refetch triggers even when switching to a provider that doesn't need one. `retryCount` is an ad-hoc retry mechanism. **Fix**: Extract token management to a `useProviderToken(provider)` hook; decouple from provider selection.
- **#15 [src/types/index.ts, src/utils/index.ts]**: `shuffleAnswers` treats `'boolean'` and `'open'` as the same branch, returning `['True', 'False']` for open questions. `Question.tsx` guards against rendering this but the call is still made. **Fix**: Add explicit `'open'` early return and consider narrower type guards for question types.
- **#16 [src/components/Question.tsx]**: Missing accessibility attributes — reveal button lacks `aria-expanded`, answer options lack `role="radio"` or keyboard navigation. **Fix**: Add `aria-expanded={showAnswers}` to the reveal button; add keyboard handlers to answer options.

### Low
- **#17 [src/pages/Menu.tsx, src/pages/Quiz.tsx]**: Provider capability checks (`provider.difficulties.length > 1`, etc.) are duplicated across both files. **Fix**: Extract to a `useProviderCapabilities(provider)` hook.
- **#18 [src/api/providers.ts:174–175]**: `categoryNameById` and `categoryLabelByValue` maps are built for all local providers but the `dataValue` field only exists in TP Millennium. **Fix**: Move the `dataValue` logic to the TP Millennium provider config only.
- **#19 [src/utils/index.ts]**: `shuffleAnswers` returns a meaningless `['True', 'False']` array for `'open'` type questions that `Question.tsx` then discards. **Fix**: Return early for `'open'` type.
- **#21 [scripts/download-trivia.mjs:28–34]**: `decodeHtml` is duplicated from `src/utils/index.ts`. Any fix to entity decoding must be manually mirrored to this script. Low priority as it's a build-time script.

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
| Bugs | 1 | 0 | 0 | 1 |
| Performance | 1 | 1 | 1 | 3 |
| Improvements & Refactors | 2 | 4 | 4 | 10 |
| Feature Ideas | 1 | 2 | 2 | 5 |
| **Total** | **5** | **7** | **7** | **19** |
