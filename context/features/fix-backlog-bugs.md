# Implementation Plan: Fix Backlog Bugs

**Branch:** `claude/fix/fix-backlog-bugs`
**Files touched:** `src/pages/Quiz.tsx`, `src/pages/Menu.tsx`

---

## Overview

Four bugs are being fixed across two files. Two are high-severity correctness issues (duplicate fetch on retry, missing abort on pagination), one is a medium-severity stale dependency (spurious re-runs on provider change), and one is a low-severity key collision risk. All are isolated changes with no cross-file dependencies.

---

## Bug 1 — Quiz.tsx:51: `retryCount` in `useCallback` dependency array

**Problem:** `retryCount` is listed as a dependency of `retrieveQuestions` (line 51). Every time the user hits Retry and `retryCount` increments, React creates a new callback reference. The `useEffect` at line 53-57 lists `retrieveQuestions` as its only dependency, so the effect re-runs immediately on the new reference — correct — but the callback also changes reference during normal renders unrelated to retries, and any future consumer of `retrieveQuestions` would get a new reference on every retry even if they only needed the function signature to be stable.

**Fix (2 changes):**

1. Remove `retryCount` from the `useCallback` dependency array on line 51. The array should be: `[categoryID, difficulty, type, token, currentProvider]`.
2. Add `retryCount` to the `useEffect` dependency array on line 57. The array changes from `[retrieveQuestions]` to `[retrieveQuestions, retryCount]`.

**Result:** `retrieveQuestions` reference is now stable across retries. The `useEffect` still re-runs when `retryCount` changes, and the callback reference does not churn on each retry.

---

## Bug 2 — Quiz.tsx:59-67: `nextQuestions` has no AbortController

**Problem:** `nextQuestions` calls `retrieveQuestions()` with no signal. If the user clicks "Next Questions" while a prior pagination fetch is still in-flight, the old fetch is never cancelled. Both complete, the second one wins (overwrites state), and the first one's state update races with the second.

**Fix (3 changes):**

1. Add `useRef` to the React import on line 1.
2. After the existing `useState` declarations, declare: `const paginationControllerRef = useRef<AbortController | null>(null)`.
3. Inside `nextQuestions`, before calling `retrieveQuestions`: abort the existing controller via `paginationControllerRef.current?.abort()`, create a new `AbortController`, assign it to `paginationControllerRef.current`, and pass its signal to `retrieveQuestions`.

**Result:** Each "Next Questions" click cancels any in-flight pagination request before starting a new one. Cancelled requests are caught by `axios.isCancel(err)` which suppresses the error — correct behavior.

**Risk:** Do not pass the pagination signal to the `useEffect`-driven initial fetch — keep the two AbortControllers separate.

---

## Bug 3 — Menu.tsx:59: `currentProvider` in `useEffect` dependency array

**Problem:** The `useEffect` dependency array includes `currentProvider`, which is a derived object recreated on every render. This causes the effect to re-run on every render, not just when the provider actually changes.

**Fix (1 change):**

Remove `currentProvider` from the dependency array on line 59. The array becomes `[provider, retryCount]`.

**Linter note:** If ESLint `react-hooks/exhaustive-deps` warns about `currentProvider` being used inside the effect but not listed, move the `getProvider(provider)` call inside the effect body itself as a local const. The outer `const currentProvider` on line 31 can remain for JSX use — the effect just should not close over it.

---

## Bug 4 — Quiz.tsx:117: `key` prop collision risk on `Question` components

**Problem:** The `key` prop is built from category/question/difficulty. If the same question appears in two batches, React reuses the component instance and carries over internal state (selected answer, scoring).

**Fix (1 change):**

On line 117, change the `key` prop to `` `${page}-${idx}` ``. Both `page` and `idx` are already in scope.

---

## Sequencing

1. Bug 3 (Menu.tsx) — simplest, isolated
2. Bug 1 (Quiz.tsx) — dep array restructure
3. Bug 2 (Quiz.tsx) — adds `useRef` for pagination abort
4. Bug 4 (Quiz.tsx) — trivial one-liner

After all changes: run `npm run build`, verify zero new errors. Check Network tab in DevTools: rapid "Next Questions" clicks should cancel prior requests. Provider switches in Menu should trigger exactly one categories fetch.

---

## Things to Watch Out For

- **`useRef` import** — not currently in Quiz.tsx imports; missing it causes a build error.
- **ESLint `exhaustive-deps`** — Bug 3 is the only fix that may trigger a linter warning; apply the move-inside-effect mitigation if needed.
- **Keep the two AbortControllers separate** — the `useEffect` controller handles unmount/param changes; the `paginationControllerRef` handles only "Next Questions" clicks.
- **Signal must actually be passed** — easy to create the controller but forget to pass `.signal` to `retrieveQuestions`.
