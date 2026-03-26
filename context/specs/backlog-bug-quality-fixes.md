# Spec for Backlog Bug and Quality Fixes

Title: Backlog Bug and Quality Fixes
Branch: claude/feature/backlog-bug-quality-fixes
Spec file: context/specs/backlog-bug-quality-fixes.md

## Summary

Fix six small bugs and code quality issues identified in the backlog audit. These are all low-risk, isolated changes with no new functionality — strictly fixes to correctness, consistency, and reliability.

## Functional Requirements

- **#2** — Add missing `import type { Category }` to `Menu.tsx` so `useFetch<Category[]>` resolves correctly at compile time.
- **#4** — Change answer option `key` prop in `Question.tsx` from `key={opt}` (answer text) to `key={\`${idx}-${opt}\`}` to avoid duplicate key warnings when identical answer strings appear.
- **#5** — Ensure the saved theme is applied on initial page load before React mounts, so there is no flash of the wrong theme. Call `applyTheme` with the initial theme at load time.
- **#13** — Remove `errorMessage` from the `useEffect` dependency array in `useFetch.ts`. Since `errorMessage` never changes after mount, keeping it in the deps array could cause unnecessary re-fetches if a caller passes an inline string literal.
- **#14** — Add a `console.warn` in `getProvider` when falling back to the default `opentdb` provider for an unrecognized ID. Silent fallbacks hide stale bookmarks or corrupted state.
- **#20** — Replace the lone inline `style={{ marginTop: '1.5rem' }}` in `Menu.tsx` with a `tq-*` CSS utility class to match the rest of the codebase's styling convention.

## Possible Edge Cases

- **#5**: The theme init script currently lives in `index.html` as a no-flash inline script. The fix should not duplicate that script or create a second application on load — it should align the React-side state with what the inline script already applies.
- **#13**: If `errorMessage` is ever made dynamic in the future, the `useRef` approach (or a comment) should document why it is excluded from deps.
- **#14**: The `console.warn` should only fire in development or be clearly scoped so it does not spam production logs on every navigation.

## Acceptance Criteria

- `npm run build` passes with no TypeScript errors (currently fails or warns due to #2).
- React renders answer options without duplicate-key console warnings when identical answer text appears.
- Loading the app with `'light'` saved in localStorage applies the light theme immediately with no flash before React mounts.
- Switching providers with an unrecognized ID logs a warning to the console rather than silently loading OpenTDB.
- No inline `style` props remain in `Menu.tsx`.
- All existing tests continue to pass.

## Open Questions

- **#5**: Should `applyTheme(getInitialTheme())` be called inside `useTheme.ts` itself (on first hook mount) or in `main.tsx`? The inline script in `index.html` already handles the pre-React flash — the React-side fix only needs to ensure `data-theme` stays in sync after hydration.
- **#14**: Should `getProvider` return `undefined` for unknown IDs instead of falling back? That would be a more correct fix but requires call-site changes. Scope to warn-only for this batch to keep the change minimal.

## Testing Guidelines

- Verify #2 is resolved by running `tsc --noEmit` and confirming no `Category` type error.
- For #4: no specific test needed — it is a key prop fix. Verify no React key warnings in browser console with duplicate answers (if testable).
- For #5: add or update a `useTheme` test to verify `applyTheme` is called on initialization with the stored theme value.
- For #13: add a test that confirms `useFetch` does not re-run the fetch when the component re-renders with the same fetch function but a new inline error string reference.
- For #14: add a test for `getProvider` that confirms a `console.warn` is emitted when an unknown ID is passed and the return value is the fallback.
- For #20: no test needed — visual/structural change only.

## Personal Opinion

All six items are straightforward and the right calls. #2 is technically a bug that should already be caught by the compiler. #5 is the most impactful UX fix (theme flash is noticeable). #13 and #14 are defensive hygiene that will prevent subtle bugs downstream. #4 and #20 are minor polish. None of these are risky or complex — this is a clean batch to ship together.
