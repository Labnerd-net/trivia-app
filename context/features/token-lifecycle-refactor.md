# Plan: Token Lifecycle Refactor (Backlog #12)

## Context

Token fetching is currently split: `ProviderContext.tsx` owns the fetch/state, but calls `p.getToken()` — a method on each provider object. This means providers partially implement token logic even though the context owns the lifecycle. The fix moves all fetching into `ProviderContext`; providers expose only `requiresToken: boolean` and a `tokenUrl?: string` pointing to the endpoint. This keeps API-specific URLs with the provider (source of truth for API details) while removing the method entirely.

---

## Files to Change

### 1. `src/types/index.ts`
- Remove `getToken(signal?: AbortSignal): Promise<string | null>` from `Provider` interface
- Add `tokenUrl?: string` to `Provider` interface

### 2. `src/api/providers.ts`
- **`openTDBProvider`**: Remove `getToken()` method; add `tokenUrl: 'https://opentdb.com/api_token.php?command=request'`
- **`triviaAPIProvider`**: Remove `getToken()` method (no `tokenUrl` needed — `requiresToken: false`)

### 3. `src/context/ProviderContext.tsx`
- Add `import axiosInstance from '../api/axiosInstance'`
- In `retrieveToken`, replace:
  ```ts
  const tokenData = await p.getToken(controller.signal);
  ```
  with:
  ```ts
  const response = await axiosInstance.get(p.tokenUrl!, { signal: controller.signal });
  const tokenData = response.data.token;
  ```

### 4. Tests — remove `getToken` from all mock provider objects
- `tests/ProviderContext.test.tsx` — remove `getToken: mockGetToken`; add `tokenUrl: 'https://opentdb.com/api_token.php?command=request'` to the mock that has `requiresToken: true`
- `tests/App.test.tsx` — remove `getToken: mockGetToken` from mock provider
- `tests/Menu.page.test.tsx` — remove `getToken: vi.fn()` from mock provider
- `tests/Quiz.page.test.tsx` — remove `getToken: vi.fn()` from mock provider

---

## Verification

- `npm run build` — no type errors
- `npm test` — all 70 tests pass (ProviderContext tests cover token fetch, skip, reset, and error cases)
