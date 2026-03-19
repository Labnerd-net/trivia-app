# Plan: Fix Answer aria-label Accessibility (#16)

## Context

`Question.tsx:41` sets a static `aria-label` of `'Answer option'` or `'Correct answer'` on each answer div. Screen readers announce only those strings — the actual answer text is ignored. The fix is to make the label include the decoded answer text, and after answers are revealed, prefix the correct answer with `"Correct: "` so screen reader users also get correctness state.

## Files to Modify

- `src/components/Question.tsx` — change `aria-label` expression
- `tests/Question.component.test.tsx` — update tests that query by the old static labels

## Implementation

### 1. `src/components/Question.tsx:41`

Replace the static `aria-label` ternary with a dynamic one:

```tsx
aria-label={showAnswers && opt === question.correctAnswer
  ? `Correct: ${decodeHtml(opt)}`
  : decodeHtml(opt)}
```

- Hidden state: each answer gets its decoded text as the label (e.g. `"Paris"`)
- Revealed + correct: `"Correct: Paris"`
- Revealed + wrong: just `"London"` (no prefix — wrong is the default/implicit state)

### 2. `tests/Question.component.test.tsx`

Two tests use the old static labels and must be updated:

**Test: "after clicking Reveal Answer"**

- `getByLabelText('Correct answer')` → `getByLabelText('Correct: Paris')`
- `getAllByLabelText('Answer option')` → query the three wrong answers individually using their decoded text labels: `getByLabelText('London')`, `getByLabelText('Berlin')`, `getByLabelText('Madrid')`

**Test: "clicking Hide Answer removes reveal classes and restores button text"**

- After hiding, the correct answer label reverts to just `"Paris"` (no "Correct: " prefix)
- `getByLabelText('Correct answer')` → `getByLabelText('Paris')`
- `getAllByLabelText('Answer option')` → same individual label queries as above (`'London'`, `'Berlin'`, `'Madrid'`)

## Verification

1. `npm run build` — must pass with no TypeScript or lint errors
2. Run test suite — all existing tests must pass with updated label queries
3. Manually spot-check in browser: inspect a question div's `aria-label` attribute in DevTools to confirm it shows the answer text
