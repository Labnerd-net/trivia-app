# Plan: Security Hardening - XSS Fix and HTTP Security Headers

## Overview

Two targeted changes across three files:
1. Replace `decodeHtml` in `src/utils/index.ts` with a DOM-free entity decoder
2. Add HTTP security headers to `nginx.conf`
3. Extend existing tests in `tests/utils.test.ts`

---

## Step 1 — Replace `decodeHtml` in `src/utils/index.ts`

**Current implementation** (lines 6–10): Creates a `<textarea>` element, sets `innerHTML`, reads `.value`. DOM-dependent and untestable in Node.

**New implementation**: A two-pass regex decoder:
- First pass: replace named entities via a lookup map (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#039;`, `&apos;`)
- Second pass: replace numeric decimal entities (`&#8217;` → `String.fromCharCode(8217)`)
- Third pass: replace numeric hex entities (`&#x2019;` → `String.fromCharCode(0x2019)`)

No DOM access. No browser globals. Pure string transformation.

---

## Step 2 — Add security headers to `nginx.conf`

Add an `add_header` block inside the existing `server {}` stanza, before the `location` block.

Headers to add:
```
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://opentdb.com https://the-trivia-api.com; img-src 'self' data:; frame-ancestors 'self'" always;
```

**CSP rationale:**
- `default-src 'self'` — baseline deny-all
- `script-src 'self'` — Vite bundles all JS into self-hosted files; no inline scripts or eval
- `style-src 'self' https://fonts.googleapis.com` — app CSS is self-hosted; Google Fonts CSS is fetched via `@import` in `index.css`
- `font-src 'self' https://fonts.gstatic.com` — actual font binary files come from gstatic
- `connect-src 'self' https://opentdb.com https://the-trivia-api.com` — the two trivia API origins
- `img-src 'self' data:` — no external images; `data:` covers any SVG or favicon references
- `frame-ancestors 'self'` — modern equivalent of `X-Frame-Options SAMEORIGIN`; both are included for broad browser compatibility
- `upgrade-insecure-requests` excluded — app sits behind a reverse proxy; HTTP on the internal network is expected

The `always` flag ensures headers are sent on error responses (4xx/5xx) too, not just 200s.

---

## Step 3 — Update tests in `tests/utils.test.ts`

Add to the existing `describe('decodeHtml', ...)` block:

- `&#039;` decodes to `'`
- Numeric decimal entity `&#8217;` decodes to `'` (right single quotation mark)
- Numeric hex entity `&#x2019;` decodes to `'`
- Empty string input returns empty string

The existing four tests remain unchanged.

---

## Files Changed

| File | Change |
|------|--------|
| `src/utils/index.ts` | Replace `decodeHtml` body — 3 lines → ~10 lines |
| `nginx.conf` | Add 4 `add_header` directives inside `server {}` |
| `tests/utils.test.ts` | Add 4 test cases to existing `decodeHtml` describe block |

No other files need to change. `Question.tsx` call sites are unaffected — same function signature, same output for all inputs.

---

## Verification

- `npm run build` — must pass
- `npm run test` (or `npx vitest run`) — all tests including new ones must pass
- Manual: run `docker build` and `curl -I http://localhost` to verify headers in production container
