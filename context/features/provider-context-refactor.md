# Plan: Provider Context Refactor

## Context

`token` and `selectedProvider` are prop-drilled from `App.tsx` into `Menu.tsx` and `Quiz.tsx`. Both components also call `getProvider(id)` on every render to resolve the provider object. This refactor lifts that state into a `ProviderContext`, resolves the provider object once (with `useMemo` for referential stability), and exposes it to consumers via a `useProvider()` hook.

---

## Files to Change

| File | Action |
|------|--------|
| `src/context/ProviderContext.tsx` | **Create** |
| `src/App.tsx` | **Update** — remove token/provider state; wrap with `ProviderProvider` |
| `src/pages/Menu.tsx` | **Update** — remove `provider`/`onProviderChange` props; consume context |
| `src/pages/Quiz.tsx` | **Update** — remove `token`/`provider` props; consume context |
| `tests/ProviderContext.test.tsx` | **Create** |
| `tests/Menu.page.test.tsx` | **Update** — mock context instead of passing props |
| `tests/Quiz.page.test.tsx` | **Update** — mock context instead of passing props |

---

## Step 1 — Create `src/context/ProviderContext.tsx`

```ts
interface ProviderContextValue {
  provider: Provider;           // resolved object, memoized
  token: string | null;
  setSelectedProvider: (id: string) => void;
}
```

`ProviderProvider` component:
- Holds `selectedProvider` (string, default `'opentdb'`), `token`, `loading`, `error`, `retryCount` state — same logic as current `App.tsx`
- Exposes `setSelectedProvider` as a stable `useCallback` handler that calls `setSelectedProviderState(id)`, `setLoading(true)`, `setError(null)` (mirrors current `handleProviderChange`)
- Computes `provider` once via `useMemo(() => getProvider(selectedProvider), [selectedProvider])` — **critical for stable `useCallback` deps in consumers**
- Memoizes context value: `useMemo(() => ({ provider, token, setSelectedProvider }), [provider, token])`
- Renders `<div className="tq-status">Loading...</div>` or error+retry UI when `loading`/`error` are set — same JSX as current `App.tsx` conditionals
- Wraps children in `<ProviderContext.Provider value={contextValue}>`

`useProvider()` hook:
- Reads context, throws `Error('useProvider must be used within a ProviderProvider')` if null

---

## Step 2 — Update `src/App.tsx`

Remove:
- `token`, `loading`, `error`, `selectedProvider`, `retryCount` state
- `handleProviderChange`, `retryTokenFetch` functions and the token-fetch `useEffect`
- `loading`/`error` conditional renders
- `getProvider` import
- `provider` and `token` props from `<Menu>` and `<Quiz>` route elements
- `onProviderChange` prop from `<Menu>`

Add:
- Import `ProviderProvider`
- Wrap existing JSX in `<ProviderProvider>`

`<Menu>` keeps only `setCategory={selectedCategory}`.
`<Quiz>` keeps only `category={category}`.
`category` state and `selectedCategory` handler stay in `App.tsx` unchanged.

---

## Step 3 — Update `src/pages/Menu.tsx`

Remove from `MenuProps`: `provider: string`, `onProviderChange: (id: string) => void`.

Add at top of component:
```ts
const { provider, setSelectedProvider } = useProvider();
```

Changes:
- Remove `const currentProvider = getProvider(provider)` — use `provider` directly
- `fetchCategories` callback: `provider.getCategories({ signal })`, dep `[provider]`
- `useEffect` form reset: `provider.difficulties[0]`, `provider.types[0]` — no more `getProvider()` call
- `useEffect` dep array: `[data, provider]` (was `[data, provider]` by string, now by object — stable because of `useMemo` in context)
- Active tab check: `provider.id === p.id` (was `provider === p.id`)
- Tab click handler: `setSelectedProvider(p.id)` (was `onProviderChange(p.id)`)
- Description/difficulties/types: `provider.description`, `provider.difficulties`, `provider.types`

Remove `getProvider` import.

---

## Step 4 — Update `src/pages/Quiz.tsx`

Remove from `QuizProps`: `token: string | null`, `provider: string`.

Add at top of component:
```ts
const { provider, token } = useProvider();
```

Changes:
- Remove `const currentProvider = getProvider(provider)` — use `provider` directly
- `fetchQuestions` callback: `provider.getQuestions(...)`, dep `[provider, categoryID, difficulty, type, token]`
- `nextQuestions`: `provider.getQuestions(...)` (was `currentProvider.getQuestions(...)`)
- `difficultyLabel`/`typeLabel`: use `provider.difficulties`/`provider.types`

Remove `getProvider` import.

---

## Step 5 — Create `tests/ProviderContext.test.tsx`

- Test `useProvider()` throws when rendered outside `ProviderProvider` (wrap in `renderHook`, catch error)
- Test `ProviderProvider` renders children when loaded
- Test that the resolved `provider` object from context has the correct `id`

---

## Step 6 — Update `tests/Menu.page.test.tsx`

Add context mock:
```ts
vi.mock('../src/context/ProviderContext', () => ({
  useProvider: () => ({ provider: mockProvider, setSelectedProvider: mockSetSelectedProvider }),
}))
```

- Remove `provider` and `onProviderChange` from `renderMenu`
- Update `<Menu setCategory={setCategory} />` (no other props)
- Keep all existing test assertions unchanged

---

## Step 7 — Update `tests/Quiz.page.test.tsx`

Add context mock:
```ts
vi.mock('../src/context/ProviderContext', () => ({
  useProvider: () => ({ provider: mockProvider, token: null }),
}))
```

- Remove `token` and `provider` from `<Quiz>` in `renderQuiz`
- Keep all existing test assertions unchanged

---

## Key Design Decisions

- **`useMemo` for provider object**: Without this, `getProvider(selectedProvider)` returns a new object reference every render, breaking `useCallback` dep arrays in Menu/Quiz and causing infinite re-fetches.
- **Loading/error in `ProviderProvider`**: Keeps `App.tsx` as pure layout. The token-loading state is an implementation detail of the provider subsystem, not of the page router.
- **`setSelectedProvider` as a handler, not raw setter**: The handler also resets `loading`/`error` so the UX (loading screen on provider switch) is preserved.
- **`category` stays in `App.tsx`**: Out of scope — it's quiz-specific state, not provider state.

---

## Verification

1. `npm run build` — must pass with no TypeScript errors
2. Manual test: load app, both providers should work, switching providers re-triggers category fetch and token fetch
3. Run `npm test` — all existing tests must pass; new ProviderContext tests must pass
