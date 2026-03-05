# Trivia App

A trivia quiz application built with React. Supports multiple question sources, configurable difficulty and category, and paginated quiz sessions.

## Features

- Two trivia API providers: [Open Trivia Database](https://opentdb.com) and [The Trivia API](https://the-trivia-api.com)
- Filter by category, difficulty, and question type
- Paginated sessions — fetch the next 10 questions without leaving the quiz

## Self-hosting

A pre-built Docker image is published to the GitHub Container Registry on every push to `main`.

```bash
docker pull ghcr.io/labnerd-net/trivia-app:latest
docker run -p 8080:80 ghcr.io/labnerd-net/trivia-app:latest
```

Then open `http://localhost:8080`.

Or build from source:

```bash
docker build -t trivia-app .
docker run -p 8080:80 trivia-app
```

## Development

```bash
npm install
npm run dev        # dev server on port 3000
npm run build      # production build to dist/
npm run preview    # build + serve preview on port 3000
npm run lint       # ESLint
npm run typecheck  # TypeScript type check
npm run test       # Vitest
```

## Stack

- React 19, React Router 7
- TypeScript 5 (strict mode)
- Vite 7, Vitest, Testing Library
- Axios
- nginx (production serving)
