# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trivia quiz application built with React and deployed to Cloudflare Workers. The app fetches trivia questions from the OpenTDB (Open Trivia Database) API and presents them to users with customizable categories, difficulties, and question types.

## Development Commands

### Local Development
- `npm run dev` - Start Vite dev server on port 3000
- `wrangler dev` - Run Cloudflare Workers local development environment

### Building and Deployment
- `npm run build` - Build production bundle with Vite
- `npm run preview` - Preview production build locally (port 3000)
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `wrangler deploy` - Deploy to Cloudflare without building

### Code Quality
- `npm run lint` - Run ESLint

## Architecture

### Deployment Model
This is a **static Cloudflare Workers application**:
- Static frontend assets (HTML, CSS, JS) are served directly from Cloudflare's edge
- No custom Worker code - Cloudflare automatically handles static asset serving
- The `wrangler.jsonc` config enables SPA routing for client-side navigation
- All API calls go directly from the browser to the trivia provider APIs (no backend proxy)

### Frontend Stack
- **Framework**: React 19 with React Router for client-side routing
- **Build Tool**: Vite with `@cloudflare/vite-plugin` for Workers integration
- **UI Library**: React Bootstrap for components and styling
- **HTTP Client**: Axios for API requests

### Application Flow
1. **App Initialization** (`App.jsx`):
   - On mount, requests a session token from OpenTDB API
   - Token prevents duplicate questions during the session
   - Manages global state for token and selected category

2. **Menu Page** (`src/pages/Menu.jsx`):
   - Fetches available trivia categories from OpenTDB
   - User selects category, difficulty, and question type
   - Navigates to `/quiz/:categoryID/:difficulty/:type/`

3. **Quiz Page** (`src/pages/Quiz.jsx`):
   - Constructs OpenTDB API URL using route parameters and token
   - Fetches 10 questions per page
   - Renders questions using `Question` component
   - Supports pagination (fetch next 10 questions)

4. **Question Component** (`src/components/Question.jsx`):
   - Displays individual question with shuffled answers
   - Handles answer selection and scoring

### API Integration
The app supports **two trivia API providers** with automatic adapter normalization:

1. **Open Trivia Database (OpenTDB)**
   - 4,000+ community-contributed questions
   - Requires session token to prevent duplicates
   - Supports category, difficulty, and type filtering

2. **The Trivia API**
   - High-quality questions with region filtering
   - No token required
   - 10 predefined static categories (no API fetch needed)
   - Only supports multiple choice (no true/false type)

API provider system in `src/api/providers.js` handles:
- Provider configuration and metadata
- Category fetching for each API
- Question fetching with normalized parameters
- Response normalization to common format
- Provider-specific difficulties and types

### State Management
Simple prop drilling pattern:
- `token` state lives in `App.jsx`, passed to `Quiz` component
- `category` state managed via `setCategory` callback passed to `Menu` component
- Local component state for forms, loading, and errors

### Cloudflare Workers Configuration
- **No custom Worker code**: Pure static asset serving
- **Assets**: Static files served with SPA fallback (`not_found_handling: "single-page-application"`)
- **Custom Domain**: Configured for `trivia-app.labnerd.net`
- **Observability**: Enabled for monitoring

## Key Files
- `wrangler.jsonc` - Cloudflare Workers configuration (no custom worker code needed)
- `src/App.jsx` - Root component with token management, provider selection, and routing
- `src/api/providers.js` - Multi-provider system with adapters for OpenTDB, Trivia API, and jService
- `src/utils/index.js` - Utility functions (`decodeHtml` for rendering HTML-encoded question text)
- `src/pages/Menu.jsx` - Provider selection and quiz configuration form
- `src/pages/Quiz.jsx` - Question display and pagination
- `src/components/Question.jsx` - Handles multiple question formats (multiple choice, true/false, Jeopardy)
- `vite.config.js` - Vite configuration with Cloudflare plugin
