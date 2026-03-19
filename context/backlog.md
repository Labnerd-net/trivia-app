# Project Backlog

> Generated: 2026-03-16
> Focus: Full audit

---

## Security

### High
- **#1 [src/api/providers.ts:33-38]**: Route params `categoryID`, `difficulty`, and `type` are interpolated directly into API URLs without validation. A crafted URL (e.g., `categoryID = "9&token=injected"`) can manipulate the outbound request. Fix: validate `categoryId` as numeric (OpenTDB) or known slug (The Trivia API); validate `difficulty` and `type` against `provider.difficulties`/`provider.types` allowlists before building the URL.

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

_None identified._

---

## Improvements & Refactors

### Medium
- **#10 [src/pages/Menu.tsx:70, src/components/ErrorBoundary.tsx:28-30]**: Inline `style` props are used in two places while the rest of the codebase uses `tq-*` CSS classes exclusively. Fix: extract into named `tq-*` classes in `index.css`.
- **#11 [src/pages/Quiz.tsx:19]**: `paginationControllerRef` aborts and immediately replaces the controller, but the `isFetching` guard on line 44 already prevents concurrent requests — there is never a concurrent request to cancel. Fix: remove the ref and rely on the `isFetching` guard, or add a comment explaining the intent.
- **#12 [src/context/ProviderContext.tsx:31-55, src/api/providers.ts:18-22]**: Token lifecycle is split — providers expose `getToken()` and `requiresToken`, but the context also owns the token fetch and state. Fix: move token fetching entirely into `ProviderContext`; providers should declare capability but not fetch.
- **#13 [src/App.tsx, src/pages/Menu.tsx, src/pages/Quiz.tsx]**: `category` is prop-drilled through App → Menu (callback) → Quiz (prop). Fix: move `category` into `ProviderContext` or a dedicated context, mirroring the existing pattern for `provider`/`token`.

### Low
- **#14 [src/App.tsx:13-15]**: `handleCategorySelect` is a one-liner wrapper around `setCategory` with no transformation. Fix: remove it and pass `setCategory` directly as the prop.
- **#16 [src/components/Question.tsx:41]**: `aria-label` on answer elements uses static strings (`'Answer option'`, `'Correct answer'`) without including the answer text. Screen readers will read meaningless labels. Fix: use `aria-label={decodeHtml(opt)}` or remove the label and let the visible text serve as the accessible name.
- **#17 [src/pages/Menu.tsx:99, 113, 127]**: Map iterator variables are named `data`, shadowing the outer `data` from `useFetch`. No runtime bug, but confusing during edits. Fix: rename to `cat` or `opt` as appropriate.
- **#18 [src/hooks/useFetch.ts, src/pages/Menu.tsx:32, src/pages/Quiz.tsx:37]**: Error message strings are hardcoded at each `useFetch` call site. Fix: move to a constants file or derive from operation type.
- **#19 [src/api/providers.ts:13, 85]**: Provider objects don't use `satisfies Provider` (TypeScript 4.9+), so missing required methods fail at runtime rather than compile time. Fix: add `satisfies Provider` to each provider object declaration.

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
| Security | 1 | 0 | 0 | 1 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 4 | 5 | 9 |
| Feature Ideas | 1 | 4 | 4 | 9 |
| **Total** | **2** | **8** | **9** | **19** |
