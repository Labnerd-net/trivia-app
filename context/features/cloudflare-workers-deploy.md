# Plan: Cloudflare Workers Deployment

## Context

The app is currently deployed via Dokploy as a Docker/nginx container. Since it's a purely static SPA with no backend, Docker adds no value — it's just a wrapper around nginx serving `dist/`. Cloudflare Workers now supports static asset hosting natively (with SPA fallback routing), and Cloudflare has announced all new investment goes into Workers rather than Pages. This migration replaces the Docker pipeline with a direct Wrangler deploy.

## Steps

### 1. Add `wrangler.jsonc` at project root

```jsonc
{
  "name": "trivia-app",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

The `not_found_handling: "single-page-application"` replaces nginx's `try_files $uri /index.html` behavior.

### 2. Replace `.github/workflows/docker-publish.yml` with `deploy.yml`

Delete `docker-publish.yml` and create `.github/workflows/deploy.yml`:

- Trigger: `push` to `main` (same as current)
- Steps: `actions/checkout@v4` → `actions/setup-node@v4` (Node 20) → `npm ci` → `npm run build` → `cloudflare/wrangler-action@v3`
- Wrangler action needs two GitHub secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

### 3. Delete Docker files

Remove these three files:
- `Dockerfile`
- `nginx.conf`
- `.dockerignore`

## Files Changed

| File | Action |
|---|---|
| `wrangler.jsonc` | Create |
| `.github/workflows/deploy.yml` | Create |
| `.github/workflows/docker-publish.yml` | Delete |
| `Dockerfile` | Delete |
| `nginx.conf` | Delete |
| `.dockerignore` | Delete |

## Pre-deploy Manual Step (user)

Before the workflow can run, two secrets must be added to the GitHub repo:
- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with Workers edit permissions
- `CLOUDFLARE_ACCOUNT_ID` — found in the Cloudflare dashboard sidebar

## Verification

1. `npm run build` — must succeed with no errors
2. Create branch, commit, open PR — workflow should run (will fail without secrets, which is expected until secrets are set)
3. After secrets are set and merged to `main`, confirm deploy completes and the Workers URL loads the app
4. Navigate directly to a route (e.g. `/quiz/...`) — must not 404
