# Spec for Decode HTML Entity Coverage and Memoization

Title: Decode HTML Entity Coverage and Memoization
Branch: claude/fix/decode-html-entity-coverage
Spec file: context/specs/decode-html-entity-coverage.md

## Summary

Three related backlog items all touch `decodeHtml`:

- **#9 (High)**: The current regex-based `decodeHtml` in `src/utils/index.ts` only handles 6 named entities. Any entity not in its table (e.g. `&nbsp;`, `&eacute;`, `&ndash;`) is passed through as a literal string in rendered text, producing garbled output.
- **#21 (Low)**: `decodeHtml` is copy-pasted verbatim into `scripts/download-trivia.mjs`. Any fix to entity decoding must be manually mirrored. Since #21 is a build-time Node script and #9 is browser code, they cannot share the same module, but they should be consistent.
- **#8 (Low)**: `decodeHtml` is called on every render in `Question.tsx` for every question and answer string. Each call runs multiple regex passes. The decoded values never change, so this work is wasted on re-renders.

## Functional Requirements

- All named HTML entities returned by OpenTDB (and any other provider) must decode correctly, including but not limited to `&nbsp;`, `&eacute;`, `&ndash;`, `&mdash;`, `&lsquo;`, `&rsquo;`, etc.
- Numeric decimal and hex entities (`&#8217;`, `&#x2019;`) must continue to decode correctly.
- The fix in `src/utils/index.ts` and the fix in `scripts/download-trivia.mjs` must produce identical decoded output for the same input.
- Decoded question/answer strings in `Question.tsx` must not be recomputed on every re-render.

## Possible Edge Cases

- **Security note on DOM-based decoding**: `document.createElement('textarea'); el.innerHTML = html` was explicitly removed in a prior security hardening commit in favor of DOM-free regex. The textarea trick extracts `.value` (plain text), which is safe from XSS, but it was still intentionally removed. Any decision to reintroduce it requires explicit sign-off.
- **Node.js environment**: `scripts/download-trivia.mjs` runs in Node.js where `document` is unavailable. The fix there must remain regex-based or use a Node-compatible library (e.g. `entities`, `he`).
- **Empty or non-string input**: `decodeHtml` should handle empty strings without error.
- **Double-encoded entities**: `&amp;amp;` should decode to `&amp;`, not `&`. Current behavior should be preserved.

## Acceptance Criteria

- `decodeHtml('Caf&eacute;')` returns `'Café'`.
- `decodeHtml('Don&rsquo;t')` returns `"Don't"`.
- `decodeHtml('&nbsp;')` returns a non-breaking space character.
- `decodeHtml('&#8217;')` and `decodeHtml('&#x2019;')` continue to return `'`.
- `decodeHtml('')` returns `''` without error.
- `scripts/download-trivia.mjs` produces the same decoded output as `src/utils/index.ts` for the same input strings.
- `Question.tsx` does not re-run `decodeHtml` on re-renders when question data has not changed (verified by wrapping with `useMemo`).
- All existing tests pass; new tests cover the entity cases above.

## Open Questions

_None — all decisions resolved before planning._

## Decisions

- **#9 and #21 implementation**: Use the `he` npm library for HTML entity decoding. It is well-audited, handles all named and numeric entities, and works in both browser and Node.js contexts. This resolves both the coverage gap (#9) and the duplication in the download script (#21) with a single dependency. The existing DOM-free regex implementation is replaced in `src/utils/index.ts`; `scripts/download-trivia.mjs` is updated to import and use `he` as well.

## Testing Guidelines

- `src/utils/index.test.ts` (create if not present): test `decodeHtml` for the named entities listed in acceptance criteria, numeric decimal, numeric hex, empty string, and passthrough of unrecognized entities.
- `src/components/Question.test.tsx`: add a test verifying that a question with `&eacute;` in the text renders `é` in the DOM.
- No need to test memoization mechanics directly; rendered output correctness is sufficient.

## Personal Opinion

These three items together are a good idea and straightforward to fix as a batch since they're all in the same area.

The one real decision is #9's implementation approach. The current regex table was deliberately chosen over the DOM textarea trick for security hygiene, even though the textarea value extraction is technically safe. Extending the regex table to cover ~20 more common entities (the ones OpenTDB actually returns) is a defensible middle ground — it avoids reintroducing any DOM mutation at all and keeps the function pure and testable outside a browser context. The downside is it's still incomplete coverage in theory, just much less so in practice. A third option is using a well-audited library like `he` for both the browser utility and the Node script, which solves both #9 and #21 cleanly at the cost of one dependency.

#8 is trivially easy and clearly correct. #21 is a one-line fix once #9 is resolved.

No significant concerns. The security note about the DOM approach should be surfaced to the user before implementation starts.
