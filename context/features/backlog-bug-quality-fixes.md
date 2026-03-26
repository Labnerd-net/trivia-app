# Plan: Backlog Bug and Quality Fixes

## Context
Six small isolated fixes from the backlog audit: one TypeScript type import bug (#2), one React key prop bug (#4), one theme initialization gap (#5), one unnecessary hook re-render trigger (#13), one silent fallback hiding bad state (#14), and one inline style inconsistency (#20).

---

## Fix #2 — Missing Category import in Menu.tsx

**File:** `src/pages/Menu.tsx`

Add `import type { Category } from '../types';` alongside the existing imports. `Category` is already used as a generic on line 28 (`useFetch<Category[]>`) but never imported.

---

## Fix #4 — Answer option key by index

**File:** `src/components/Question.tsx:48`

Change:
```tsx
key={opt}
```
to:
```tsx
key={`${idx}-${opt}`}
```
`idx` is already available from the `.map((opt, idx) =>` destructure on line 46.

---

## Fix #5 — Apply theme on initial load

**File:** `src/hooks/useTheme.ts`

The `useState` initializer calls `getInitialTheme()` to set React state but never calls `applyTheme`, so the DOM attribute is only ever set by the inline `<script>` in `index.html`. If that script fails (localStorage throws, CSP blocks, etc.), the theme won't be applied until the user toggles.

Change the `useState` call from:
```ts
const [theme, setTheme] = useState<Theme>(getInitialTheme)
```
to an inline lazy initializer that also applies the theme:
```ts
const [theme, setTheme] = useState<Theme>(() => {
  const t = getInitialTheme()
  applyTheme(t)
  return t
})
```
`applyTheme` is idempotent — if the inline script already set the attribute, calling it again changes nothing.

---

## Fix #13 — Remove errorMessage from useFetch dep array

**File:** `src/hooks/useFetch.ts:49`

`errorMessage` is in the `useEffect` dep array. A caller that passes an inline string literal (e.g., `useFetch(fn, "Failed to load")`) would cause a re-fetch on every render because the string reference is new each time.

Use a `useRef` to hold the current `errorMessage` so the effect reads it without depending on it:

```ts
const errorMessageRef = useRef(errorMessage);
errorMessageRef.current = errorMessage;
```
Reference `errorMessageRef.current` inside the `.catch` block instead of `errorMessage` directly, and remove `errorMessage` from the deps array: `[fetchFn, retryCount]`.

Add `useRef` to the existing React import.

---

## Fix #14 — getProvider silent fallback warning

**File:** `src/api/providers.ts:343-345`

Add a `console.warn` when the requested id is not found:

```ts
export function getProvider(id: string): Provider {
  if (!providers[id]) {
    console.warn(`getProvider: unknown provider id "${id}", falling back to opentdb`);
  }
  return providers[id] ?? providers.opentdb;
}
```

No call-site changes required. Return type stays `Provider`.

---

## Fix #20 — Inline style → tq-* class

**Files:** `src/index.css`, `src/pages/Menu.tsx:136`

The div wrapping the "Start Quiz" button at line 136 has `style={{ marginTop: '1.5rem' }}`. No existing `tq-*` class covers `margin-top: 1.5rem`.

Add a new utility class to `src/index.css`:
```css
.tq-form-actions {
  margin-top: 1.5rem;
}
```
Place it near the other `tq-form-*` classes (`tq-form-section`). Replace the inline style with `className="tq-form-actions"`.

---

## Order of changes

1. `src/pages/Menu.tsx` — add Category import (#2) + remove inline style (#20)
2. `src/index.css` — add `.tq-form-actions` (#20)
3. `src/components/Question.tsx` — fix key prop (#4)
4. `src/hooks/useTheme.ts` — call applyTheme on init (#5)
5. `src/hooks/useFetch.ts` — useRef for errorMessage, remove from deps (#13)
6. `src/api/providers.ts` — add console.warn to getProvider (#14)

---

## Verification

- `npm run build` — must pass with no TypeScript errors (previously fails on #2)
- `npm run lint` — must pass with no warnings
- Existing tests: `npm test` — all 82 tests must continue passing
- No new tests required for these fixes (they are all one-liners or structural changes)
