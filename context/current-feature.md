# Current Feature

## Current Feature Spec File

Title: Offline trivia snapshots
Spec file: context/specs/offline-trivia-snapshots.md
Branch: claude/feature/offline-trivia-snapshots

## Current Feature Plan File

Plan File: context/features/offline-trivia-snapshots.md

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
- 2026-03-18: Security fix backlog #1 — validate categoryId, difficulty, and type route params in Quiz.tsx against provider allowlists before fetching; crafted URLs with injected params show error and never call getQuestions; added 4 new tests (69 total)
- 2026-03-18: Code quality fixes backlog #11 #14 #17 #18 #19 — removed dead paginationControllerRef and useRef from Quiz.tsx; removed handleCategorySelect wrapper in App.tsx; renamed shadowed data map vars in Menu.tsx; extracted useFetch error strings to src/constants/errorMessages.ts; switched provider objects to satisfies Provider
- 2026-03-18: Fix a11y backlog #16 — replaced static aria-label strings on answer divs with decoded answer text; correct answer gets "Correct: <text>" prefix after reveal; updated 2 tests and added 1 new test (70 total)
- 2026-03-18: Fix backlog #10 — extracted two inline style props into tq-form-section and tq-error-detail CSS classes in index.css; Menu.tsx and ErrorBoundary.tsx now use tq-* classes exclusively
- 2026-03-23: Refactor backlog #12 — consolidated token lifecycle into ProviderContext; removed getToken() from Provider interface and both provider objects; providers now declare tokenUrl for ProviderContext to fetch directly via axiosInstance; added runtime guard for missing tokenUrl
- 2026-03-23: Refactor backlog #13 — moved category state from App.tsx into ProviderContext; eliminated prop-drilling of setCategory to Menu and category to Quiz; provider switch now resets category to null; added 3 new tests (73 total)
- 2026-03-23: Test coverage backlog #29 — added Navbar.component.test.tsx (2 tests); extended Menu.page.test.tsx with category-selection integration test; 76 tests total passing
- 2026-03-24: Replace provider tabs with grouped select — added group field to Provider interface and all providers (Online / Card Games); Menu.tsx now uses a single <select> with <optgroup> separators; removed tq-provider-tabs/tq-provider-tab CSS
