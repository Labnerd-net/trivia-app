# Plan: Decode HTML Entity Coverage and Memoization

## Context

The current `decodeHtml` in `src/utils/index.ts` is a handwritten regex implementation that covers only 6 named HTML entities. OpenTDB returns entities like `&nbsp;`, `&eacute;`, `&ndash;`, `&rsquo;` that pass through unchanged, showing as literal HTML in rendered text. A duplicate of this function exists in `scripts/download-trivia.mjs` (lines 28-34) that must be manually kept in sync. Additionally, `decodeHtml` is called on every render in `Question.tsx` for every question and answer string, despite the decoded values never changing between renders.

Decision: replace with the `he` library, which is well-audited, handles all named and numeric entities, and works in both browser and Node.js contexts.

---

## Steps

### 1. Install `he`

```
npm install he
npm install -D @types/he
```

### 2. Replace `decodeHtml` in `src/utils/index.ts`

- Remove the `NAMED_ENTITIES` table and the three-regex chain
- Import `he` and rewrite `decodeHtml` as a thin wrapper: `return he.decode(html)`
- Keep the same exported function signature — no call-site changes needed

**File:** `src/utils/index.ts`

### 3. Update `scripts/download-trivia.mjs`

- Add `import he from 'he'` at the top (file is already ESM `.mjs`)
- Remove the local `decodeHtml` function (lines 28-34)
- Replace the three `decodeHtml(...)` calls (lines 113-115) with `he.decode(...)`

**File:** `scripts/download-trivia.mjs`

### 4. Memoize decoded values in `Question.tsx`

Current call sites (all re-run on every render):
- Line 32: `decodeHtml(question.question)` — question text
- Line 42: `decodeHtml(question.correctAnswer)` — open answer reveal
- Lines 50, 53: `decodeHtml(opt)` inside `.map()` over shuffled answers

Add three `useMemo` calls inside the component (after the existing `useState`/`useCallback`):
```ts
const decodedQuestion = useMemo(() => decodeHtml(question.question), [question.question]);
const decodedCorrectAnswer = useMemo(() => decodeHtml(question.correctAnswer), [question.correctAnswer]);
const decodedAnswers = useMemo(
  () => shuffleAnswers(question).map(decodeHtml),
  [question]
);
```

Replace the inline `decodeHtml(...)` and `shuffledAnswers.map(decodeHtml)` calls with these memo values.

**Note:** `shuffleAnswers` is currently called inline on every render too — memoizing it alongside `decodeHtml` in `decodedAnswers` is a natural, free improvement with no behaviour change (the shuffle result for a given question object is stable once memoized).

**File:** `src/components/Question.tsx`

### 5. Update `tests/utils.test.ts`

Add test cases to the existing `decodeHtml` describe block for entities the old implementation missed:
- `&nbsp;` → non-breaking space (`\u00A0`)
- `&eacute;` → `é`
- `&ndash;` → `–`
- `&rsquo;` → `'`
- `&mdash;` → `—`

Existing tests for `&amp;`, `&lt;`, `&#8217;`, `&#x2019;`, empty string, and plain strings remain as-is and must continue to pass.

**File:** `tests/utils.test.ts`

---

## Files Changed

| File | Change |
|------|--------|
| `package.json` / `package-lock.json` | Add `he` + `@types/he` |
| `src/utils/index.ts` | Replace regex impl with `he.decode()` wrapper |
| `src/components/Question.tsx` | Add `useMemo` for decoded question, answer, and options |
| `scripts/download-trivia.mjs` | Import `he`, remove duplicate `decodeHtml`, update 3 call sites |
| `tests/utils.test.ts` | Add 5 new named-entity test cases |

---

## Verification

1. `npm run build` — must pass with no TypeScript errors
2. `npm run test` — all 76 existing tests pass; new utils tests pass
3. Dev server smoke test: load a quiz from OpenTDB, verify questions with accented characters or special punctuation render correctly (not as `&eacute;` etc.)
