# Spec for local-provider-seen-questions

Title: Local Provider Seen Questions Tracker
Branch: claude/feature/local-provider-seen-questions
Spec file: context/specs/local-provider-seen-questions.md

## Summary

Local providers (All Of Us, Mind the Gap, Trivial Pursuit Millennium) currently shuffle and return a random subset of questions on every call to `getQuestions`. This means repeated questions can appear across "Next Questions" fetches within the same session. This feature adds per-category seen-question tracking inside each local provider's closure so that already-shown questions are skipped. When all questions in a pool have been shown, the tracker resets and the full pool becomes available again.

## Functional Requirements

- Each local provider instance tracks which questions have been seen, keyed by category.
- When `getQuestions` is called, questions already seen in the current category are excluded from the candidate pool.
- The requested `amount` of questions is drawn from the unseen pool and marked as seen.
- If the unseen pool has fewer questions remaining than the requested `amount`, the tracker for that category resets before drawing, making all questions available again.
- Resetting is silent — no user-facing message is required.
- Tracking is scoped to the provider instance's lifetime (in-memory, session only). Refreshing the page resets all trackers.
- Changing category resets nothing; each category maintains its own independent tracker.

## Possible Edge Cases

- Requesting more questions than the total pool size for a category — should reset and serve what's available.
- The "Any Category" option (id: `all`) uses the full question pool; it should have its own tracker independent of individual category trackers.
- Rapid successive calls before the data promise resolves should not corrupt tracker state.

## Acceptance Criteria

- After cycling through all questions in a category, the next fetch returns questions from the beginning of the pool (reset), not an empty result.
- No question appears twice within a single pass through the pool (before reset).
- Switching between categories does not affect each category's tracker.
- The "Any Category" selection tracks seen questions separately from individual categories.
- Behavior of online providers and snapshot providers is unchanged.

## Open Questions

- Should the reset be communicated to the user (e.g., a subtle indicator that the pool has cycled)? Currently specced as silent. - silent is fine

## Testing Guidelines

Create a test file in `./tests` for this feature. Focus on:

- Calling `getQuestions` repeatedly exhausts the pool without duplicates before reset.
- After pool exhaustion, the next call resets and returns questions again.
- Per-category tracking is independent (seen questions in one category don't affect another).
- "Any Category" (id: `all`) tracks separately from named categories.

## Personal Opinion

This is a good, low-risk improvement. The closure already holds `dataPromise` as local state, so adding a `Map` of seen-index sets is a natural extension of the same pattern. The reset-on-exhaustion behavior is simple and avoids any UX complexity. The only mild concern is that "Any Category" and individual categories could overlap (a question seen under "Any Category" won't be excluded when browsing a specific category), but that's an acceptable tradeoff given the scope. Overall, straightforward and worth doing.
