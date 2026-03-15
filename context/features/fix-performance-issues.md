# Implementation Plan: Fix Performance Issues

**Branch:** `claude/fix/fix-performance-issues`
**Files touched:** `src/index.css`, `src/pages/Quiz.tsx`, `src/api/providers.ts`, `src/api/axiosInstance.ts` (new)

---

## Context

Three performance issues from context/backlog.md. All small and isolated.

Key finding: The Google Fonts `<link>` tags are already present in `index.html` (lines 9-11). Perf 1 is just removing the duplicate `@import` from CSS — no index.html changes needed.

---

## Perf 1 — Remove duplicate Google Fonts @import

**File:** `src/index.css` line 1

Delete the `@import url('https://fonts.googleapis.com/...')` line. The fonts are already loaded via `<link>` tags in `index.html` — this `@import` is a redundant render-blocking request.

---

## Perf 2 — Shared axios instance with timeout

**New file:** `src/api/axiosInstance.ts`

Create a shared axios instance with a 10-second timeout.

**File:** `src/api/providers.ts`

- Replace `import axios from 'axios'` with import of the shared instance
- Update all 4 call sites (lines 20, 25, 40, 121) to use the instance
- All 4 calls already pass `{ signal }` — timeout goes on the instance, not per-call

---

## Perf 3 — Remove useMemo from trivial array finds

**File:** `src/pages/Quiz.tsx` lines 77-85

Replace both `useMemo` blocks with plain `const`. Remove `useMemo` from the React import (no other usages in the file).

---

## Sequencing

1. Perf 1 — one-line deletion in index.css
2. Perf 3 — useMemo removal in Quiz.tsx
3. Perf 2 — new axiosInstance.ts + update providers.ts

---

## Verification

- `npm run build` must pass with no errors or new warnings
- Browser DevTools: verify fonts load from `<link>` tag only (no second font request from CSS)
- Browser DevTools: throttle to Slow 3G, confirm stalled requests error after ~10s with existing error UI
- Existing tests should pass without modification
