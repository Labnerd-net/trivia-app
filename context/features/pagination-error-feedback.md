# Plan: Pagination Error Feedback

Spec file: context/specs/pagination-error-feedback.md
Branch: claude/fix/pagination-error-feedback

## Files to Change

1. `src/constants/errorMessages.ts` — add `ERROR_NEXT_QUESTIONS` constant
2. `src/pages/Quiz.tsx` — add `paginationError` state, wire up error/dismiss/retry
3. `tests/Quiz.page.test.tsx` — add 4 new tests

---

## Step 1 — `src/constants/errorMessages.ts`

Add one constant:
```
ERROR_NEXT_QUESTIONS = 'Failed to load next questions'
```

---

## Step 2 — `src/pages/Quiz.tsx`

### 2a. Add state

```ts
const [paginationError, setPaginationError] = useState<string | null>(null);
```

### 2b. Update `nextQuestions`

- Clear `paginationError` at the top of the `if (!isFetching)` block (before `setIsFetching(true)`).
- In the `catch` block, replace the silent comment with:
  ```ts
  setPaginationError(ERROR_NEXT_QUESTIONS);
  ```
  Keep the `axios.isCancel` guard so cancel events stay silent.

### 2c. Render error + dismiss + retry

Below the stats bar, before the questions list, conditionally render when `paginationError` is set:

```tsx
{paginationError && (
  <div className="tq-status error">
    <div>{paginationError}</div>
    <div className="tq-form-actions">
      <button className="tq-btn tq-btn-primary" onClick={() => { setPaginationError(null); nextQuestions(); }}>
        Retry
      </button>
      <button className="tq-btn tq-btn-ghost" onClick={() => setPaginationError(null)}>
        Dismiss
      </button>
    </div>
  </div>
)}
```

Place this between the stats bar `div` and the questions list `div`.

---

## Step 3 — `tests/Quiz.page.test.tsx`

Add a new `describe('nextQuestions error handling')` block with:

1. **Failed fetch shows error** — resolve initial fetch, then mock second call to reject; click "Next Questions"; assert `'Failed to load next questions'` is in the DOM.
2. **Successful fetch shows no error** — resolve both calls; click "Next Questions"; assert error message is absent.
3. **Dismiss button clears error** — trigger error as in test 1; click "Dismiss"; assert error is removed.
4. **Cancel does not show error** — mock second call to reject with an axios `CancelledError`; click "Next Questions"; assert error message is absent.

---

## Notes

- No new CSS needed; `tq-status error` and `tq-form-actions` are existing classes.
- Import `ERROR_NEXT_QUESTIONS` into `Quiz.tsx` alongside the existing `ERROR_FETCH_QUESTIONS` import.
- The "Retry" button in the error banner calls `nextQuestions()` directly — no separate handler needed.
- Retry clears `paginationError` first (via the clear at the top of `nextQuestions`), so the double-clear in the button handler is harmless but explicit.
