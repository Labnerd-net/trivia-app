# Spec for migrate-to-typescript

branch: claude/feature/migrate-to-typescript

## Summary
Migrate the entire React application from JavaScript to TypeScript. This includes all source files under `src/`, the Vite config, and any supporting configuration. The goal is to add static type safety across components, API providers, utilities, and state.

## Functional Requirements
- Rename all `.js` and `.jsx` files under `src/` to `.ts` and `.tsx` respectively
- Add TypeScript configuration (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`) appropriate for a Vite + React project
- Install TypeScript and required `@types/*` packages as dev dependencies
- Type all component props using interfaces or type aliases
- Type all state variables, function parameters, and return values
- Type the provider interface defined in `src/api/providers.js` — both the shape of a provider object and the return types of `getCategories`, `getQuestions`, and `getToken`
- Type the normalized question object (`{ question, correctAnswer, incorrectAnswers, category, difficulty, type }`)
- Type the `decodeHtml` utility in `src/utils/index.js`
- Resolve all TypeScript errors before considering the migration complete; the build must pass with `tsc --noEmit`

## Possible Edge Cases
- React Router's `useParams` returns `Record<string, string | undefined>` — destructured params like `categoryID` will need non-null assertions or runtime guards
- The `shuffleAnswers` function in `Question.jsx` mutates an array in place — type narrowing on `question.type` may be needed to satisfy the compiler
- The `getProvider` function returns one of two distinct provider objects — a union or shared interface type needs to correctly cover both without losing narrowing
- Dynamic `key` usage in JSX (e.g., answer text as key) is valid but worth verifying no implicit `any` slips in
- `AbortController` signal typing differs slightly from `axios` signal typing — verify compatibility or adjust accordingly

## Acceptance Criteria
- `npm run build` completes without TypeScript errors
- `tsc --noEmit` passes with no errors
- No use of `any` except where genuinely unavoidable and explicitly commented
- All component prop types are explicitly declared
- The provider interface is defined as a shared TypeScript interface or type that both providers satisfy
- The normalized question result type is defined and used consistently across `Quiz.tsx` and `Question.tsx`
- `npm run dev` and the app in the browser behave identically to before the migration

## Open Questions
- Should strict mode (`"strict": true`) be enabled from the start, or relaxed initially and tightened later? Strict from the start is cleaner but may require more upfront work. - use strict mode
- Are there any runtime-only dependencies (e.g., axios) that already ship types, or do `@types/axios` stubs need to be installed? (axios ships its own types as of v1.) - I'm not sure which dependencies need @types installed

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- `decodeHtml` utility returns the correct string for HTML-encoded input
- `shuffleAnswers` returns the correct number of answers for both `multiple` and `boolean` question types
- `getProvider` returns the correct provider object for each valid provider ID and throws (or returns a fallback) for an unknown ID

## Personal Opinion
This is a good idea for long-term maintainability, but the timing matters. The codebase is small and well-structured, which makes the migration straightforward — there are no deeply dynamic patterns that fight TypeScript. The main payoff is catching prop mismatches (exactly the kind of bug that appeared in the original code review) at compile time rather than at runtime.

One concern: the provider system uses duck typing with a shared interface enforced only by convention. TypeScript will force that contract to be made explicit, which is strictly an improvement but requires a deliberate design decision upfront about whether to use an interface, an abstract class, or a type alias.

Overall: low risk, moderate effort, good return. Worth doing.
