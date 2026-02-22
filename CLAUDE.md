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

Production is containerized. The GitHub Actions workflow (`.github/workflows/docker-publish.yml`) builds and pushes to `ghcr.io` on push to `master`. The Dockerfile does a two-stage build: Node 20 builds the Vite bundle, nginx serves the static `dist/` with SPA routing via `nginx.conf`.

## Architecture

### Application Flow

1. **`App.jsx`** — On mount, fetches a session token from OpenTDB (token prevents duplicate questions). Manages `selectedProvider`, `token`, and `category` state. Provider change re-triggers token fetch.
2. **`Menu.jsx`** — Fetches categories from the selected provider, renders the quiz config form (provider tabs, category, difficulty, type). On submit, navigates to `/quiz/:categoryID/:difficulty/:type/`.
3. **`Quiz.jsx`** — Reads route params, calls `provider.getQuestions()`, renders `Question` components. "Next Questions" re-fetches without navigation (stateful pagination via `page` counter).
4. **`Question.jsx`** — Renders a single question with shuffled answers. Handles answer selection and scoring.

### API Provider System (`src/api/providers.js`)

Two providers, each a plain object with the same interface:

| Field/Method | Purpose |
|---|---|
| `id`, `name`, `description` | Metadata used in UI |
| `requiresToken` | Whether `App.jsx` should fetch a token |
| `getToken()` | Returns token string or `null` |
| `getCategories()` | Returns `[{ id, name }]` |
| `getQuestions({ amount, categoryId, difficulty, type, token, signal })` | Returns `{ results: [...] }` normalized |
| `difficulties`, `types` | `[{ value, label }]` arrays used to populate form selects |

All `getQuestions` responses are normalized to: `{ question, correctAnswer, incorrectAnswers[], category, difficulty, type }`.

**OpenTDB**: dynamic categories fetched from API, supports `boolean` (true/false) type, requires session token.
**The Trivia API**: 10 hardcoded categories, multiple choice only, no token.

To add a new provider, implement the interface above and register it in `providers` and `providerList`.

### State Management

Prop drilling only. `token` and `selectedProvider` live in `App.jsx`. `category` object is set in `Menu` via a `setCategory` callback and read in `Quiz`. No context or external state library.

### Styling

Custom CSS with a `tq-` prefix (e.g., `tq-btn`, `tq-select`, `tq-status`, `tq-stats-bar`). React Bootstrap is a dependency but the UI primarily uses the custom `tq-*` classes from the dark quiz-show theme redesign. Bootstrap utility classes are available if needed.

### HTML Decoding

OpenTDB returns HTML-encoded strings. `src/utils/index.js` exports `decodeHtml()` — use it when rendering question or answer text from OpenTDB.

## Checking Documentation

- **important:** when implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation useing the Context7 MCP server before writing any code.
