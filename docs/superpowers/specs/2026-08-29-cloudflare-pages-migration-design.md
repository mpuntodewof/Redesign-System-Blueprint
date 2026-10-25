# Cloudflare Pages Migration — Design

## Goal

Replace GitHub Pages with Cloudflare Pages as the sole hosting/deployment target, served from the free `<project-name>.pages.dev` subdomain, deployed via Cloudflare's Git integration.

## Background

The site currently deploys to GitHub Pages (`mpuntodewof.github.io`) via `.github/workflows/*.yml` on every push to `main`: checkout → `npm ci` → `npm run build` → upload `dist/` → deploy via `actions/deploy-pages`.

Because GitHub Pages serves only static files with no rewrite support, client-side routes (e.g. `/project/*`) 404 on direct load or refresh. The current workaround (`2668504`) uses `public/404.html` to stash the requested path in `sessionStorage` and bounce to `/`, where an inline script in `index.html` replays it via `history.replaceState` before React mounts.

Cloudflare Pages supports native SPA fallback via a `_redirects` file, making that shim unnecessary.

Cloudflare Web Analytics is already embedded in `index.html` (unrelated to this migration; left as-is).

## Scope

**In scope:**
- Add native Cloudflare SPA routing (`public/_redirects`)
- Remove the GitHub-Pages-specific SPA shim (`public/404.html`, inline replay script in `index.html`)
- Remove the GitHub Actions Pages deploy workflow
- Document the manual Cloudflare dashboard steps (repo owner performs these; not automatable by an agent)

**Out of scope:**
- Custom domain purchase/DNS configuration — using the free `*.pages.dev` subdomain only
- Wrangler CLI / GitHub-Actions-driven Cloudflare deploy — using Cloudflare's Git integration instead, so no deploy step lives in the repo
- Changes to Cloudflare Web Analytics

## Design

### 1. SPA routing on Cloudflare Pages

Add `public/_redirects`:
```
/* /index.html 200
```
This serves `index.html` for any path with no matching static file, letting React Router handle it — a single rule, no client-side bounce or flash.

### 2. Remove the GitHub Pages SPA shim

- Delete `public/404.html`
- Remove the inline `sessionStorage`/`replaceState` replay `<script>` block from `index.html` (added in commit `2668504`)

These exist solely to work around GitHub Pages' lack of rewrites; once `_redirects` handles routing, they're dead code specific to the old host.

### 3. Remove the GitHub Pages deploy workflow

Delete `.github/workflows/deploy.yml` (or whatever its actual filename is) entirely, since Cloudflare's Git integration builds and deploys independently — no CI step needed in-repo.

### 4. Cloudflare dashboard setup (manual, not code)

These steps happen in the Cloudflare dashboard/GitHub UI and cannot be performed by an agent — documented here so the implementation plan can call them out as explicit user checkpoints:

1. Log into Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Authorize the Cloudflare GitHub App for the `mpuntodewof/mpuntodewof.github.io` repo (or the whole account).
3. Select the repo and `main` branch.
4. Configure build settings:
   - Framework preset: Vite (or None, with manual settings)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: pin to `22` (matches current CI) via environment variable `NODE_VERSION=22` in Pages project settings, since there's no `.nvmrc` in the repo.
5. Deploy — Cloudflare assigns a `<project-name>.pages.dev` URL automatically (project name chosen during setup).
6. Verify the deployed site: homepage loads, direct navigation to a `/project/*` case-study route works (validates `_redirects`), assets/images load.
7. In the GitHub repo Settings → Pages, disable GitHub Pages (set source to "None") to fully retire the old host.

### Testing / Verification

- Local: `npm run build && npm run preview`, confirm build succeeds with `_redirects` present in `dist/` (Vite copies everything from `public/` automatically).
- Post-deploy on Cloudflare: manually visit the `.pages.dev` URL, test homepage load and a direct/refreshed load of a case-study project route.
- Confirm GitHub Pages is disabled and the old workflow file is gone (no duplicate/competing deploys).

## Risks / Notes

- Removing `public/404.html` means Cloudflare Pages' own default 404 behavior no longer applies here — `_redirects` returning `200` for all paths means genuinely invalid paths (typos) will silently render the app shell/homepage rather than a 404 page. This matches typical SPA behavior and is expected, not a regression.
- No `.nvmrc` exists; Node version must be set explicitly in Cloudflare Pages project settings to match CI (`22`), otherwise Cloudflare's default may differ.
