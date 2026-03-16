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
_None identified._

### Low
_None identified._

---

## Improvements & Refactors

### High
_None identified._

### Medium
_None identified._

### Low
_None identified._

---

## Feature Ideas

### High
- **#10** **Score tracking & results summary**: Quiz already tracks pagination (`page` state) and Question already shows correct/incorrect visual feedback. Natural extension: add `userAnswers: Map<string, boolean>` to Quiz state, capture selections before reveal, show a results view on quiz completion with score and category breakdown. Store per-session scores in localStorage (aligns with no-backend architecture).
- **#11** **AI answer explanation**: After a question is revealed, offer a "Why?" button that calls the Claude API to explain why the correct answer is right in 2–3 sentences. Fills a real gap — the existing APIs return raw Q&A with zero context. Requires a lightweight backend proxy to avoid exposing API keys in the browser. Could be implemented as a minimal serverless function (e.g., Cloudflare Worker).
- **#12** **AI hint system**: Before revealing the answer, offer a "Hint" button that asks the Claude API for a nudge without spoiling the answer (e.g., "Think about the time period..." or "It's related to physics"). Complements the existing answer flow without requiring UI restructuring. Same backend proxy requirement as answer explanations.

### Medium
- **#13** **AI question provider (user-defined categories)**: Add a third provider backed by the Claude API that accepts a free-text category input and generates questions matching the existing normalized format (`question`, `correctAnswer`, `incorrectAnswers[]`, etc.). Fits the existing provider interface cleanly — no UI restructuring needed beyond a text input in Menu. Cost is negligible (~$0.001/batch). **Caveat**: LLMs can hallucinate incorrect "correct" answers; mitigate by restricting to lower-stakes categories (pop culture, entertainment) or using Sonnet over Haiku for factual topics. Add a "report bad question" flag for user feedback. Requires the same backend proxy as the other AI features.
- **#14** **Token exhaustion recovery**: `providers.ts` throws "Session token exhausted" but offers no recovery path — user must manually refresh. **Improvement**: App.tsx could catch this specific error and auto-refetch a new token, restarting the quiz seamlessly.
- **#15** **Difficulty progression mode**: Menu already has difficulty selection. Add a "Progressive" mode where difficulty auto-escalates after a correct-answer streak. `retrieveQuestions` already accepts a `difficulty` param, so this is mainly state logic + UX feedback.
- **#16** **Category-specific stats dashboard**: Quiz already renders a stats bar. Extend with localStorage-backed per-session/historical accuracy by category and difficulty, displayed as a modal or dropdown from the stats bar.
- **#17** **Keyboard navigation**: App is purely click-driven. Add keyboard shortcuts — number keys 1–4 for answers, Enter to reveal/next. `nextQuestions()` is already the pagination mechanism. Low-risk `useEffect` + keydown listeners on Question/Quiz.

### Low
- **#18** **Bookmark/favorite questions**: Add a bookmark button next to "Reveal Answer" in Question. Store bookmarks in localStorage keyed by question hash. Display a side panel in Quiz showing bookmarked questions.
- **#19** **Theme toggle (dark/light)**: CSS variables are already scoped (`--bg`, `--gold`, `--text`, etc. in `index.css`). Create a `.light-theme` class with inverted values, toggle via `document.documentElement.classList` from a Navbar button.
- **#20** **Test coverage gaps**: No tests for `App.tsx` (token fetching, provider switching), `Navbar.tsx`, or `ErrorBoundary.tsx`. No integration test for the Menu → Quiz navigation flow with actual route params.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 0 | 0 | 0 |
| Feature Ideas | 3 | 5 | 3 | 11 |
| **Total** | **3** | **5** | **3** | **11** |
