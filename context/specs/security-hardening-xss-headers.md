# Spec for Security Hardening - XSS Fix and HTTP Security Headers

Title: Security Hardening - XSS Fix and HTTP Security Headers
Branch: claude/fix/security-hardening-xss-headers
Spec file: context/specs/security-hardening-xss-headers.md

## Summary

Two security issues identified in the backlog audit need to be resolved:

1. **High — `decodeHtml` XSS latent risk** (`src/utils/index.ts`): The current implementation sets `innerHTML` on a `<textarea>` element to decode HTML entities. While a `<textarea>` does not execute scripts, the function's design creates a latent XSS risk if its output is ever passed to `dangerouslySetInnerHTML` or inserted into a non-text DOM position. It is also untestable in non-browser (Node/jsdom) environments.

2. **Medium — Missing HTTP security headers** (`nginx.conf`): The nginx server block has no `add_header` directives, leaving the app without basic browser-enforced security policies (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy`).

## Functional Requirements

- Replace the `decodeHtml` function's `innerHTML`-based approach with a pure lookup-table decoder that handles the entities actually returned by OpenTDB: `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#039;`, and any numeric `&#ddd;` or hex `&#xhh;` references.
- The new decoder must not touch the DOM — no `document.createElement`, no `innerHTML`.
- All existing call sites (`Question.tsx`) must continue to work identically after the change.
- Add the following HTTP response headers to the nginx `server {}` stanza:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` — a baseline policy that allows the app's own origin plus the two trivia API origins (`opentdb.com`, `the-trivia-api.com`). Must not break current API calls or fonts.

## Possible Edge Cases

- OpenTDB may return numeric HTML entities (e.g., `&#8217;`) beyond the named set. The replacement must handle the full numeric entity range, not just a fixed list.
- The CSP `connect-src` directive must include both API origins; missing either will break question fetching in production.
- Google Fonts is loaded from `fonts.googleapis.com` — CSP `style-src` and `font-src` must include it.
- `X-Frame-Options` is superseded by CSP `frame-ancestors` in modern browsers but should still be included for older browser compatibility.

## Acceptance Criteria

- `decodeHtml` produces identical output for all entity types currently returned by OpenTDB, verified by unit tests.
- `decodeHtml` has no reference to `document`, `createElement`, or `innerHTML`.
- The function passes tests in a Node environment (no browser globals required).
- Production nginx container responds with all four security headers on every request.
- No console errors or network failures appear in the browser after the CSP header is added.
- `npm run build` passes with no errors.

## Open Questions

- Should the CSP include `upgrade-insecure-requests`? The app is served over HTTPS in production but runs HTTP locally — this directive could break the dev server. Likely exclude it or scope it to production only. - this app is expected to be behind a reverse proxy, so HTTP should be fine.
- Are there any other third-party origins (analytics, CDNs) that need to be allow-listed in CSP? - no 3rd party origins yet

## Testing Guidelines

Create or update tests in `./tests/` for the following cases — keep it concise:

- `decodeHtml` correctly decodes `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#039;`
- `decodeHtml` correctly decodes numeric entities (e.g., `&#8217;` → `'`)
- `decodeHtml` correctly decodes hex entities if supported (e.g., `&#x2019;`)
- `decodeHtml` returns plain strings unchanged
- `decodeHtml` handles empty string input without error

No tests needed for the nginx header changes — those are verified by running the production container and checking response headers with `curl -I`.

## Personal Opinion

Both fixes are straightforward and low-risk. The `decodeHtml` change is a clear improvement — the `innerHTML` approach is a code smell that should be eliminated regardless of current safety. A lookup-table decoder is simpler, faster, and fully testable. The only subtlety is handling numeric entities beyond the named set; covering that correctly is important since OpenTDB actively uses them (e.g., apostrophes encoded as `&#8217;`).

The nginx headers are a two-minute change with meaningful security value. The CSP requires a bit of care to enumerate all required origins without being overly permissive, but the app's external dependencies are small and well-known. No concerns — both fixes should be done.
