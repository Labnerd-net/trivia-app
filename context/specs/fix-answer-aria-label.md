# Spec for Fix Answer aria-label Accessibility

Title: Fix Answer aria-label Accessibility
Branch: claude/fix/fix-answer-aria-label
Spec file: context/specs/fix-answer-aria-label.md

## Summary

Answer `<div>` elements in `Question.tsx` currently carry static `aria-label` values (`'Answer option'` and `'Correct answer'`) that do not include the actual answer text. A screen reader user hears only those meaningless labels instead of the answer content, making the quiz unusable without sight. The fix is to either include the decoded answer text in the label or remove the label entirely and let the visible text serve as the accessible name.

## Functional Requirements

- Each answer element must expose a meaningful accessible name to screen readers.
- The accessible name should include the decoded answer text (HTML entities decoded via `decodeHtml`).
- Optionally prefix with correctness state when answers are revealed (e.g. `"Correct: Paris"` vs `"Paris"`), but this is secondary to having the text at all.
- No visual change to the rendered UI.

## Possible Edge Cases

- Answer text contains special characters or HTML entities — must pass through `decodeHtml` before use in the label.
- True/false questions have only two answers — labels should still be meaningful.
- `aria-label` vs no `aria-label`: removing the attribute and relying on inner text is valid only if the inner text is a flat, readable string. The current inner markup (`tq-answer-letter` + `tq-answer-text`) may cause screen readers to read "A Paris" which is acceptable, making removal a valid alternative.

## Acceptance Criteria

- [ ] No answer element has a static `aria-label` of `'Answer option'` or `'Correct answer'`.
- [ ] Screen reader software (or an accessibility audit) reports each answer with a label that includes its text content.
- [ ] Build passes with no TypeScript or lint errors.
- [ ] Existing tests continue to pass; update any test that checks the old static label strings.

## Open Questions

- Should the label expose correctness state before or only after the user reveals answers? (Revealing it early would spoil the answer for sighted users using AT.) - after

## Testing Guidelines

Create or update tests in `./tests` for `Question.tsx`:

- Verify that each rendered answer element's accessible name includes the decoded answer text.
- Verify no answer element has the old static label strings (`'Answer option'`, `'Correct answer'`).
- Cover the revealed state to ensure correctness state (if included) is reflected.

## Personal Opinion

This is a straightforward, low-risk a11y fix. The simplest correct solution is to remove the `aria-label` entirely — the existing inner markup already produces a readable string (`"A Paris"`) that most screen readers handle fine. Adding a custom label only creates maintenance burden. I'd lean toward removal unless there's a specific reason to craft a richer label (e.g. announcing correctness). The fix is small enough that it warrants no architecture changes.
