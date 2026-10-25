# Cloudflare Pages Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace GitHub Pages with Cloudflare Pages (free `*.pages.dev` subdomain, Git integration) as the site's sole deployment target.

**Architecture:** Add a native Cloudflare `_redirects` rule for SPA routing, remove the GitHub-Pages-specific 404/sessionStorage routing shim and the GitHub Actions Pages workflow, then connect the repo to Cloudflare Pages via its dashboard Git integration (manual, non-code step) and disable GitHub Pages.

**Tech Stack:** Vite static build (`dist/`), Cloudflare Pages, existing GitHub repo `mpuntodewof/mpuntodewof.github.io`.

**Spec:** `docs/superpowers/specs/2026-08-29-cloudflare-pages-migration-design.md`

---

### Task 1: Add native Cloudflare SPA routing

**Files:**
- Create: `public/_redirects`

- [ ] **Step 1: Create the redirects file**

```
/* /index.html 200
```

Save this single line (no trailing content needed) to `public/_redirects`.

- [ ] **Step 2: Build and verify it's copied into dist/**

Run: `npm run build`
Expected: build succeeds; `dist/_redirects` exists and contains `/* /index.html 200`.

Verify with:
```bash
cat dist/_redirects
```
Expected output: `/* /index.html 200`

- [ ] **Step 3: Commit**

```bash
git add public/_redirects
git commit -m "feat: add Cloudflare Pages SPA redirect rule"
```

---

### Task 2: Remove the GitHub Pages SPA routing shim

**Files:**
- Delete: `public/404.html`
- Modify: `index.html:32-43`

- [ ] **Step 1: Delete the 404 shim**

```bash
git rm public/404.html
```

- [ ] **Step 2: Remove the inline replay script from index.html**

In `index.html`, delete this block (currently lines 32-43):

```html
    <script>
      // Replays the path stashed by public/404.html. Runs before main.tsx so
      // React Router reads the restored URL on its first render rather than
      // seeing "/" and rendering the homepage.
      (function () {
        var target = sessionStorage.getItem("spa-redirect");
        if (target && target !== "/") {
          sessionStorage.removeItem("spa-redirect");
          window.history.replaceState(null, "", target);
        }
      })();
    </script>
```

The `<body>` should now read:

```html
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <!-- Cloudflare Web Analytics -->
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "e919f767524e4ff4827bc979e5cbcad7", "spa": true}'></script>
    <!-- End Cloudflare Web Analytics -->
  </body>
```

- [ ] **Step 3: Build and smoke-test SPA routing locally**

Run:
```bash
npm run build
npm run preview
```

With the preview server running, open the printed local URL, navigate to a case-study project route (e.g. `/project/<slug>` — check `src/data` or the router for a real slug), then hard-refresh that URL directly. `vite preview` does its own SPA fallback independent of `_redirects` (which only Cloudflare's edge reads), so this step only confirms the app itself still works correctly after removing the shim — it does NOT validate `_redirects`. The real validation of `_redirects` happens against the live Cloudflare deployment in Task 4, Step 10. Stop the preview server after checking (Ctrl+C).

Expected: homepage and the direct project route both render the app (no blank page or dev-server 404).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "fix: remove GitHub Pages SPA routing shim"
```

---

### Task 3: Remove the GitHub Pages deploy workflow

**Files:**
- Delete: `.github/workflows/deploy.yml`

- [ ] **Step 1: Delete the workflow**

```bash
git rm .github/workflows/deploy.yml
```

- [ ] **Step 2: Confirm no other workflow references GitHub Pages**

```bash
ls .github/workflows/
```
Expected: `deploy.yml` no longer listed. If other workflow files exist, confirm none of them reference `actions/deploy-pages` or `actions/configure-pages` (grep them):

```bash
grep -l "deploy-pages\|configure-pages" .github/workflows/*.yml
```
Expected: no output (no matches).

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove GitHub Pages deploy workflow"
```

---

### Task 4: Connect Cloudflare Pages and disable GitHub Pages (manual checkpoint)

This task has no code changes — it's performed by the repo owner in the Cloudflare and GitHub dashboards. Do not attempt to automate this task; present these steps to the user and wait for confirmation before proceeding to Task 5.

**Steps for the user to perform:**

1. Push the commits from Tasks 1-3 to `origin/main` (`git push`), so Cloudflare has a working build to pick up.
2. Log into the Cloudflare dashboard at https://dash.cloudflare.com.
3. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
4. Authorize the Cloudflare GitHub App for the `mpuntodewof/mpuntodewof.github.io` repository (or the whole GitHub account, if preferred).
5. Select the repository and the `main` branch as the production branch.
6. Configure build settings:
   - Framework preset: **Vite** (or **None** with the manual settings below)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22` (there's no `.nvmrc` in the repo, and this matches the Node version the old CI used)
7. Click **Save and Deploy**. Wait for the build to finish.
8. Cloudflare assigns a `<project-name>.pages.dev` URL (the project name is chosen during step 5/6, editable in project settings). Note this URL.
9. Visit the `.pages.dev` URL and confirm the homepage loads.
10. Navigate directly to a case-study project URL (e.g. `<pages-url>/project/<slug>`) by typing it in the address bar (not by clicking through the app), and confirm it renders the app instead of a Cloudflare 404 — this validates the `_redirects` rule from Task 1.
11. In the GitHub repo, go to **Settings** → **Pages**, and set the source to **None** to disable GitHub Pages.
12. Confirm `https://mpuntodewof.github.io` no longer serves the old build (it may take a few minutes to stop resolving, or may show GitHub's default "not published" page).

- [ ] **Checkpoint: user confirms all 12 steps above are complete before Task 5**

---

### Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm repo state is clean**

```bash
git status
git log --oneline -5
```
Expected: working tree clean, top commits are the ones from Tasks 1-3, all pushed.

- [ ] **Step 2: Confirm no leftover GitHub Pages artifacts**

```bash
ls public/404.html 2>&1
ls .github/workflows/deploy.yml 2>&1
```
Expected: both report "No such file or directory".

- [ ] **Step 3: Confirm the live Cloudflare Pages site works end-to-end**

Manually visit the `.pages.dev` URL from Task 4 and check:
- Homepage renders correctly (hero, sections, images load)
- A direct/refreshed load of a `/project/<slug>` route renders correctly
- No console errors related to missing assets (open browser dev tools console)

- [ ] **Step 4: Report completion to the user**

Summarize: Cloudflare Pages is live at `<project-name>.pages.dev`, GitHub Pages is disabled, and the SPA routing shim has been replaced with a native `_redirects` rule.
