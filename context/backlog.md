# Project Backlog

> Generated: 2026-03-14
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
- **[src/index.css:1]**: Google Fonts loaded via CSS `@import`, which is render-blocking. The browser must download the CSS file before it can discover and start the font request. **Fix**: Move Google Fonts `<link rel="preconnect">` and `<link rel="stylesheet">` tags into `index.html`'s `<head>`, remove the `@import` from CSS.
- **[src/api/providers.ts:20,25,40,121]**: Bare `axios.get()` calls have no timeout configuration. Slow networks can cause requests to hang indefinitely. **Fix**: Create a shared axios instance in `src/api/axiosInstance.ts` with a default 10s timeout.

### Low
- **[src/pages/Quiz.tsx:73-81]**: `difficultyLabel` and `typeLabel` are wrapped in `useMemo` but compute trivial array finds over 3-4 item arrays. The memoization adds cognitive overhead with no measurable benefit. **Fix**: Remove `useMemo` wrappers; use plain `const` declarations.

---

## Improvements & Refactors

### High
_None identified._

### Medium
- **[src/pages/Quiz.tsx, src/pages/Menu.tsx]**: Both pages duplicate the same fetch + loading + error + retry + abort pattern. **Refactor**: Extract a `useFetch` custom hook in `src/hooks/useFetch.ts` returning `{ data, loading, error, retry }`. Eliminates duplication and makes it easier to extend with caching or debouncing.
- **[src/App.tsx, src/pages/Menu.tsx, src/pages/Quiz.tsx]**: `token` and `selectedProvider` are prop-drilled through the tree. Menu and Quiz both re-call `getProvider(provider)` on every render. **Refactor**: Create a `ProviderContext` to centralize provider state and token, eliminating 3 prop drilling chains.
- **[src/components/ErrorBoundary.tsx:29]**: Error boundary renders `{this.state.error.message}` directly. API/axios error messages can be long technical strings that break layout. **Fix**: Truncate or cap displayed message length to something user-friendly.

### Low
- **[src/App.tsx:73]**: Root `<div>` uses inline `style={{ minHeight: '100vh' }}` — the only inline style in the project. **Fix**: Move to a CSS class or apply to `#root` in `index.css`.
- **[src/App.tsx:46-48]**: `selectedCategory` function just calls `setCategory`. The name reads like a noun, not an action. **Fix**: Rename to `handleCategorySelect` or pass `setCategory` directly as the prop.
- **[src/pages/Menu.tsx:61-71]**: Three single-line change handlers (`selectCategory`, `selectDifficulty`, `selectType`) all do the same thing with a different key. **Fix**: Replace with one generic `handleChange(key)` factory or use inline `onChange` handlers.
- **[src/api/providers.ts:161-164]**: `providerList` entries have an `icon` field (emoji strings) in the `ProviderListItem` type that is never rendered in the UI. **Fix**: Remove the `icon` field from the type and data, or render it in Menu's provider tab buttons.
- **[src/api/providers.ts:161-164]**: `providerList` duplicates `id` and `name` already present in the `providers` object. **Fix**: Derive `providerList` from `Object.values(providers)` for a single source of truth.
- **[src/App.css]**: Contains unused default Vite template styles (`.logo`, `.read-the-docs`, animations — lines 8-42). These are dead code. **Fix**: Remove them.

---

## Feature Ideas

### High
- **Score tracking & results summary**: Quiz already tracks pagination (`page` state) and Question already shows correct/incorrect visual feedback. Natural extension: add `userAnswers: Map<string, boolean>` to Quiz state, capture selections before reveal, show a results view on quiz completion with score and category breakdown. Store per-session scores in localStorage (aligns with no-backend architecture).
- **AI answer explanation**: After a question is revealed, offer a "Why?" button that calls the Claude API to explain why the correct answer is right in 2–3 sentences. Fills a real gap — the existing APIs return raw Q&A with zero context. Requires a lightweight backend proxy to avoid exposing API keys in the browser. Could be implemented as a minimal serverless function (e.g., Cloudflare Worker).
- **AI hint system**: Before revealing the answer, offer a "Hint" button that asks the Claude API for a nudge without spoiling the answer (e.g., "Think about the time period..." or "It's related to physics"). Complements the existing answer flow without requiring UI restructuring. Same backend proxy requirement as answer explanations.

### Medium
- **AI question provider (user-defined categories)**: Add a third provider backed by the Claude API that accepts a free-text category input and generates questions matching the existing normalized format (`question`, `correctAnswer`, `incorrectAnswers[]`, etc.). Fits the existing provider interface cleanly — no UI restructuring needed beyond a text input in Menu. Cost is negligible (~$0.001/batch). **Caveat**: LLMs can hallucinate incorrect "correct" answers; mitigate by restricting to lower-stakes categories (pop culture, entertainment) or using Sonnet over Haiku for factual topics. Add a "report bad question" flag for user feedback. Requires the same backend proxy as the other AI features.
- **Token exhaustion recovery**: `providers.ts` throws "Session token exhausted" but offers no recovery path — user must manually refresh. **Improvement**: App.tsx could catch this specific error and auto-refetch a new token, restarting the quiz seamlessly.
- **Difficulty progression mode**: Menu already has difficulty selection. Add a "Progressive" mode where difficulty auto-escalates after a correct-answer streak. `retrieveQuestions` already accepts a `difficulty` param, so this is mainly state logic + UX feedback.
- **Category-specific stats dashboard**: Quiz already renders a stats bar. Extend with localStorage-backed per-session/historical accuracy by category and difficulty, displayed as a modal or dropdown from the stats bar.
- **Keyboard navigation**: App is purely click-driven. Add keyboard shortcuts — number keys 1–4 for answers, Enter to reveal/next. `nextQuestions()` is already the pagination mechanism. Low-risk `useEffect` + keydown listeners on Question/Quiz.

### Low
- **Bookmark/favorite questions**: Add a bookmark button next to "Reveal Answer" in Question. Store bookmarks in localStorage keyed by question hash. Display a side panel in Quiz showing bookmarked questions.
- **Theme toggle (dark/light)**: CSS variables are already scoped (`--bg`, `--gold`, `--text`, etc. in `index.css`). Create a `.light-theme` class with inverted values, toggle via `document.documentElement.classList` from a Navbar button.
- **Test coverage gaps**: No tests for `App.tsx` (token fetching, provider switching), `Navbar.tsx`, or `ErrorBoundary.tsx`. No integration test for the Menu → Quiz navigation flow with actual route params.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 2 | 1 | 3 |
| Improvements & Refactors | 0 | 3 | 6 | 9 |
| Feature Ideas | 3 | 5 | 3 | 11 |
| **Total** | **3** | **10** | **10** | **23** |
