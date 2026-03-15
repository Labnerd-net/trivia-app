# Spec for Fix Performance Issues

Title: Fix Performance Issues
Branch: claude/fix/fix-performance-issues
Spec file: context/specs/fix-performance-issues.md

## Summary

Address all three performance issues identified in context/backlog.md. Two are medium severity (render-blocking fonts, unconfigured axios timeouts) and one is low (unnecessary useMemo wrappers). All are small, isolated changes with no cross-dependencies.

## Functional Requirements

- **Perf 1 (Medium) — src/index.css**: Move the Google Fonts `@import` out of CSS and into `index.html` as `<link rel="preconnect">` and `<link rel="stylesheet">` tags in `<head>`. Remove the `@import` line from CSS.
- **Perf 2 (Medium) — src/api/providers.ts**: Create a shared axios instance (e.g. `src/api/axiosInstance.ts`) configured with a default 10-second timeout. Replace all bare `axios.get()` calls in `providers.ts` with the shared instance.
- **Perf 3 (Low) — src/pages/Quiz.tsx**: Remove `useMemo` wrappers from `difficultyLabel` and `typeLabel`. Replace with plain `const` declarations. Remove unused `useMemo` from the React import if it is no longer used elsewhere in the file.

## Possible Edge Cases

- Fonts: ensure the correct Google Fonts URL is preserved exactly when moving to `index.html` — a broken font URL silently falls back to system fonts.
- Axios timeout: a 10-second timeout will cause requests to fail on very slow connections that previously just hung. This is intentional but worth noting; the existing error/retry UI will handle the failure.
- Axios timeout: confirm the shared instance does not interfere with the `signal` (AbortController) already passed to requests — axios supports both simultaneously with no conflict.
- useMemo removal: `useMemo` is imported for these two uses; if nothing else in the file uses it, the import must be cleaned up to avoid a lint warning.

## Acceptance Criteria

- Google Fonts `<link>` tags are in `index.html`; no `@import` for fonts remains in any CSS file.
- All `axios.get()` calls in `providers.ts` use the shared instance; a network request that exceeds 10 seconds is cancelled with an error (verifiable by throttling in DevTools).
- `difficultyLabel` and `typeLabel` in `Quiz.tsx` are plain `const` declarations with no `useMemo`.
- `useMemo` is removed from the React import in `Quiz.tsx` if it is no longer referenced.
- `npm run build` passes with no errors or new warnings.

## Open Questions

- None. All three changes are clearly scoped.

## Testing Guidelines

Create or update tests in `./tests` for:
- `providers.ts`: mock axios and assert that a request exceeding the timeout threshold results in an error (confirms timeout config is applied).
- `Quiz.tsx`: no behavioral change expected from the useMemo removal — existing Quiz tests should continue to pass without modification.
- Fonts: no automated test needed; verify visually in the browser that fonts render correctly after moving the link tags.

## Personal Opinion

All three are straightforward and unambiguously correct. The font `@import` fix is a genuine load-time improvement (eliminates a render-blocking round trip). The axios timeout is good defensive practice — hanging requests are a silent UX failure. The useMemo removal is minor but the right call; memoizing a `.find()` over a 3-item array is noise that makes the code harder to read for no gain. No concerns. Good batch to ship together.
