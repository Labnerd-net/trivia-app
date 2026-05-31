# Spec for Cloudflare Workers Deploy

Title: Cloudflare Workers Deployment
Branch: claude/feature/cloudflare-workers-deploy
Spec file: context/specs/cloudflare-workers-deploy.md

## Summary

Migrate the deployment target from Dokploy (Docker/nginx) to Cloudflare Workers static asset hosting. The app is a purely static SPA — no backend code. The goal is to replace the Docker/nginx build and deploy pipeline with Wrangler-based deployment to Cloudflare Workers.

## Functional Requirements

- Add a `wrangler.jsonc` config that points at `./dist` and enables single-page-application fallback routing
- Update the GitHub Actions workflow to deploy via Wrangler instead of building and pushing a Docker image
- Remove `Dockerfile`, `nginx.conf`, and `.dockerignore`
- The existing `npm run build` output must serve identically on Cloudflare as it does locally

## Possible Edge Cases

- SPA routing: all non-asset paths must fall back to `index.html` — handled by `not_found_handling: single-page-application`
- Large data files in `public/data/` — all are under 2MB, well within the 25MB per-file limit
- Cloudflare API token must be stored as a GitHub Actions secret before the workflow can deploy

## Acceptance Criteria

- `wrangler.jsonc` exists at project root with correct assets config
- GitHub Actions workflow deploys to Cloudflare Workers on push to `main` (no Docker build)
- SPA routing works: navigating directly to a route does not return 404
- All `public/data/` JSON files are served correctly

## Open Questions

- None.

## Testing Guidelines

No automated tests needed — this is infrastructure only. Manual verification:
- `npm run build` succeeds
- `wrangler deploy` (or CI run) completes without error
- App loads and routing works on the deployed Workers URL

## Personal Opinion

This is a straightforward, low-risk migration. The app is purely static so there's no compute to migrate — just a config file and a CI tweak. Cloudflare Pages being deprecated in favor of Workers (per Cloudflare's own blog) makes this the right call. No concerns.
