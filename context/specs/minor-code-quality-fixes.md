# Spec for Minor Code Quality Fixes

Title: Minor Code Quality Fixes
Branch: claude/fix/minor-code-quality-fixes
Spec file: context/specs/minor-code-quality-fixes.md

## Summary

Five small, low-risk cleanup items from the backlog: remove a dead wrapper function, fix variable shadowing, centralize error message strings, add `satisfies Provider` type checking to provider objects, and remove dead ref code made redundant by an existing guard.

## Functional Requirements

- **#14** — Remove `handleCategorySelect` wrapper in `App.tsx`. It is a one-liner with no transformation (`setCategory(cat)`). Pass `setCategory` directly as the `setCategory` prop on `<Menu>`.
- **#17** — Rename shadowed `data` iterator variables in `Menu.tsx` map callbacks (lines 99, 113, 127) to non-shadowing names: `cat` for categories, `opt` for difficulties and types.
- **#18** — Move the two hardcoded `useFetch` error message strings out of call sites in `Menu.tsx` and `Quiz.tsx` into named constants. A new `src/constants/errorMessages.ts` file is the preferred location. Import and use those constants at each call site.
- **#19** — The two provider objects in `providers.ts` already use `: Provider` explicit type annotations, which does catch type errors. However, change to `satisfies Provider` to preserve the inferred concrete type rather than widening to `Provider`. This allows TypeScript to surface more specific return type information when these objects are referenced directly, and aligns with modern TypeScript best practices.
- **#11** — Remove `paginationControllerRef` (and its `useRef` import if no longer needed) from `Quiz.tsx`. The `isFetching` guard on the `nextQuestions` function already prevents any concurrent request from being started, so there is never an in-flight request to abort. Remove the abort call and controller replacement inside `nextQuestions`.

## Possible Edge Cases

- **#14** — `setCategory` from `useState` is stable by reference, so passing it directly as a prop is safe. No memoization needed.
- **#19** — After switching to `satisfies Provider`, TypeScript will infer the object's concrete type. Verify that the `providers` registry (`Record<string, Provider>`) still accepts both objects without error, since `satisfies` does not widen the declared type of the variable.
- **#11** — Verify no other code references `paginationControllerRef`. After removal, confirm `useRef` import is still used elsewhere in the file; if not, remove it from the import list.
- **#18** — Ensure the constants file is clean TypeScript with no runtime side effects. Two named string exports is all that is needed.

## Acceptance Criteria

- `handleCategorySelect` is removed from `App.tsx`; `setCategory` is passed directly as the prop
- Map iterator variables in `Menu.tsx` no longer shadow the outer `data` variable
- `useFetch` call sites in `Menu.tsx` and `Quiz.tsx` reference named constants for error messages rather than inline strings
- Both provider objects in `providers.ts` use `satisfies Provider` syntax; `npm run build` passes without TypeScript errors
- `paginationControllerRef`, its `useRef` declaration, and the abort call inside `nextQuestions` are removed from `Quiz.tsx`
- `npm run build` passes with zero errors or new warnings
- All existing tests continue to pass

## Open Questions

- None. All changes are straightforward and non-breaking.

## Testing Guidelines

No new tests are needed for these changes — they are refactors with no behavioral change. Verify existing tests still pass after each change.

- Run the full test suite and confirm no regressions
- Spot-check `Menu.tsx` in the browser: categories, difficulties, and types still populate correctly
- Spot-check `Quiz.tsx` in the browser: "Next Questions" still works and does not double-fetch

## Personal Opinion

These are all good, unambiguous improvements:

- **#14** is a pure simplification with zero risk.
- **#17** eliminates a real readability hazard; `data` as a map variable while `data` is also the fetch result is confusing during edits.
- **#18** is the weakest of the five — two call sites is minimal duplication and a constants file adds a file for minimal gain. Still reasonable to do for consistency.
- **#19** `satisfies` is the right tool here, though the change is cosmetic in practice since `: Provider` already provides compile-time checking. Worth doing.
- **#11** is the most clearly correct fix. The ref exists to abort a concurrent request that can never exist. Dead code with a misleading name.

No concerns. None of these changes affect behavior.
