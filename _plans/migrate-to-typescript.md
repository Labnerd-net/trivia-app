# Plan: Migrate Trivia App to TypeScript

## Context
The codebase is plain JavaScript/JSX with no type safety. The original code review flagged a runtime token prop mismatch that TypeScript would have caught at compile time. This migration adds static typing across all source files using strict mode, making future prop-type bugs impossible to miss.

## Current State
- 8 source files to convert: `App.jsx`, `main.jsx`, `api/providers.js`, `utils/index.js`, `components/Navbar.jsx`, `components/Question.jsx`, `pages/Menu.jsx`, `pages/Quiz.jsx`
- `@types/react` and `@types/react-dom` already installed
- `axios` and `react-router` ship their own types — no additional `@types/*` needed
- No `tsconfig.json` exists yet
- No tests exist yet

---

## Step 1: Install TypeScript

```
npm install -D typescript
```

No other `@types/*` packages are needed.

---

## Step 2: Create `tsconfig.json`

Create at project root with strict mode enabled, targeting ESNext, JSX set to `react-jsx`, and `src/` as the root dir. Include `vite-env.d.ts` reference. Exclude `node_modules` and `dist`.

**Critical file:** `tsconfig.json` (new)

---

## Step 3: Define shared types

***Human Note***: can you place use a src/types/ directory instead to hold this file?

Create `src/types.ts` with all shared types used across the app:

- `Category`: `{ id: string; name: string }`
- `QuestionType`: `'multiple' | 'boolean'`
- `NormalizedQuestion`: `{ question: string; correctAnswer: string; incorrectAnswers: string[]; category: string; difficulty: string; type: QuestionType }`
- `QuestionsResult`: `{ results: NormalizedQuestion[] }`
- `SelectOption`: `{ value: string; label: string }`
- `GetQuestionsOptions`: `{ amount?: number; categoryId?: string; difficulty?: string; type?: string; token?: string | null; signal?: AbortSignal }`
- `Provider` interface: all fields — `id`, `name`, `description`, `requiresToken`, `difficulties`, `types`, and the three async methods with their return types
- `ProviderListItem`: `{ id: string; name: string; icon: string }`

**Critical file:** `src/types.ts` (new)

---

## Step 4: Convert files (in dependency order)

Convert each file by renaming and adding types. Do not change logic.

### 4a. `src/utils/index.js` → `src/utils/index.ts`
- `decodeHtml(html: string): string`

### 4b. `src/api/providers.js` → `src/api/providers.ts`
- Both provider objects typed as `Provider` (from `src/types.ts`)
- `getProvider(id: string): Provider`
- `providerList` typed as `ProviderListItem[]`

### 4c. `src/components/Navbar.jsx` → `src/components/Navbar.tsx`
- No props — no changes beyond rename

### 4d. `src/components/Question.jsx` → `src/components/Question.tsx`
- Props: `{ question: NormalizedQuestion; number?: number }`
- `shuffleAnswers(question: NormalizedQuestion): string[]`

### 4e. `src/pages/Menu.jsx` → `src/pages/Menu.tsx`
- Props: `{ setCategory: (cat: Category) => void; provider: string; onProviderChange: (id: string) => void }`
- `formData` state typed as `{ category: string; difficulty: string; type: string }`

### 4f. `src/pages/Quiz.jsx` → `src/pages/Quiz.tsx`
- Props: `{ token: string | null; category: Category | null; provider: string }`
- Route params via `useParams<{ categoryID: string; difficulty: string; type: string }>()`
- `questions` state typed as `QuestionsResult | null` (initialize to `null`, guard before rendering)

### 4g. `src/App.jsx` → `src/App.tsx`
- State types: `token: string | null`, `category: Category | null`, `selectedProvider: string`, `loading: boolean`, `error: string | null`, `retryCount: number`

### 4h. `src/main.jsx` → `src/main.tsx`
- Rename only; no type changes needed

---

## Step 5: Update `vite.config.js` → `vite.config.ts`
- Rename and confirm it compiles correctly (no logic changes)

**Critical file:** `vite.config.js` (rename to `.ts`)

---

## Step 6: Set up Vitest and write tests

Install:
```
npm install -D vitest @vitest/ui jsdom @testing-library/react
```

Add to `vite.config.ts`:
```ts
test: {
  environment: 'jsdom',
  globals: true,
}
```

Create `tests/utils.test.ts`:
- `decodeHtml` returns correct string for HTML-encoded input (e.g., `&amp;` → `&`)

Create `tests/Question.test.ts`:
- `shuffleAnswers` with `type: 'multiple'` returns 4 answers
- `shuffleAnswers` with `type: 'boolean'` returns `['True', 'False']`

Create `tests/providers.test.ts`:
- `getProvider('opentdb')` returns provider with `id === 'opentdb'`
- `getProvider('triviaapi')` returns provider with `id === 'triviaapi'`
- `getProvider('unknown')` falls back to `opentdb` provider

**Critical files:** `tests/utils.test.ts`, `tests/Question.test.ts`, `tests/providers.test.ts` (new)

Note: `shuffleAnswers` is currently not exported from `Question.tsx`. Extract it to `src/utils/index.ts` so it can be tested directly.

---

## Verification

1. `npx tsc --noEmit` — must pass with zero errors
2. `npm run build` — must produce a clean `dist/`
3. `npm run dev` — app must behave identically in the browser
4. `npx vitest run` — all tests must pass
