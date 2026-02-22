# Trivia App

A trivia quiz application built with React. Supports multiple question sources, configurable difficulty and category, and paginated quiz sessions.

## Features

- Two trivia API providers: [Open Trivia Database](https://opentdb.com) and [The Trivia API](https://the-trivia-api.com)
- Filter by category, difficulty, and question type
- Paginated sessions — fetch the next 10 questions without leaving the quiz

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

## Docker

```bash
docker build -t trivia-app .
docker run -p 8080:80 trivia-app
```

The image is deployed via [Dokploy](https://dokploy.com).

## Stack

- React 19, React Router 7
- TypeScript 5 (strict mode)
- Vite 7, Vitest
- Axios
- nginx (production serving)
