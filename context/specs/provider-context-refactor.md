# Spec for Provider Context Refactor

Title: Provider Context Refactor
Branch: claude/feature/provider-context-refactor
Spec file: context/specs/provider-context-refactor.md

## Summary

`token` and `selectedProvider` are currently prop-drilled from `App.tsx` down through `Menu.tsx` and `Quiz.tsx`. Additionally, both `Menu` and `Quiz` call `getProvider(provider)` on every render to resolve the active provider object. This refactor introduces a `ProviderContext` that centralizes provider state and the session token, eliminating the prop-drilling chains and removing the redundant per-render `getProvider` calls.

## Functional Requirements

- Create a `ProviderContext` (and a `useProvider` hook) that exposes: the active provider object, the current token, and the setter to change the selected provider.
- `App.tsx` becomes the context provider — it owns token fetch logic and provider selection state, same as today, but wraps the app tree with the new context instead of passing props down.
- `Menu.tsx` reads provider and token from context instead of receiving them as props. Provider tab switching calls the context setter.
- `Quiz.tsx` reads provider and token from context instead of receiving them as props.
- Remove `provider` and `token` props from `Menu` and `Quiz` component signatures.
- Derived provider object (result of `getProvider(provider)`) is computed once inside the context and exposed directly — consumers stop calling `getProvider` themselves.

## Possible Edge Cases

- Token re-fetch must still trigger when provider changes — the existing `useEffect` in `App.tsx` that watches `selectedProvider` should be preserved inside the context provider.
- Any component currently reading `provider` as a string ID versus the resolved provider object must be updated consistently.
- Route-based components (`Menu`, `Quiz`) are rendered inside the router; the context provider must sit above the router, or at minimum above these routes.

## Acceptance Criteria

- `token` and `selectedProvider`/provider object are no longer passed as props to `Menu` or `Quiz`.
- `Menu` and `Quiz` each call `useProvider()` once to get provider and token — no direct `getProvider()` calls in these components.
- Provider switching in `Menu` still triggers a token re-fetch in `App`.
- The quiz still loads questions correctly for both OpenTDB and The Trivia API.
- No TypeScript errors. Build passes (`npm run build`).

## Open Questions

- Should `ProviderContext` also expose `setSelectedProvider` so `Menu` can switch providers, or should the setter stay as a prop callback to `Menu`? (Leaning toward exposing the setter via context to complete the clean-up.) - go with your recommendation
- Does the context need to be in a separate file (e.g., `src/context/ProviderContext.tsx`), or is co-locating it in `App.tsx` acceptable given the small surface area? - use src/context

## Testing Guidelines

Create or update tests in the `./tests` folder:
- Verify `useProvider` throws (or returns a fallback) when used outside `ProviderContext`.
- Verify that switching provider via context triggers a new token fetch (mock the token endpoint).
- Verify `Menu` renders provider tabs and reads the active provider from context without needing a prop.
- Verify `Quiz` fetches questions using the provider from context.

## Personal Opinion

This is a straightforward, low-risk improvement. The prop-drilling here is only two levels deep, so it's not painful today, but the redundant `getProvider()` calls on every render are a genuine smell. A context is the right tool — the data is global to the app and consumed in multiple unrelated branches of the tree.

The scope is narrow: three files change meaningfully (App, Menu, Quiz) plus a new small context file. No logic changes, just plumbing. The risk of breakage is low as long as the token re-fetch `useEffect` is carried over correctly.

One concern: if the project grows and more components need provider data, having this context already in place will pay off. If the project stays this size, it's also not overkill — it's the correct React pattern for this shape of data.
