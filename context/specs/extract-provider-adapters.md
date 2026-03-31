# Spec for Extract Provider Adapters to Separate Modules

Title: Extract Provider Adapters to Separate Modules
Branch: claude/feature/extract-provider-adapters
Spec file: context/specs/extract-provider-adapters.md

## Summary

`src/api/providers.ts` is a single 357-line file that contains two live provider objects, two factory functions (`makeLocalProvider`, `makeSnapshotProvider`), shared utilities (`shuffleArray`), and the provider registry. The in-flight promise pattern is duplicated between the two factories. This refactor extracts each provider/factory into its own module under `src/api/adapters/`, moves shared utilities to a common file, and keeps `providers.ts` as a thin registry.

## Functional Requirements

- Extract `openTDBProvider` to `src/api/adapters/opentdb.ts`
- Extract `triviaAPIProvider` to `src/api/adapters/triviaapi.ts`
- Extract `makeLocalProvider` and the card provider instances to `src/api/adapters/localProviders.ts`
- Extract `makeSnapshotProvider` and the snapshot provider instances to `src/api/adapters/snapshotProviders.ts`
- Move `shuffleArray` and shared types (`CardQuestion`, `CategoryDef`, `SnapshotFile`) to `src/api/adapters/utils.ts`
- Keep `providers.ts` as the registry only — imports all providers and exports `providers`, `providerList`, `providerGroups`, and `getProvider`
- All existing exports from `providers.ts` remain unchanged so no consumers need updating

## Possible Edge Cases

- Circular imports if `utils.ts` imports from adapter files or vice versa — keep utils.ts dependency-free
- Type re-exports: `CategoryDef` is currently local to providers.ts; moving it to utils.ts may require updating any future consumer
- The `satisfies Provider` constraint on each provider object must be preserved in the new files

## Acceptance Criteria

- `src/api/providers.ts` is reduced to registry-only code (imports + exports, no inline logic)
- Each adapter file is independently readable and self-contained
- `shuffleArray` exists in exactly one place
- The in-flight promise pattern in `makeLocalProvider` and `makeSnapshotProvider` is still correct (not accidentally broken during extraction)
- `npm run build` passes with no errors or new TypeScript warnings
- All existing tests pass without modification

## Open Questions

- None — scope is purely structural; no behavior changes.

## Testing Guidelines

No new tests needed — this is a pure structural refactor with no logic changes. Existing tests (providers.test.ts and any integration tests) cover the behavior and should pass unchanged. Verify the full test suite passes after the refactor.

## Personal Opinion

This is a borderline call. The current file is well-organized with clear section comments, and at 357 lines it's not unmanageable. The real duplication is limited to `shuffleArray` and the in-flight promise pattern — neither of which is difficult to follow in context.

The main argument for doing it: each adapter becomes independently readable, and adding a new provider in the future means creating a new file rather than appending to an already-complete registry file.

The main argument against: it adds 4–5 new files and import hops for a codebase that currently has one clean file. The cognitive overhead of navigating to `adapters/opentdb.ts` is non-trivial compared to scrolling down in `providers.ts`.

Verdict: worth doing if the team expects to add more providers. If the provider list is stable, this is churn. Given the project already has 7 providers across 3 patterns, the modularization is reasonable — but this is a "nice to have" housekeeping item, not a pressing need.
