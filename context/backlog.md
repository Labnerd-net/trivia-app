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
_None identified._

### Medium
_None identified._

### Low
_None identified._

---

## Improvements & Refactors

### High
_None identified._

### Medium
- **#12 [src/context/ProviderContext.tsx]**: Token lifecycle is tightly coupled to provider selection. Token refetch triggers even when switching to a provider that doesn't need one. `retryCount` is an ad-hoc retry mechanism. **Fix**: Extract token management to a `useProviderToken(provider)` hook; decouple from provider selection.
- **#16 [src/components/Question.tsx]**: Missing accessibility attributes — reveal button lacks `aria-expanded`, answer options lack `role="radio"` or keyboard navigation. **Fix**: Add `aria-expanded={showAnswers}` to the reveal button; add keyboard handlers to answer options.

### Low
_None identified._

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
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 3 | 0 | 3 |
| Feature Ideas | 1 | 2 | 2 | 5 |
| **Total** | **1** | **5** | **2** | **8** |
