# Current Feature

## Current Feature Spec File

Title:
Spec file:
Branch:

## Current Feature Plan File

Plan File:

## History

<!-- Keep this updated. Earliest to latest -->
- 2026-03-14: Security hardening — replaced innerHTML-based decodeHtml with DOM-free regex decoder; added X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and CSP headers to nginx.conf
- 2026-03-15: Fix backlog bugs — removed retryCount from useCallback deps (Quiz.tsx), added AbortController to nextQuestions pagination, removed currentProvider from Menu.tsx useEffect deps, fixed Question key prop collision risk
- 2026-03-15: Fix performance issues — removed duplicate Google Fonts @import from index.css, created shared axiosInstance with 10s timeout replacing all bare axios.get() calls in providers.ts, removed useMemo wrappers from trivial difficultyLabel/typeLabel finds in Quiz.tsx
- 2026-03-15: Refactor useFetch hook and ErrorBoundary cap — extracted shared fetch/loading/error/retry/abort pattern into useFetch<T> hook; refactored Menu.tsx and Quiz.tsx to use it; capped ErrorBoundary error messages at 120 chars; fixed providers.test.ts axiosInstance mock; added 13 new tests