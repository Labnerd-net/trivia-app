# TODO

## Improvements

- **Error boundary** — a single `<ErrorBoundary>` wrapping the routes in `App.tsx` would catch uncaught render errors and show a fallback UI instead of a blank screen.

- **More test coverage** — current tests only cover pure utility functions and the provider registry. No tests for components or page-level fetch logic.

- **`Quiz.tsx` `useParams` types** — `useParams` returns `string | undefined` per React Router's actual types. The typed generic suppresses that, but it's a white lie to the type system. The safer fix is to guard against `undefined` values or use a route loader.
