# Spec for Route Param Injection Guard

Title: Route Param Injection Guard
Branch: claude/fix/route-param-injection-guard
Spec file: context/specs/route-param-injection-guard.md

## Summary

Route params `categoryID`, `difficulty`, and `type` are read from the URL in `Quiz.tsx` and passed directly into `provider.getQuestions()`, which interpolates them into API URLs without sanitization. A crafted URL (e.g., `/quiz/9%26token%3Dinjected/easy/multiple`) could inject extra query parameters into the outbound API request, manipulating what the provider fetches.

The fix is to validate each param against known-good values before use, and bail out with a user-visible error if any param is invalid.

## Functional Requirements

- `difficulty` must be validated against the selected provider's `provider.difficulties` allowlist (by `value`) before passing to `getQuestions()`.
- `type` must be validated against the selected provider's `provider.types` allowlist (by `value`) before passing to `getQuestions()`.
- `categoryId` must be validated per provider:
  - OpenTDB: must be numeric (digits only) or the special `"all"` value.
  - The Trivia API: must be one of the known category slugs or `"all"`.
- If any param fails validation, `Quiz.tsx` should display a user-visible error (e.g., "Invalid quiz parameters.") instead of making the API call.
- Valid params should pass through unchanged — no behavior change for normal usage.

## Possible Edge Cases

- `"all"` is a valid sentinel value used by both providers for "no filter"; it must pass validation even though it is not a real category/difficulty/type.
- OpenTDB category IDs are integers (e.g., `"9"`); a value like `"9&token=injected"` must be rejected.
- The Trivia API category slugs use underscores (e.g., `"arts_and_literature"`); the allowlist check must be exact-match.
- URL-encoded characters that decode to `&`, `=`, or `#` are the primary injection vector — validation by allowlist inherently handles this.
- A provider change (e.g., navigating to a URL for a different provider) could make a previously valid param invalid; validate against the currently selected provider's allowlists.

## Acceptance Criteria

- Navigating to a crafted URL with injected params (e.g., `categoryID = "9&token=abc"`) shows an error message and does not make an API call.
- Navigating to a normal URL (e.g., `/quiz/9/easy/multiple`) works as before.
- Navigating to `/quiz/all/all/all` works as before.
- The error message is user-friendly and does not expose internal details.

## Open Questions

- None.

## Testing Guidelines

Create or update tests in `./tests` to cover:

- Valid params (numeric categoryId + known difficulty + known type) pass validation and the fetch proceeds.
- A non-numeric `categoryId` for OpenTDB fails validation (e.g., `"9&token=injected"`).
- An unknown `difficulty` value (e.g., `"legendary"`) fails validation.
- An unknown `type` value (e.g., `"essay"`) fails validation.
- `"all"` is accepted for `categoryId`, `difficulty`, and `type`.
- An unknown category slug for The Trivia API fails validation.

## Personal Opinion

This is a genuine security fix and should be done. The injection risk is real — any user can craft a URL and add arbitrary query parameters to the API call, which could leak a session token or manipulate results.

The fix is low-complexity: allowlist checks on a handful of string values. The only mildly tricky part is the `categoryId` check for The Trivia API (the valid slugs are hardcoded in the provider already, so they can be extracted for comparison). No concerns about scope creep or over-engineering here — it's a targeted, proportionate fix.
