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
- 2026-03-15: Refactor provider context — created ProviderContext with useProvider hook; moved token fetch logic and provider state out of App.tsx; eliminated token/provider prop drilling in Menu.tsx and Quiz.tsx; added ProviderContext.test.tsx with 6 tests; 63 tests total passing
- 2026-03-15: Dead code and naming cleanup — removed unused Vite template CSS from App.css; removed icon field from ProviderListItem type and providerList data; moved root div inline style to tq-root CSS class in index.css; renamed selectedCategory callback to handleCategorySelect
- 2026-03-15: Backlog refactor #6 #8 #21 — consolidated 3 duplicate change handlers into one handleChange factory in Menu.tsx; derived providerList from Object.values(providers) in providers.ts; removed ProviderListItem type; removed conflicting #root block from App.css
- 2026-03-18: Fix backlog #3 #15 — added cancelled flag to ProviderContext useEffect to guard state setters after unmount; inlined handleRetry as arrow on onClick prop; added 2 new tests (65 total)