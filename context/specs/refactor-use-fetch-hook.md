# Spec for Refactor — useFetch Hook and ErrorBoundary Message Cap

Title: Refactor — useFetch Hook and ErrorBoundary Message Cap
Branch: claude/feature/refactor-use-fetch-hook
Spec file: context/specs/refactor-use-fetch-hook.md

## Summary

Two backlog items (#1, #3). Extract the duplicated fetch/loading/error/retry/abort pattern from `Menu.tsx` and `Quiz.tsx` into a shared `useFetch` hook. Also fix `ErrorBoundary.tsx` to truncate long error messages that break layout.

## Functional Requirements

- **#1 — useFetch hook**: Create `src/hooks/useFetch.ts` exporting a custom hook that encapsulates the fetch/loading/error/retry/abort pattern. Both `Menu.tsx` and `Quiz.tsx` should be refactored to use it for their initial data loading, removing the duplicated `useState`/`useEffect`/`AbortController` boilerplate. The hook should accept a fetch function and return `{ data, loading, error, retry }`.

- **#3 — ErrorBoundary message cap**: In `ErrorBoundary.tsx`, truncate `this.state.error.message` to a maximum of 120 characters before rendering. Append `…` if truncated.

## Possible Edge Cases

- Quiz has two fetch scenarios: initial load (triggered by deps/retry) and pagination (`nextQuestions`, manual trigger with its own `AbortController` ref). The hook should cover initial load only. `nextQuestions` should remain inline — do not force it into the hook.
- Menu's fetch re-triggers when `provider` changes. The hook's dependency array must replicate the current `useEffect` behavior exactly.
- The 120-character cap in ErrorBoundary is a reasonable default but can be adjusted after seeing real messages.

## Acceptance Criteria

- `src/hooks/useFetch.ts` exists and is consumed by both `Menu.tsx` and `Quiz.tsx`.
- Duplicated fetch boilerplate (loading state, error state, retry counter, AbortController effect) is gone from both pages.
- `nextQuestions` pagination in `Quiz.tsx` is unchanged.
- `ErrorBoundary.tsx` never renders more than 120 characters of error message text, with `…` appended when truncated.
- `npm run build` passes with no errors or new warnings.

## Open Questions

- Should `useFetch` be generic over the return type, or typed specifically for this app's data shapes? Preference is generic — `useFetch<T>` — so it works for both categories and questions without duplication.

## Testing Guidelines

Create or update tests in `./tests` for:
- `useFetch`: mock the fetch function; assert loading/data/error states transition correctly; assert abort is called on cleanup; assert `retry` increments trigger a re-fetch.
- `ErrorBoundary`: throw an error longer than 120 characters from a child; assert rendered message is truncated with `…`.

## Personal Opinion

Straightforward and unambiguously correct. The fetch pattern is copy-pasted today — any future change hits two files. The hook extraction is the right call. Keep the hook simple: no caching, no debounce, just the current behavior behind a clean interface. ErrorBoundary fix is a one-liner that should have been there from the start.
