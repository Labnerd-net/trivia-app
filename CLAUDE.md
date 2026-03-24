# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trivia quiz application built with React, deployed as a Docker container (nginx) via Dokploy. Fetches questions from two external trivia APIs. No backend — all API calls go directly from the browser.

## Development Commands

- `npm run dev` - Vite dev server on port 3000
- `npm run build` - Production bundle to `dist/`
- `npm run preview` - Build then serve production preview on port 3000
- `npm run lint` - ESLint

## Deployment

Production is containerized. The GitHub Actions workflow (`.github/workflows/docker-publish.yml`) builds and pushes to `ghcr.io` on push to `main`. The Dockerfile does a two-stage build: Node 20 builds the Vite bundle, nginx serves the static `dist/` with SPA routing via `nginx.conf`.

## Architecture

### Application Flow

1. **`App.tsx`** — Wraps the tree with `ProviderProvider` and manages `category` state. Token fetching and provider selection are handled inside `ProviderProvider` (`src/context/ProviderContext.tsx`).
2. **`Menu.tsx`** — Fetches categories from the selected provider, renders the quiz config form (provider tabs, category, difficulty, type). On submit, navigates to `/quiz/:categoryID/:difficulty/:type/`.
3. **`Quiz.tsx`** — Reads route params, calls `provider.getQuestions()`, renders `Question` components. "Next Questions" re-fetches without navigation (stateful pagination via `page` counter).
4. **`Question.tsx`** — Renders a single question with shuffled answers. Handles answer selection and scoring.

### API Provider System (`src/api/providers.ts`)

Two providers, each a plain object with the same interface:

| Field/Method | Purpose |
|---|---|
| `id`, `name`, `description` | Metadata used in UI |
| `requiresToken` | Whether `ProviderProvider` should fetch a token |
| `tokenUrl` | Token endpoint URL; required when `requiresToken` is `true`, fetched by `ProviderContext` |
| `getCategories()` | Returns `[{ id, name }]` |
| `getQuestions({ amount, categoryId, difficulty, type, token, signal })` | Returns `{ results: [...] }` normalized |
| `difficulties`, `types` | `[{ value, label }]` arrays used to populate form selects |

All `getQuestions` responses are normalized to: `{ question, correctAnswer, incorrectAnswers[], category, difficulty, type }`.

**OpenTDB**: dynamic categories fetched from API, supports `boolean` (true/false) type, requires session token.
**The Trivia API**: 10 hardcoded categories, multiple choice only, no token.

Shared types are defined in `src/types/index.ts`. To add a new provider, implement the interface above and register it in `providers` and `providerList`.

### State Management

`token`, `selectedProvider`, and the resolved provider object live in `ProviderContext` (`src/context/ProviderContext.tsx`). Consumers call `useProvider()` to access `{ provider, token, setSelectedProvider }`. `App.tsx` wraps the tree with `ProviderProvider`, which also owns loading/error UI for the token fetch. `category` is still prop-drilled: set in `Menu` via a `setCategory` callback passed from `App.tsx` and read in `Quiz` as a prop.

### Data Fetching

`src/hooks/useFetch.ts` exports `useFetch<T>(fetchFn, errorMessage)` returning `{ data, loading, error, retry }`. Used by `Menu.tsx` and `Quiz.tsx` for initial data loading. The hook manages AbortController cleanup and retry internally. Pass a `useCallback`-memoized `fetchFn` with primitive deps to control when re-fetches fire. Pagination in `Quiz.tsx` fetches directly (not via the hook) so it can update the same `questions` state independently.

### Styling

Custom CSS with a `tq-` prefix (e.g., `tq-btn`, `tq-select`, `tq-status`, `tq-stats-bar`). React Bootstrap is a dependency but the UI primarily uses the custom `tq-*` classes from the dark quiz-show theme redesign. Bootstrap utility classes are available if needed.

### HTML Decoding

OpenTDB returns HTML-encoded strings. `src/utils/index.ts` exports `decodeHtml()` — use it when rendering question or answer text from OpenTDB.

## Checking Documentation

- **important:** when implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation useing the Context7 MCP server before writing any code.
