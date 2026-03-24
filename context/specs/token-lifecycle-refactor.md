# Spec for Token Lifecycle Refactor

Title: Token Lifecycle Refactor
Branch: claude/fix/token-lifecycle-refactor
Spec file: context/specs/token-lifecycle-refactor.md

## Summary

Currently, token fetching is split across two layers: `ProviderContext.tsx` owns the fetch logic and state, while providers expose `requiresToken` and `getToken()`. This duplication creates an unclear responsibility boundary — providers declare token capability but also partially implement it, while the context re-implements the actual fetch. The fix consolidates token fetching entirely into `ProviderContext`, with providers only declaring capability (`requiresToken: boolean`) and the token URL or fetch details needed by the context.

## Functional Requirements

- `ProviderContext` is the sole owner of token fetching, storage, and lifecycle management
- Providers declare `requiresToken: boolean` to signal whether a token is needed
- Providers no longer expose a `getToken()` method — the context passes the token into `getQuestions()` directly (already the case)
- Token is cleared and re-fetched whenever the selected provider changes
- No behavioral change for the end user — token flow works identically from the UI perspective

## Possible Edge Cases

- Switching providers mid-session should discard the old token and fetch a new one (or skip if new provider doesn't require one)
- If token fetch fails, the error state in `ProviderContext` should surface as before
- `getQuestions()` already receives `token` as a param — ensure this contract is unchanged

## Acceptance Criteria

- `getToken()` is removed from all provider objects in `providers.ts`
- `ProviderContext` handles token fetching without delegating to provider methods
- `requiresToken` remains on providers and is the only token-related capability flag
- No regressions in existing token fetch, error, and retry behavior
- All existing tests pass; update any tests that reference `getToken()`

## Open Questions

- Should the token fetch URL/logic be moved inline into `ProviderContext`, or should providers expose a `tokenUrl` string that the context uses? The latter keeps providers as the source of truth for API details. - the latter is good

## Testing Guidelines

Tests in `tests/ProviderContext.test.tsx`:
- Token is fetched on mount when `requiresToken` is true
- Token fetch is skipped when `requiresToken` is false
- Token is reset when selected provider changes
- Token fetch error is surfaced in context state
- `getToken()` is no longer called (removed from provider interface)

## Personal Opinion

This is a good, focused cleanup. The split responsibility is a real smell — `ProviderContext` does the fetch but providers partially own the interface for it. Consolidating into the context is the right call and matches the pattern already in place.

Not complex. The main risk is removing `getToken()` from the provider interface and ensuring nothing else calls it. A quick grep confirms scope before starting.
