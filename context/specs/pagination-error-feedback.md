# Spec for Pagination Error Feedback

Title: Pagination Error Feedback
Branch: claude/fix/pagination-error-feedback
Spec file: context/specs/pagination-error-feedback.md

## Summary

When the "Next Questions" button fails (network error, API rate limit, OpenTDB response codes 1/4/5), the error is silently swallowed. `isFetching` resets to `false`, the old questions remain visible, and the user receives no feedback. This fix adds a visible, dismissible error message for pagination failures.

## Functional Requirements

- Add a `paginationError` state to `Quiz.tsx`.
- On a failed `nextQuestions` call (any non-cancel error), set `paginationError` to a user-facing message.
- Render the error message below the quiz stats bar (or near the "Next Questions" button) when `paginationError` is set.
- The error message must be dismissible (clicking dismiss or retrying clears it).
- Clearing `paginationError` when a new `nextQuestions` call starts (so stale errors don't linger).
- The error should use the existing `tq-*` CSS class conventions (e.g., `tq-status error` or similar).

## Possible Edge Cases

- User clicks "Next Questions" multiple times in quick succession while an error is displayed — the state should clear and show fresh error if the retry also fails.
- Cancel errors (axios cancel) must not set `paginationError` — existing behaviour preserved.
- Provider-specific error codes (OpenTDB response_code 1, 4, 5) should ideally map to descriptive messages if the provider surfaces them; otherwise a generic fallback is fine.

## Acceptance Criteria

- A failed "Next Questions" request shows a visible error message to the user.
- The error message can be dismissed by the user.
- Initiating a new "Next Questions" request clears any existing pagination error.
- Cancel errors (navigating away mid-fetch) do not trigger the error message.
- Existing quiz flow (initial load, answer selection, scoring) is unaffected.

## Open Questions

- Should the error message include a retry button, or is re-clicking "Next Questions" sufficient? - sure, add a retry

## Testing Guidelines

Add tests to the existing `Quiz` test file:

- Simulate a failed `nextQuestions` fetch (mock `getQuestions` to reject) and assert the error message is rendered.
- Assert the error message is not shown on a successful fetch.
- Assert clicking dismiss removes the error message.
- Assert that a cancel error does not show the error message.

## Personal Opinion

This is a straightforward, high-value bug fix. Silent failures are a poor UX — users will be confused when clicking "Next Questions" does nothing. The change is minimal: one new state variable, one error assignment in the catch block, and a small conditional render. No concerns; this should be done.
