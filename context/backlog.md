# Project Backlog

> Generated: 2026-03-16
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

### Medium
- **#12 [src/context/ProviderContext.tsx:31-55, src/api/providers.ts:18-22]**: Token lifecycle is split — providers expose `getToken()` and `requiresToken`, but the context also owns the token fetch and state. Fix: move token fetching entirely into `ProviderContext`; providers should declare capability but not fetch.
- **#13 [src/App.tsx, src/pages/Menu.tsx, src/pages/Quiz.tsx]**: `category` is prop-drilled through App → Menu (callback) → Quiz (prop). Fix: move `category` into `ProviderContext` or a dedicated context, mirroring the existing pattern for `provider`/`token`.

### Low
_None identified._

---

## Feature Ideas

### High
- **#20 Score tracking**: `Question.tsx` has no answer selection or scoring. Add per-quiz score tracking — capture selected answers in `Quiz.tsx` state, display real-time score in the existing stats bar (lines 90-107), and show a final score summary before "Next Questions". Most fundamental missing feature for a quiz app.

### Medium
- **#22 Timed quiz mode**: Add an optional timer via a new field in `Menu.tsx`'s form. Manage countdown in `Quiz.tsx` with a `useEffect`. Auto-advance or mark incorrect on expiry.
- **#23 Difficulty progression mode**: Menu already has difficulty selection. Add a "Progressive" mode where difficulty auto-escalates after a correct-answer streak. `retrieveQuestions` already accepts a `difficulty` param, so this is mainly state logic + UX.
- **#24 Quiz history / statistics dashboard**: Store session results (category, score, timestamp) in localStorage. Display a summary page: total quizzes, average score, most-played category.
- **#25 Keyboard navigation**: App is purely click-driven. Add keyboard shortcuts — number keys 1–4 for answers, Enter to reveal/next. Low-risk `useEffect` + keydown listeners on Question/Quiz.

### Low
- **#26 Bookmarking questions**: Add a bookmark button in `Question.tsx`, persist to localStorage, and add a "Bookmarks" view accessible from `Navbar.tsx`.
- **#27 Category search/filter**: Replace the plain `<select>` in `Menu.tsx` with a searchable/filterable input for providers with many categories (OpenTDB has 24).
- **#28 Dark/light mode toggle**: App is dark-only. Add a toggle in `Navbar.tsx` backed by CSS custom properties and a localStorage preference.
- **#29 Test coverage gaps**: No tests for `App.tsx` (token fetching, provider switching), `Navbar.tsx`, or `ErrorBoundary.tsx`. No integration test for the Menu → Quiz navigation flow.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 1 | 0 | 1 |
| Feature Ideas | 1 | 4 | 4 | 9 |
| **Total** | **1** | **5** | **4** | **10** |
