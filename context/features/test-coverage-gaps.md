# Plan: Test Coverage Gaps (#29)

## Context

Backlog #29 identified four test gaps. Since then, App.tsx and ErrorBoundary.tsx have been fully covered by new tests. Two gaps remain:
- `Navbar.tsx` has no test file at all
- No test verifies category selection changes the route param in the navigate call

## Scope

Two test additions only. No source file changes.

## File 1: tests/Navbar.component.test.tsx (new)

Navbar is a single `<Link>` to "/" with text "TRIVIA CHALLENGE". Needs `MemoryRouter` wrapper.

Tests:
1. Renders "TRIVIA CHALLENGE" text
2. The link points to `/`

## File 2: tests/Menu.page.test.tsx (extend)

Existing submit test uses the default first category. Add one test that:
- Changes the category select to the second category (id: '10', "Books")
- Clicks submit
- Asserts `mockNavigate` was called with `/quiz/10/all/all/`

## Verification

1. `npm run build` — must pass
2. All existing 73 tests pass, new tests pass
