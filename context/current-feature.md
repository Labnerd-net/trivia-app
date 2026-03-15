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