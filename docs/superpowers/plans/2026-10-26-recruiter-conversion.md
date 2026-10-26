# Recruiter & Client Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio convert visitors arriving from shared links: availability-led hero, a three-track "Work with me" section with deep links, a contact form that really sends (Web3Forms), proper link previews per page, and search basics.

**Architecture:** React SPA (Vite + Tailwind) served by a Cloudflare Worker with static assets. Shared, import-free modules (`src/lib/profile.ts`, `src/data/*`) feed the app, a Vite plugin (sitemap/robots/`%SITE_URL%` in `index.html`) and the Worker (per-page `<head>` tags for `/project/*` and `/experience/*`). The contact dialog moves behind a small context so several sections can open it with a preset intent.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind 3, shadcn/Radix, react-hook-form + zod 4, Vitest 3 + Testing Library (jsdom), Cloudflare Workers static assets (`wrangler.jsonc`), Web3Forms, playwright-core (one-off OG image script).

**Spec:** `docs/superpowers/specs/2026-10-26-recruiter-conversion-design.md`

**Conventions for every task**
- Work in `P:/Projects/Playground/portfolio-systems-blueprint` on branch `feat/particle-morph`. Never push, never switch branches.
- Files may be CRLF; edit in place and keep the file's line endings.
- Shared modules imported by the Worker or `vite.config.ts` (`src/lib/profile.ts`, `src/lib/pageMeta.ts`, `src/lib/edgeMeta.ts`, `src/lib/sitemap.ts`, `src/data/projects.ts`, `src/data/experience.ts`) must use **relative imports only** (no `@/` alias): those bundlers do not know the alias.
- Run commands from the repo root in Windows PowerShell or Git Bash (not WSL; `node_modules` holds Windows binaries).
- Commit messages end with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Baseline before Task 1: `npx vitest run` → 24 files / 109 tests pass; `npm run lint` → 3 pre-existing errors (ui/command.tsx, ui/textarea.tsx, tailwind.config.ts `require()`), 7 warnings.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/profile.ts` | modify | + `SITE_URL`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`, `AVAILABILITY`, `REPLY_TIME` |
| `src/lib/pageMeta.ts` | create | `metaForPath()`, `injectMeta()` — page title/description/url, shared by app + Worker |
| `src/lib/edgeMeta.ts` | create | `handlePageRequest()` — Worker logic, testable in Node |
| `worker/index.ts` | create | Worker entry, wires `env.ASSETS` to `handlePageRequest` |
| `wrangler.jsonc` | modify | `main`, `ASSETS` binding, `run_worker_first` |
| `src/lib/sitemap.ts` | create | `sitePaths()`, `buildSitemap()`, `buildRobots()` |
| `vite.config.ts` | modify | `siteFiles()` plugin: `%SITE_URL%` in HTML, emits sitemap.xml + robots.txt |
| `public/robots.txt` | delete | now generated |
| `index.html` | modify | canonical, full OG/Twitter tags, JSON-LD Person |
| `src/hooks/useDocumentMeta.ts` | create | sets `document.title` + description for SPA navigation |
| `scripts/og-template.html`, `scripts/og-image.mjs`, `public/og-image.png` | create | 1200×630 link-preview image |
| `src/components/contact/ContactDialogContext.tsx` | create | provider + `useContactDialog()` + intent labels |
| `src/components/ContactFormDialog.tsx` | rewrite | Web3Forms delivery, intent field, fallback, honeypot |
| `src/hooks/useHashTarget.ts` | create | which deep-linked card to highlight |
| `src/components/WorkWithMe.tsx` | create | three engagement cards (replaces Services) |
| `src/components/Services.tsx` + test | delete | superseded |
| `src/components/Hero.tsx`, `Contact.tsx`, `Navbar.tsx`, `src/pages/*.tsx`, `src/index.css` | modify | copy, wiring, highlight style |
| `.env.example`, `src/vite-env.d.ts` | create/modify | `VITE_WEB3FORMS_KEY` |
| `src/lib/openUrl.ts` | create | mockable full-page navigation (mailto fallback) |

---

### Task 1: Site constants and page metadata

**Files:**
- Modify: `src/lib/profile.ts`
- Create: `src/lib/pageMeta.ts`
- Test: `src/lib/pageMeta.test.ts`

- [ ] **Step 1: Write the failing test** — `src/lib/pageMeta.test.ts`

```ts
import { defaultMeta, injectMeta, metaForPath } from "./pageMeta";
import { SITE_URL } from "./profile";

describe("metaForPath", () => {
  it("returns the default meta for the homepage, with or without a trailing slash", () => {
    expect(metaForPath("/")).toEqual(defaultMeta);
    expect(metaForPath("")).toEqual(defaultMeta);
  });

  it("describes a clickable case study", () => {
    const meta = metaForPath("/project/talenta-sap-integration/");
    expect(meta?.title).toBe("Talenta → SAP Integration — Case study · M. Puntodewo Fadhillah");
    expect(meta?.url).toBe(`${SITE_URL}/project/talenta-sap-integration`);
    expect(meta?.description.length).toBeGreaterThan(20);
  });

  it("has no page for private (non-clickable) projects or unknown slugs", () => {
    expect(metaForPath("/project/e-credit-management")).toBeNull();
    expect(metaForPath("/project/nope")).toBeNull();
    expect(metaForPath("/somewhere")).toBeNull();
  });

  it("describes an experience role", () => {
    const meta = metaForPath("/experience/bank-raya");
    expect(meta?.title).toBe("Backend Developer at PT Bank Raya · M. Puntodewo Fadhillah");
    expect(meta?.description).toContain("BI-FAST middleware");
    expect(meta?.url).toBe(`${SITE_URL}/experience/bank-raya`);
  });
});

describe("injectMeta", () => {
  const shell = [
    "<title>Old</title>",
    '<meta name="description" content="old" />',
    '<link rel="canonical" href="https://x/" />',
    '<meta property="og:title" content="old" />',
    '<meta property="og:description" content="old" />',
    '<meta property="og:url" content="https://x/" />',
    '<meta name="twitter:title" content="old" />',
    '<meta name="twitter:description" content="old" />',
  ].join("\n");

  it("replaces every page-specific tag and escapes HTML", () => {
    const html = injectMeta(shell, { title: 'A & "B"', description: "Costs $1 <b>", url: "https://site/p" });
    expect(html).toContain("<title>A &amp; &quot;B&quot;</title>");
    expect(html).toContain('<meta name="description" content="Costs $1 &lt;b&gt;" />');
    expect(html).toContain('<link rel="canonical" href="https://site/p" />');
    expect(html).toContain('<meta property="og:title" content="A &amp; &quot;B&quot;" />');
    expect(html).toContain('<meta property="og:url" content="https://site/p" />');
    expect(html).toContain('<meta name="twitter:description" content="Costs $1 &lt;b&gt;" />');
    expect(html).not.toContain("old");
  });

  it("leaves a shell without those tags untouched", () => {
    expect(injectMeta("<p>hi</p>", defaultMeta)).toBe("<p>hi</p>");
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/pageMeta.test.ts`
Expected: FAIL — cannot resolve `./pageMeta`.

- [ ] **Step 3: Add the constants** — append to `src/lib/profile.ts`

```ts

/** Public origin of the site. The only place to change when a custom domain is attached. */
export const SITE_URL = "https://redesign-system-blueprint.puntodewofadhillah.workers.dev";
export const DEFAULT_TITLE = "Muhammad Puntodewo Fadhillah — Backend & Integration Engineer";
export const DEFAULT_DESCRIPTION =
  "Backend & integration engineer (.NET, Go, SQL Server) building the APIs and background services that move data between SAP, HR platforms, payment gateways and banks.";
export const AVAILABILITY = "Available · contract & part-time (~20 h/week) · open to full-time roles";
export const REPLY_TIME = "1–2 working days";
```

- [ ] **Step 4: Implement** — `src/lib/pageMeta.ts`

```ts
// Relative imports only: this module is bundled into the Cloudflare Worker.
import projects from "../data/projects";
import { roles } from "../data/experience";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "./profile";

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  url: string;
}

export const defaultMeta: PageMeta = { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, url: `${SITE_URL}/` };

const SUFFIX = "M. Puntodewo Fadhillah";

/** Title, description and canonical URL for a route, or null when the route has no page of its own. */
export function metaForPath(pathname: string): PageMeta | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return defaultMeta;

  const projectSlug = path.match(/^\/project\/([^/]+)$/)?.[1];
  if (projectSlug) {
    const project = projects.find((p) => p.slug === projectSlug && p.clickable !== false);
    if (!project) return null;
    return {
      title: `${project.title} — Case study · ${SUFFIX}`,
      description: project.impact,
      url: `${SITE_URL}/project/${project.slug}`,
    };
  }

  const roleSlug = path.match(/^\/experience\/([^/]+)$/)?.[1];
  if (roleSlug) {
    const role = roles.find((r) => r.slug === roleSlug);
    if (!role) return null;
    return {
      title: `${role.role} at ${role.company} · ${SUFFIX}`,
      description: `${role.fullPeriod} · ${role.modules.map((m) => m.name).join(", ")}.`,
      url: `${SITE_URL}/experience/${role.slug}`,
    };
  }

  return null;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Rewrites the SPA shell's page-specific head tags. Tags the shell lacks are left alone. */
export function injectMeta(html: string, meta: PageMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  // Function replacers: a `$` in page text must not be read as a back-reference.
  const attr = (pattern: RegExp, value: string) => (source: string) =>
    source.replace(pattern, (_, before: string, after: string) => `${before}${value}${after}`);
  const steps = [
    (s: string) => s.replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`),
    attr(/(<meta name="description" content=")[^"]*(")/, description),
    attr(/(<link rel="canonical" href=")[^"]*(")/, url),
    attr(/(<meta property="og:title" content=")[^"]*(")/, title),
    attr(/(<meta property="og:description" content=")[^"]*(")/, description),
    attr(/(<meta property="og:url" content=")[^"]*(")/, url),
    attr(/(<meta name="twitter:title" content=")[^"]*(")/, title),
    attr(/(<meta name="twitter:description" content=")[^"]*(")/, description),
  ];
  return steps.reduce((acc, step) => step(acc), html);
}
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/lib/pageMeta.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/profile.ts src/lib/pageMeta.ts src/lib/pageMeta.test.ts
git commit -m "feat: site constants and per-page metadata" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Edge metadata Worker

**Files:**
- Create: `src/lib/edgeMeta.ts`, `worker/index.ts`
- Modify: `wrangler.jsonc`
- Test: `src/lib/edgeMeta.test.ts`

- [ ] **Step 1: Write the failing test** — `src/lib/edgeMeta.test.ts`

```ts
// @vitest-environment node
import { handlePageRequest, type AssetFetcher } from "./edgeMeta";

const SHELL = '<html><head><title>Home</title><meta property="og:title" content="Home" /></head></html>';

const assets = (body = SHELL, init: ResponseInit = { headers: { "content-type": "text/html; charset=utf-8" } }) => {
  const calls: string[] = [];
  const fetcher: AssetFetcher = {
    fetch: async (request) => {
      calls.push(new URL(request.url).pathname);
      return new Response(body, init);
    },
  };
  return { fetcher, calls };
};

describe("handlePageRequest", () => {
  it("serves the SPA shell with case-study tags for a project URL", async () => {
    const { fetcher, calls } = assets();
    const res = await handlePageRequest(new Request("https://site.test/project/talenta-sap-integration"), fetcher);
    const html = await res.text();
    expect(calls).toEqual(["/"]);
    expect(html).toContain("<title>Talenta → SAP Integration — Case study · M. Puntodewo Fadhillah</title>");
    expect(html).toContain('content="Talenta → SAP Integration — Case study · M. Puntodewo Fadhillah"');
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("passes unknown pages through unchanged", async () => {
    const { fetcher } = assets();
    const res = await handlePageRequest(new Request("https://site.test/project/nope"), fetcher);
    expect(await res.text()).toBe(SHELL);
  });

  it("does not touch non-HTML or non-GET responses", async () => {
    const { fetcher } = assets("{}", { headers: { "content-type": "application/json" } });
    const res = await handlePageRequest(new Request("https://site.test/experience/bank-raya"), fetcher);
    expect(await res.text()).toBe("{}");
    const post = await handlePageRequest(new Request("https://site.test/experience/bank-raya", { method: "POST" }), assets().fetcher);
    expect(await post.text()).toBe(SHELL);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/edgeMeta.test.ts`
Expected: FAIL — cannot resolve `./edgeMeta`.

- [ ] **Step 3: Implement** — `src/lib/edgeMeta.ts`

```ts
// Relative imports only: this module is bundled into the Cloudflare Worker.
import { injectMeta, metaForPath } from "./pageMeta";

/** The subset of the Workers static-assets binding this module uses. */
export interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

/**
 * Serves the SPA shell for a deep link with that page's title and preview tags,
 * so link unfurlers (LinkedIn, WhatsApp, Slack) that do not run JavaScript see
 * the right card. Anything unexpected falls back to the untouched asset response.
 */
export async function handlePageRequest(request: Request, assets: AssetFetcher): Promise<Response> {
  const meta = request.method === "GET" || request.method === "HEAD" ? metaForPath(new URL(request.url).pathname) : null;
  if (!meta) return assets.fetch(request);

  const shell = await assets.fetch(new Request(new URL("/", request.url), { headers: request.headers }));
  try {
    const type = shell.headers.get("content-type") ?? "";
    if (!shell.ok || !type.includes("text/html")) return shell;
    const html = injectMeta(await shell.clone().text(), meta);
    const headers = new Headers(shell.headers);
    headers.delete("content-length");
    return new Response(request.method === "HEAD" ? null : html, { status: shell.status, headers });
  } catch {
    return shell;
  }
}
```

- [ ] **Step 4: Worker entry** — `worker/index.ts`

```ts
import { handlePageRequest, type AssetFetcher } from "../src/lib/edgeMeta";

interface Env {
  ASSETS: AssetFetcher;
}

// Runs only for /project/* and /experience/* (see run_worker_first in wrangler.jsonc);
// every other request is answered by the static assets directly.
export default {
  fetch: (request: Request, env: Env) => handlePageRequest(request, env.ASSETS),
};
```

- [ ] **Step 5: Wire it** — replace `wrangler.jsonc` with

```jsonc
{
	"name": "redesign-system-blueprint",
	"compatibility_date": "2026-08-29",
	"main": "worker/index.ts",
	"assets": {
		"directory": "./dist",
		"binding": "ASSETS",
		"not_found_handling": "single-page-application",
		"run_worker_first": ["/project/*", "/experience/*"]
	}
}
```

- [ ] **Step 6: Run the test**

Run: `npx vitest run src/lib/edgeMeta.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Check the Worker bundles**

Run: `npx wrangler deploy --dry-run --outdir .wrangler/dry` (after `npm run build` so `./dist` exists)
Expected: "--dry-run: exiting now." with no bundling errors. If `npx wrangler` needs to download, allow it; do **not** run a real deploy. Delete `.wrangler/dry` afterwards (it is git-ignored anyway).

- [ ] **Step 8: Commit**

```bash
git add src/lib/edgeMeta.ts src/lib/edgeMeta.test.ts worker/index.ts wrangler.jsonc
git commit -m "feat: worker injects per-page preview tags for deep links" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Sitemap, robots and `%SITE_URL%` in index.html

**Files:**
- Create: `src/lib/sitemap.ts`, `src/lib/sitemap.test.ts`
- Modify: `vite.config.ts`, `index.html`
- Delete: `public/robots.txt`

- [ ] **Step 1: Write the failing test** — `src/lib/sitemap.test.ts`

```ts
import { buildRobots, buildSitemap, sitePaths } from "./sitemap";

describe("sitemap", () => {
  it("lists the homepage, clickable case studies and every role", () => {
    const paths = sitePaths();
    expect(paths[0]).toBe("/");
    expect(paths).toContain("/project/talenta-sap-integration");
    expect(paths).not.toContain("/project/e-credit-management");
    expect(paths).toContain("/experience/thortech-asia");
  });

  it("renders absolute URLs", () => {
    const xml = buildSitemap("https://site.test");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<loc>https://site.test/</loc>");
    expect(xml).toContain("<loc>https://site.test/experience/bank-raya</loc>");
  });

  it("points robots at the sitemap", () => {
    const robots = buildRobots("https://site.test");
    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots.trim().endsWith("Sitemap: https://site.test/sitemap.xml")).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/sitemap.test.ts`
Expected: FAIL — cannot resolve `./sitemap`.

- [ ] **Step 3: Implement** — `src/lib/sitemap.ts`

```ts
// Relative imports only: this module is loaded by vite.config.ts.
import projects from "../data/projects";
import { roles } from "../data/experience";

export function sitePaths(): string[] {
  return [
    "/",
    ...projects.filter((p) => p.clickable !== false).map((p) => `/project/${p.slug}`),
    ...roles.map((r) => `/experience/${r.slug}`),
  ];
}

export function buildSitemap(siteUrl: string): string {
  const urls = sitePaths()
    .map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const CRAWLERS = ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit", "LinkedInBot", "*"];

export function buildRobots(siteUrl: string): string {
  const groups = CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n");
  return `${groups}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/lib/sitemap.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Vite plugin** — in `vite.config.ts`, change the import line `import { defineConfig } from "vite";` to `import { defineConfig, type Plugin } from "vite";`, add after the existing imports:

```ts
import { SITE_URL } from "./src/lib/profile";
import { buildRobots, buildSitemap } from "./src/lib/sitemap";

/** Fills %SITE_URL% in index.html and emits sitemap.xml + robots.txt from the site data. */
const siteFiles = (): Plugin => ({
  name: "site-files",
  transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", SITE_URL),
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "sitemap.xml", source: buildSitemap(SITE_URL) });
    this.emitFile({ type: "asset", fileName: "robots.txt", source: buildRobots(SITE_URL) });
  },
});
```

and change the plugins line to:

```ts
  plugins: [react(), siteFiles(), mode === "development" && componentTagger()].filter(Boolean),
```

- [ ] **Step 6: Delete the static robots file**

Run: `git rm public/robots.txt`

- [ ] **Step 7: index.html head** — replace everything from the `<title>` line through the `twitter:card` meta (inclusive) with:

```html
    <title>Muhammad Puntodewo Fadhillah — Backend & Integration Engineer</title>
    <meta name="description" content="Backend & integration engineer (.NET, Go, SQL Server) building the APIs and background services that move data between SAP, HR platforms, payment gateways and banks." />
    <meta name="author" content="Muhammad Puntodewo Fadhillah" />
    <link rel="canonical" href="%SITE_URL%/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Muhammad Puntodewo Fadhillah" />
    <meta property="og:title" content="Muhammad Puntodewo Fadhillah — Backend & Integration Engineer" />
    <meta property="og:description" content="I design the APIs and background services that move data between enterprise systems. Available for contract & part-time work (~20 h/week) and open to full-time roles." />
    <meta property="og:url" content="%SITE_URL%/" />
    <meta property="og:image" content="%SITE_URL%/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Muhammad Puntodewo Fadhillah — Backend & Integration Engineer" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Muhammad Puntodewo Fadhillah — Backend & Integration Engineer" />
    <meta name="twitter:description" content="I design the APIs and background services that move data between enterprise systems. Available for contract & part-time work (~20 h/week) and open to full-time roles." />
    <meta name="twitter:image" content="%SITE_URL%/og-image.png" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Muhammad Puntodewo Fadhillah",
        "jobTitle": "Backend & Integration Engineer",
        "url": "%SITE_URL%/",
        "email": "mailto:puntodewofadhillah@gmail.com",
        "address": { "@type": "PostalAddress", "addressLocality": "Jakarta", "addressCountry": "ID" },
        "sameAs": ["https://www.linkedin.com/in/muhammad-puntodewo-fadhillah-347169160/", "https://github.com/mpuntodewof"],
        "knowsAbout": [".NET Core", "C#", "Go", "gRPC", "SQL Server", "SAP integration", "REST APIs", "Background services"]
      }
    </script>
```

Keep the existing font links, favicon and the Cloudflare Web Analytics script unchanged.

- [ ] **Step 8: Build and inspect**

Run: `npm run build`, then `node -e "const f=require('fs');const h=f.readFileSync('dist/index.html','utf8');console.log(h.includes('%SITE_URL%'),h.includes('og-image.png'));console.log(f.readFileSync('dist/robots.txt','utf8').split('\n').pop()||f.readFileSync('dist/robots.txt','utf8').trim().split('\n').pop());console.log(f.readFileSync('dist/sitemap.xml','utf8').split('<url>').length-1)"`
Expected: `false true`, the `Sitemap: https://redesign-system-blueprint.puntodewofadhillah.workers.dev/sitemap.xml` line, and `11` (1 home + 6 clickable projects + 4 roles).

- [ ] **Step 9: Commit**

```bash
git add src/lib/sitemap.ts src/lib/sitemap.test.ts vite.config.ts index.html public/robots.txt
git commit -m "feat: sitemap, robots and full preview tags from one site URL" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: In-app document titles

**Files:**
- Create: `src/hooks/useDocumentMeta.ts`, `src/hooks/useDocumentMeta.test.ts`
- Modify: `src/pages/ProjectDetail.tsx`, `src/pages/ExperienceDetail.tsx`

- [ ] **Step 1: Write the failing test** — `src/hooks/useDocumentMeta.test.ts`

```ts
import { renderHook } from "@testing-library/react";
import { defaultMeta } from "@/lib/pageMeta";
import { useDocumentMeta } from "./useDocumentMeta";

describe("useDocumentMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="start" />';
    document.title = "start";
  });

  it("applies a page's title and description and restores the defaults on unmount", () => {
    const { unmount } = renderHook(() => useDocumentMeta({ title: "Case", description: "Desc", url: "https://x/p" }));
    expect(document.title).toBe("Case");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Desc");
    unmount();
    expect(document.title).toBe(defaultMeta.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(defaultMeta.description);
  });

  it("uses the defaults when the page has no meta", () => {
    renderHook(() => useDocumentMeta(null));
    expect(document.title).toBe(defaultMeta.title);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/hooks/useDocumentMeta.test.ts`
Expected: FAIL — cannot resolve `./useDocumentMeta`.

- [ ] **Step 3: Implement** — `src/hooks/useDocumentMeta.ts`

```ts
import { useEffect } from "react";
import { defaultMeta, type PageMeta } from "@/lib/pageMeta";

function apply({ title, description }: PageMeta) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
}

/** Keeps the tab title and description in step with client-side navigation. */
export function useDocumentMeta(meta: PageMeta | null) {
  const title = meta?.title;
  const description = meta?.description;
  useEffect(() => {
    apply(meta ?? defaultMeta);
    return () => apply(defaultMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- title/description identify the meta
  }, [title, description]);
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/hooks/useDocumentMeta.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Use it in the detail pages**

In `src/pages/ProjectDetail.tsx` add imports

```ts
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { metaForPath } from "@/lib/pageMeta";
```

and directly after the existing `useScrollStage(slug);` line add

```ts
  useDocumentMeta(metaForPath(`/project/${slug ?? ""}`));
```

In `src/pages/ExperienceDetail.tsx` add the same two imports and after its `useScrollStage(slug);` line add

```ts
  useDocumentMeta(metaForPath(`/experience/${slug ?? ""}`));
```

- [ ] **Step 6: Run the page tests**

Run: `npx vitest run src/pages`
Expected: PASS (all existing ProjectDetail/ExperienceDetail/Index tests).

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useDocumentMeta.ts src/hooks/useDocumentMeta.test.ts src/pages/ProjectDetail.tsx src/pages/ExperienceDetail.tsx
git commit -m "feat: per-page document titles on case-study and experience pages" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Link-preview image

**Files:**
- Create: `scripts/og-template.html`, `scripts/og-image.mjs`, `public/og-image.png`
- Modify: `package.json` (devDependency + script)

- [ ] **Step 1: Install the screenshot driver**

Run: `npm install -D playwright-core@1.48.2`
Expected: `package.json` gains `"playwright-core": "^1.48.2"` in devDependencies. (It drives the locally installed Chrome; no browser download.)

- [ ] **Step 2: Template** — `scripts/og-template.html`

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@500;600;700&family=Geist+Mono:wght@500&display=swap" />
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #070b14; color: #e6edf7; font-family: Geist, system-ui, sans-serif; position: relative; }
  .glow { position: absolute; inset: 0; background: radial-gradient(700px 500px at 78% 45%, rgba(59,130,246,.18), transparent 60%), linear-gradient(180deg, #070b14, #0b1220); }
  canvas { position: absolute; right: 30px; top: 25px; }
  .copy { position: absolute; left: 72px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; }
  .tag { font: 500 18px "Geist Mono", monospace; color: #60a5fa; letter-spacing: .06em; }
  h1 { font-size: 76px; line-height: .98; letter-spacing: -.045em; font-weight: 700; margin: 22px 0 18px; }
  h1 span { background: linear-gradient(180deg, #e6edf7 -30%, #60a5fa 90%); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .role { font: 500 26px "Geist Mono", monospace; color: #b8c4d8; }
  .avail { margin-top: 34px; display: inline-flex; gap: 12px; align-items: center; font: 500 19px "Geist Mono", monospace; color: #e6edf7; padding: 12px 18px; border: 1px solid rgba(96,165,250,.35); border-radius: 999px; background: rgba(15,26,46,.7); width: fit-content; }
  .avail b { width: 10px; height: 10px; border-radius: 50%; background: #34d399; }
  .url { position: absolute; left: 72px; bottom: 44px; font: 500 17px "Geist Mono", monospace; color: #7d8ca8; }
</style>
</head>
<body>
  <div class="glow"></div>
  <canvas id="c" width="600" height="580"></canvas>
  <div class="copy">
    <p class="tag">// BACKEND &amp; INTEGRATION ENGINEER</p>
    <h1>Muhammad<br />Puntodewo<br /><span>Fadhillah</span></h1>
    <p class="role">&gt; .NET · Go · SQL Server · SAP</p>
    <p class="avail"><b></b>Contract &amp; part-time · open to full-time</p>
  </div>
  <p class="url">Jakarta · UTC+7 · remote-ready</p>
  <script>
    // A still frame of the site's particle sphere (fibonacci sphere + tilted ring).
    const c = document.getElementById("c"), g = c.getContext("2d");
    const cx = 300, cy = 290, R = 190, N = 2600, tiltX = 0.35, rotY = 0.6;
    let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
      pts.push([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R]);
    }
    for (let i = 0; i < 1100; i++) {
      const u = rnd() * Math.PI * 2, rr = R * 1.38 + (rnd() - 0.5) * 10;
      const x = Math.cos(u) * rr, z = Math.sin(u) * rr, tilt = 0.42;
      pts.push([x, -z * Math.sin(tilt), z * Math.cos(tilt)]);
    }
    for (const [x0, y0, z0] of pts) {
      const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY), z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);
      const y2 = y0 * Math.cos(tiltX) - z1 * Math.sin(tiltX), z2 = y0 * Math.sin(tiltX) + z1 * Math.cos(tiltX);
      const depth = (z2 + R * 1.4) / (R * 2.8);
      g.fillStyle = rnd() > 0.94 ? `rgba(230,240,255,${0.5 + depth * 0.5})` : `rgba(${rnd() > 0.5 ? "59,130,246" : "96,165,250"},${0.25 + depth * 0.65})`;
      const size = 0.8 + depth * 1.6;
      g.beginPath(); g.arc(cx + x1, cy + y2, size, 0, Math.PI * 2); g.fill();
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Script** — `scripts/og-image.mjs`

```js
// Renders scripts/og-template.html to public/og-image.png (1200×630).
// Usage: npm run og:image   (set CHROME_PATH if Chrome is not in the default Windows location)
import { chromium } from "playwright-core";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executablePath = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(root, "scripts/og-template.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, "public/og-image.png"), type: "png" });
await browser.close();
console.log("wrote public/og-image.png");
```

- [ ] **Step 4: npm script** — in `package.json` `"scripts"`, add after `"optimize:images"`:

```json
    "og:image": "node scripts/og-image.mjs",
```

- [ ] **Step 5: Generate and check**

Run: `npm run og:image`
Expected: `wrote public/og-image.png`; the file exists, is 1200×630 and under 300 KB (`node -e "console.log(require('fs').statSync('public/og-image.png').size)"`). Open the PNG and confirm: name readable on the left, sphere on the right, no clipped text.

- [ ] **Step 6: Commit**

```bash
git add scripts/og-template.html scripts/og-image.mjs public/og-image.png package.json package-lock.json
git commit -m "feat: 1200x630 link-preview image and generator" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Contact dialog context and Web3Forms delivery

**Files:**
- Create: `src/components/contact/ContactDialogContext.tsx`, `src/components/contact/intents.ts`, `src/lib/openUrl.ts`, `.env.example`
- Rewrite: `src/components/ContactFormDialog.tsx`
- Modify: `src/vite-env.d.ts`
- Test: `src/components/ContactFormDialog.test.tsx`

- [ ] **Step 1: Write the failing test** — `src/components/ContactFormDialog.test.tsx`

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { openUrl } from "@/lib/openUrl";
import ContactFormDialog from "./ContactFormDialog";

// jsdom forbids redefining window.location, so navigation goes through a mockable helper.
vi.mock("@/lib/openUrl", () => ({ openUrl: vi.fn() }));

const fill = () => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jane Doe" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "We need an SAP integration." } });
};
const send = () => fireEvent.click(screen.getByRole("button", { name: /send/i }));

describe("ContactFormDialog", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_WEB3FORMS_KEY", "test-key");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("titles itself after the intent and promises a realistic reply time", () => {
    render(<ContactFormDialog open intent="contract" onOpenChange={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Contract & part-time enquiry" })).toBeInTheDocument();
    expect(screen.getByText(/1–2 working days/)).toBeInTheDocument();
    expect(screen.queryByText(/24 hours/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$\s?\d/)).not.toBeInTheDocument();
  });

  it("posts the brief to Web3Forms with subject, interest and reply-to", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    render(<ContactFormDialog open intent="project" onOpenChange={() => {}} />);
    fill();
    send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.web3forms.com/submit");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      access_key: "test-key",
      subject: "[Portfolio] Project — Jane Doe",
      email: "jane@example.com",
      replyto: "jane@example.com",
      interest: "Project",
    });
    expect(await screen.findByText(/Thanks — message sent/)).toBeInTheDocument();
  });

  it("offers the email fallback when sending fails", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false, message: "nope" }), { status: 400 }));
    render(<ContactFormDialog open intent="full-time" onOpenChange={() => {}} />);
    fill();
    send();
    const fallback = await screen.findByRole("link", { name: "Send via email instead" });
    expect(fallback.getAttribute("href")).toMatch(/^mailto:puntodewofadhillah@gmail\.com\?subject=/);
  });

  it("drops submissions that fill the honeypot", async () => {
    const { container } = render(<ContactFormDialog open intent="project" onOpenChange={() => {}} />);
    fill();
    fireEvent.click(container.ownerDocument.querySelector('input[name="botcheck"]')!);
    send();
    expect(await screen.findByText(/Thanks — message sent/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the email app when no key is configured", async () => {
    vi.stubEnv("VITE_WEB3FORMS_KEY", "");
    render(<ContactFormDialog open intent="project" onOpenChange={() => {}} />);
    fill();
    send();
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith(expect.stringMatching(/^mailto:/)));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/components/ContactFormDialog.test.tsx`
Expected: FAIL — the dialog has no `intent` prop / title "Start a Project" / fields don't match.

- [ ] **Step 3: Navigation helper, env typing and example**

`src/lib/openUrl.ts`:

```ts
/** Full-page navigation (e.g. to a mailto: link). Separate so tests can mock it. */
export function openUrl(url: string) {
  window.location.href = url;
}
```


`src/vite-env.d.ts` becomes:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key; empty means the contact form falls back to mailto:. */
  readonly VITE_WEB3FORMS_KEY?: string;
}
```

`.env.example`:

```
# Web3Forms access key (https://web3forms.com). Copy to .env.local and fill in.
# Leave empty to keep the contact form on the mailto: fallback.
VITE_WEB3FORMS_KEY=
```

- [ ] **Step 4: Context** — `src/components/contact/ContactDialogContext.tsx`

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ContactFormDialog from "@/components/ContactFormDialog";
import type { ContactIntent } from "@/components/contact/intents";

interface ContactDialogApi {
  openContact: (intent?: ContactIntent) => void;
}

// The no-op default lets sections render on their own (e.g. in unit tests).
const ContactDialogContext = createContext<ContactDialogApi>({ openContact: () => {} });

/** Owns the single contact dialog so any section can open it with a preset intent. */
export const ContactDialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{ open: boolean; intent: ContactIntent }>({ open: false, intent: "project" });
  const openContact = useCallback((intent: ContactIntent = "project") => setState({ open: true, intent }), []);
  const api = useMemo(() => ({ openContact }), [openContact]);
  return (
    <ContactDialogContext.Provider value={api}>
      {children}
      <ContactFormDialog
        open={state.open}
        intent={state.intent}
        onOpenChange={(open) => setState((s) => ({ ...s, open }))}
      />
    </ContactDialogContext.Provider>
  );
};

export const useContactDialog = () => useContext(ContactDialogContext);
```

and `src/components/contact/intents.ts`:

```ts
export type ContactIntent = "full-time" | "contract" | "project";

export const INTENTS: { value: ContactIntent; label: string; title: string; placeholder: string }[] = [
  {
    value: "full-time",
    label: "Full-time role",
    title: "Full-time opportunity",
    placeholder: "The role, team, location or remote setup, and how to proceed.",
  },
  {
    value: "contract",
    label: "Contract & part-time",
    title: "Contract & part-time enquiry",
    placeholder: "What you need help with, expected hours per week and duration.",
  },
  {
    value: "project",
    label: "Project",
    title: "Start a project",
    placeholder: "What should be built or fixed — an integration, an API, a performance problem…",
  },
];

export const intentInfo = (value: ContactIntent) => INTENTS.find((i) => i.value === value) ?? INTENTS[2];
```

- [ ] **Step 5: Rewrite the dialog** — replace `src/components/ContactFormDialog.tsx` entirely with

```tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { INTENTS, intentInfo, type ContactIntent } from "@/components/contact/intents";
import { openUrl } from "@/lib/openUrl";
import { EMAIL, LINKEDIN_URL, REPLY_TIME } from "@/lib/profile";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

const contactSchema = z.object({
  intent: z.enum(["full-time", "contract", "project"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Please add a little more detail (at least 10 characters)"),
  /** Honeypot: hidden from people, ticked by bots. */
  botcheck: z.boolean().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const blank = (intent: ContactIntent): ContactFormValues => ({
  intent,
  name: "",
  email: "",
  timeline: "",
  budget: "",
  message: "",
  botcheck: false,
});

const subjectFor = (data: ContactFormValues) => `[Portfolio] ${intentInfo(data.intent).label} — ${data.name}`;

const bodyFor = (data: ContactFormValues) =>
  [
    `Interest: ${intentInfo(data.intent).label}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Timeline: ${data.timeline || "—"}`,
    `Budget / rate: ${data.budget || "—"}`,
    "",
    data.message,
  ].join("\n");

export const mailtoFor = (data: ContactFormValues) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subjectFor(data))}&body=${encodeURIComponent(bodyFor(data))}`;

interface ContactFormDialogProps {
  open: boolean;
  intent: ContactIntent;
  onOpenChange: (open: boolean) => void;
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; mailto: string };

const ContactFormDialog = ({ open, intent, onOpenChange }: ContactFormDialogProps) => {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const form = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), defaultValues: blank(intent) });
  const current = intentInfo(form.watch("intent") ?? intent);

  // Each opening starts fresh with the intent of the button that opened it.
  useEffect(() => {
    if (open) {
      form.reset(blank(intent));
      setStatus({ kind: "idle" });
    }
  }, [open, intent, form]);

  const onSubmit = async (data: ContactFormValues) => {
    if (data.botcheck) {
      setStatus({ kind: "sent" });
      return;
    }
    const key = import.meta.env.VITE_WEB3FORMS_KEY;
    if (!key) {
      openUrl(mailtoFor(data));
      onOpenChange(false);
      toast.success("Your email app should open with the message ready.", { description: EMAIL });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: subjectFor(data),
          from_name: "Portfolio contact form",
          name: data.name,
          email: data.email,
          replyto: data.email,
          interest: intentInfo(data.intent).label,
          timeline: data.timeline || "—",
          budget: data.budget || "—",
          message: data.message,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error(`Web3Forms ${response.status}`);
      setStatus({ kind: "sent" });
      toast.success("Message sent", { description: `I reply within ${REPLY_TIME}.` });
    } catch {
      setStatus({ kind: "error", mailto: mailtoFor(data) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto border-border sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">{current.title}</DialogTitle>
          <DialogDescription>I reply within {REPLY_TIME}.</DialogDescription>
        </DialogHeader>

        {status.kind === "sent" ? (
          <div className="space-y-4 py-2">
            <p className="text-lg font-semibold text-foreground">Thanks — message sent.</p>
            <p>It's in my inbox now; expect a reply within {REPLY_TIME}.</p>
            <button type="button" className="btn" onClick={() => onOpenChange(false)}>
              Close
            </button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="intent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I'm interested in</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTENTS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@company.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. start next month, 3 months" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget or rate range (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="any currency, or leave blank" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder={current.placeholder} className="min-h-[110px] resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Honeypot (Web3Forms convention): invisible to people and screen readers. */}
              <input
                type="checkbox"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
                {...form.register("botcheck")}
              />

              {status.kind === "error" && (
                <p role="alert" className="rounded border border-destructive/50 px-3 py-2 text-sm">
                  The message couldn't be sent right now.{" "}
                  <a className="font-medium text-foreground underline" href={status.mailto}>
                    Send via email instead
                  </a>
                </p>
              )}

              <div className="flex flex-col gap-3 pt-1">
                <button type="submit" className="btn btn-primary w-full justify-center" disabled={status.kind === "sending"}>
                  {status.kind === "sending" ? "Sending…" : "Send message →"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Or reach out directly via{" "}
                  <a href="https://wa.me/6282219158765" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                    WhatsApp
                  </a>{" "}
                  or{" "}
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                    LinkedIn
                  </a>
                </p>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
```

- [ ] **Step 6: Run the test**

Run: `npx vitest run src/components/ContactFormDialog.test.tsx`
Expected: PASS (5 tests). If the label queries fail because shadcn's `FormLabel` is not associated, check `FormControl` wraps the input directly (it sets `id`/`aria-*`); do not change the test to use placeholders.

- [ ] **Step 7: Commit**

```bash
git add src/lib/openUrl.ts src/components/contact src/components/ContactFormDialog.tsx src/components/ContactFormDialog.test.tsx src/vite-env.d.ts .env.example
git commit -m "feat: contact form sends via Web3Forms with intent, fallback and honeypot" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: "Work with me" section with deep-linked cards

**Files:**
- Create: `src/hooks/useHashTarget.ts`, `src/hooks/useHashTarget.test.ts`, `src/components/WorkWithMe.tsx`, `src/components/WorkWithMe.test.tsx`
- Modify: `src/index.css`
- Delete: `src/components/Services.tsx`, `src/components/Services.test.tsx`

- [ ] **Step 1: Write the failing hook test** — `src/hooks/useHashTarget.test.ts`

```ts
import { act, renderHook } from "@testing-library/react";
import { useHashTarget } from "./useHashTarget";

const IDS = ["work-full-time", "work-contract"] as const;

describe("useHashTarget", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    window.location.hash = "";
  });

  it("targets a known id from the hash, then clears it", () => {
    window.location.hash = "#work-contract";
    const { result } = renderHook(() => useHashTarget(IDS, 1000));
    expect(result.current).toBe("work-contract");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBeNull();
  });

  it("follows hash changes and ignores unknown ids", () => {
    const { result } = renderHook(() => useHashTarget(IDS, 1000));
    expect(result.current).toBeNull();
    act(() => {
      window.location.hash = "#somewhere";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBeNull();
    act(() => {
      window.location.hash = "#work-full-time";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBe("work-full-time");
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/hooks/useHashTarget.test.ts`
Expected: FAIL — cannot resolve `./useHashTarget`.

- [ ] **Step 3: Implement the hook** — `src/hooks/useHashTarget.ts`

```ts
import { useEffect, useState } from "react";

/**
 * Returns the id from the URL hash while it should be highlighted (for `durationMs`),
 * but only when it is one of `ids`. Used for shared links like /#work-contract.
 */
export function useHashTarget(ids: readonly string[], durationMs = 2400): string | null {
  const [target, setTarget] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const known = key.split("|");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!known.includes(id)) return;
      setTarget(id);
      clearTimeout(timer);
      timer = setTimeout(() => setTarget(null), durationMs);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => {
      window.removeEventListener("hashchange", check);
      clearTimeout(timer);
    };
  }, [key, durationMs]);

  return target;
}
```

- [ ] **Step 4: Run the hook test**

Run: `npx vitest run src/hooks/useHashTarget.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing section test** — `src/components/WorkWithMe.test.tsx`

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ContactDialogProvider } from "@/components/contact/ContactDialogContext";
import { LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import WorkWithMe from "./WorkWithMe";

const renderSection = () =>
  render(
    <ContactDialogProvider>
      <WorkWithMe />
    </ContactDialogProvider>,
  );

describe("WorkWithMe", () => {
  it("offers three linkable engagement tracks", () => {
    const { container } = renderSection();
    expect(container.querySelector("section#work")).not.toBeNull();
    ["work-full-time", "work-contract", "work-project"].forEach((id) => {
      expect(container.querySelector(`article#${id}`)).not.toBeNull();
    });
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Full-time roles",
      "Contract & part-time",
      "Project work",
    ]);
  });

  it("states the facts recruiters check first", () => {
    renderSection();
    const fullTime = screen.getByRole("article", { name: "Full-time roles" });
    expect(within(fullTime).getByText("Fluent English")).toBeInTheDocument();
    expect(within(fullTime).getByText("1-month notice")).toBeInTheDocument();
    const cv = within(fullTime).getByRole("link", { name: "Download CV ↓" });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
    expect(within(fullTime).getByRole("link", { name: "LinkedIn ↗" })).toHaveAttribute("href", LINKEDIN_URL);
    const contract = screen.getByRole("article", { name: "Contract & part-time" });
    expect(within(contract).getByText(/~20 h\/week/)).toBeInTheDocument();
    expect(within(contract).getByText(/US-East afternoons, EU midday/)).toBeInTheDocument();
  });

  it("leads the project offerings with integration", () => {
    renderSection();
    const project = screen.getByRole("article", { name: "Project work" });
    const offerings = within(project).getByRole("list", { name: "Offerings" });
    expect(within(offerings).getAllByRole("listitem")[0]).toHaveTextContent("Enterprise System Integration");
  });

  it("publishes no pricing signal", () => {
    const { container } = renderSection();
    expect(container.textContent ?? "").not.toMatch(/\$\s?\d|\bper hour\b|\bhourly\b|\bday rate\b|\bpricing\b|\bget a quote\b/i);
  });

  it("opens the contact form with the track's intent", () => {
    renderSection();
    fireEvent.click(screen.getByRole("button", { name: "Ask about availability →" }));
    expect(screen.getByRole("dialog", { name: "Contract & part-time enquiry" })).toBeInTheDocument();
  });

  it("opens a project brief from the project card", () => {
    renderSection();
    fireEvent.click(screen.getByRole("button", { name: "Send a brief →" }));
    expect(screen.getByRole("dialog", { name: "Start a project" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to see it fail**

Run: `npx vitest run src/components/WorkWithMe.test.tsx`
Expected: FAIL — cannot resolve `./WorkWithMe`.

- [ ] **Step 7: Implement the section** — `src/components/WorkWithMe.tsx`

```tsx
import { type ReactNode } from "react";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { useContactDialog } from "@/components/contact/ContactDialogContext";
import { useHashTarget } from "@/hooks/useHashTarget";
import { LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import { cn } from "@/lib/utils";

const CARD_IDS = ["work-full-time", "work-contract", "work-project"] as const;

// Integration leads: it is the least commoditised offering.
const OFFERINGS = [
  "Enterprise System Integration",
  "Backend & API Development",
  "Legacy Modernisation & Performance",
  "Workflow & Approval Automation",
];

const STEPS = ["Send a brief", "20-min call", "Written scope, timeline & quote", "Build with weekly demos"];

const Facts = ({ items }: { items: string[] }) => (
  <ul className="mt-4 space-y-2 text-[14px]">
    {items.map((item) => (
      <li key={item} className="flex gap-2.5">
        <span className="text-primary" aria-hidden="true">
          →
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

interface TrackProps {
  id: (typeof CARD_IDS)[number];
  index: string;
  title: string;
  summary: string;
  targeted: boolean;
  children: ReactNode;
  actions: ReactNode;
}

const Track = ({ id, index, title, summary, targeted, children, actions }: TrackProps) => (
  <HudCard
    as="article"
    glow
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn("flex h-full scroll-mt-24 flex-col p-6", targeted && "is-targeted")}
  >
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">{index}</p>
    <h3 id={`${id}-title`} className="mt-2 text-[19px] font-semibold tracking-[-0.02em] text-foreground">
      {title}
    </h3>
    <p className="mt-1.5 text-[14.5px]">{summary}</p>
    {children}
    <div className="mt-auto flex flex-wrap gap-2.5 pt-6">{actions}</div>
  </HudCard>
);

const WorkWithMe = () => {
  const target = useHashTarget(CARD_IDS);
  const { openContact } = useContactDialog();

  return (
    <section id="work" data-stage="3" data-stage-x="0.5" data-stage-dim="0.35" className="mb-28 scroll-mt-20">
      <Reveal>
        <SectionHeading index="04" title="Work with me" meta="3 ways to engage" />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="h-full">
          <Track
            id="work-full-time"
            index="01 · Full-time"
            title="Full-time roles"
            summary="Backend & integration roles, remote or Jakarta-based."
            targeted={target === "work-full-time"}
            actions={
              <>
                <a className="btn btn-primary" href={RESUME_URL} download={RESUME_FILENAME}>
                  Download CV ↓
                </a>
                <a className="btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </>
            }
          >
            <Facts items={["Jakarta · UTC+7 · remote-ready", "Fluent English", "1-month notice"]} />
          </Track>
        </Reveal>

        <Reveal className="h-full">
          <Track
            id="work-contract"
            index="02 · Contract"
            title="Contract & part-time"
            summary="Ongoing backend or integration work, ~20 h/week."
            targeted={target === "work-contract"}
            actions={
              <button type="button" className="btn btn-primary" onClick={() => openContact("contract")}>
                Ask about availability →
              </button>
            }
          >
            <Facts
              items={[
                "Async-first, with a written weekly update",
                "Live overlap: US-East afternoons, EU midday",
                "Flexible payment and contract setup",
              ]}
            />
          </Track>
        </Reveal>

        <Reveal className="h-full">
          <Track
            id="work-project"
            index="03 · Project"
            title="Project work"
            summary="Fixed-scope integrations, APIs and performance audits."
            targeted={target === "work-project"}
            actions={
              <button type="button" className="btn btn-primary" onClick={() => openContact("project")}>
                Send a brief →
              </button>
            }
          >
            <ul aria-label="Offerings" className="mt-4 flex flex-wrap gap-1.5">
              {OFFERINGS.map((offering) => (
                <li key={offering} className="chip">
                  {offering}
                </li>
              ))}
            </ul>
            <p className="mono-label mt-5">How it works</p>
            <ol className="mt-2 space-y-1.5 text-[14px]">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-2.5">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Track>
        </Reveal>
      </div>
    </section>
  );
};

export default WorkWithMe;
```

- [ ] **Step 8: Highlight style** — in `src/index.css`, inside `@layer components` directly after the `.glowcard:hover .spot { … }` rule, add

```css
  /* A card opened from a shared deep link (e.g. /#work-contract) pulses once. */
  .is-targeted {
    border-color: hsl(var(--primary));
    animation: target-pulse 2.4s ease-out;
  }
```

after the `@keyframes drip { … }` block add

```css
@keyframes target-pulse {
  0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.55); }
  40% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0.18), 0 0 32px hsl(var(--primary) / 0.35); }
  100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
}
```

and add `.is-targeted,` to the selector list inside `@media (prefers-reduced-motion: reduce)` that sets `animation: none;` (the list that starts with `.caret,`).

- [ ] **Step 9: Remove the old section**

Run: `git rm src/components/Services.tsx src/components/Services.test.tsx`

- [ ] **Step 10: Run the section tests**

Run: `npx vitest run src/components/WorkWithMe.test.tsx src/hooks/useHashTarget.test.ts`
Expected: PASS (8 tests). `src/pages/Index.tsx` still imports Services and will fail to compile until Task 8 — do not run the full suite yet.

- [ ] **Step 11: Commit**

```bash
git add src/hooks/useHashTarget.ts src/hooks/useHashTarget.test.ts src/components/WorkWithMe.tsx src/components/WorkWithMe.test.tsx src/index.css
git commit -m "feat: work-with-me section with three deep-linked engagement tracks" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Hero, Contact, Navbar and page wiring

**Files:**
- Modify: `src/components/Hero.tsx`, `src/components/Hero.test.tsx`, `src/components/Contact.tsx`, `src/components/Contact.test.tsx`, `src/components/Navbar.tsx`, `src/components/Navbar.test.tsx`, `src/pages/Index.tsx`, `src/pages/Index.test.tsx`

- [ ] **Step 1: Update the tests first**

`src/components/Hero.test.tsx` — replace the `"offers experience, CV download and GitHub"` test with:

```tsx
  it("leads with availability and the work-with-me call to action", () => {
    render(<Hero />);
    expect(screen.getByText(AVAILABILITY)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Work with me →" })).toHaveAttribute("href", "#work");
    const cv = screen.getByRole("link", { name: "Download CV ↓" });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
    expect(screen.getByRole("link", { name: "GitHub ↗" })).toHaveAttribute("href", "https://github.com/mpuntodewof");
    expect(screen.getByText(/systems running 24\/7 in production/)).toBeInTheDocument();
  });
```

and change its profile import to `import { AVAILABILITY, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";`.

`src/components/Contact.test.tsx` — add inside `describe("Contact", …)`:

```tsx
  it("states the reply time and opens a project brief", () => {
    render(
      <ContactDialogProvider>
        <Contact />
      </ContactDialogProvider>,
    );
    expect(screen.getByText(/"1–2 working days"/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "a project brief" }));
    expect(screen.getByRole("dialog", { name: "Start a project" })).toBeInTheDocument();
  });
```

with imports `import { fireEvent, render, screen } from "@testing-library/react";` and `import { ContactDialogProvider } from "@/components/contact/ContactDialogContext";`.

`src/components/Navbar.test.tsx` — in `"links to every homepage section"` change the expected hrefs to `["#experience", "#projects", "#stack", "#work", "#contact"]`.

`src/pages/Index.test.tsx` — expected section ids become `["experience", "projects", "stack", "work", "contact"]`; rename the second test to `"offers the CV download in exactly four places"` and expect `toHaveLength(4)`.

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/components/Hero.test.tsx src/components/Contact.test.tsx src/components/Navbar.test.tsx src/pages/Index.test.tsx`
Expected: FAIL (old hero copy, no reply line, "#contract" link, Services still imported).

- [ ] **Step 3: Hero** — in `src/components/Hero.tsx`:

- change the profile import to `import { AVAILABILITY, FULL_NAME, GITHUB_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";`
- replace the status paragraph (the `<p>` containing `status-dot`, "Available" and "/ open to remote roles · Jakarta UTC+7") with

```tsx
        <p className="flex flex-wrap items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.04em] text-primary">
          <span className="status-dot" aria-hidden="true" />
          {AVAILABILITY}
        </p>
```

- directly after the lede paragraph (`…The data has to arrive correctly every time.</p>`) add

```tsx
        <p className="mt-4 font-mono text-[12.5px] text-muted-foreground">
          7+ years · banking, transport, pharma · systems running 24/7 in production
        </p>
```

- change the primary button from `<a className="btn btn-primary" href="#experience">View experience →</a>` to

```tsx
          <a className="btn btn-primary" href="#work">
            Work with me →
          </a>
```

- [ ] **Step 4: Contact** — in `src/components/Contact.tsx`:

- add imports `import { useContactDialog } from "@/components/contact/ContactDialogContext";` and add `REPLY_TIME` to the `@/lib/profile` import.
- turn `const Contact = () => (` into a function body: `const Contact = () => {` + `const { openContact } = useContactDialog();` + `return (` … `);` + `};`
- insert as the first terminal line (before `contact --email`):

```tsx
          <TerminalLine command="reply --within">
            <span className="text-foreground">"{REPLY_TIME}"</span>
          </TerminalLine>
```

- insert before the `download` line:

```tsx
          <TerminalLine command="send">
            <button type="button" className={linkClass} onClick={() => openContact("project")}>
              a project brief
            </button>
          </TerminalLine>
```

- [ ] **Step 5: Navbar** — in `src/components/Navbar.tsx` replace `{ label: "Contract", href: "#contract" },` with `{ label: "Work with me", href: "#work" },`.

- [ ] **Step 6: Index** — in `src/pages/Index.tsx`:

- replace `import Services from "@/components/Services";` with `import WorkWithMe from "@/components/WorkWithMe";` and add `import { ContactDialogProvider } from "@/components/contact/ContactDialogContext";`
- replace `<Services />` with `<WorkWithMe />`
- wrap the returned fragment's children in `<ContactDialogProvider>` … `</ContactDialogProvider>` (replace the outer `<>`/`</>` with the provider).

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run`
Expected: all files pass (≈ 30 files). Then `npx tsc -p tsconfig.app.json --noEmit` → no output.

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.tsx src/components/Hero.test.tsx src/components/Contact.tsx src/components/Contact.test.tsx src/components/Navbar.tsx src/components/Navbar.test.tsx src/pages/Index.tsx src/pages/Index.test.tsx
git commit -m "feat: availability-led hero, reply time and wiring for work-with-me" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Verification

- [ ] **Step 1: Quality gates**

Run, in order:
- `npx vitest run` → all pass; record file/test counts.
- `npx tsc -p tsconfig.app.json --noEmit` → clean.
- `npm run lint` → exactly the 3 pre-existing errors; any new warning must be `react-refresh/only-export-components` on `ContactDialogContext.tsx` only.
- `npm run build` → succeeds; `dist/sitemap.xml`, `dist/robots.txt`, `dist/og-image.png` exist; `dist/index.html` has no `%SITE_URL%`.
- `npx wrangler deploy --dry-run --outdir .wrangler/dry` → bundles without errors.

- [ ] **Step 2: Browser check** (production build via `npx vite preview --port 4173`, headless Chrome at 1440×900 and 375×812)
- `/#work-contract` scrolls to the Contract card and it shows the highlight border.
- "Ask about availability →" opens "Contract & part-time enquiry"; without `VITE_WEB3FORMS_KEY` submitting tries `mailto:`.
- No horizontal overflow at 375 px; the three cards stack below 768 px.
- No console errors other than the localhost Cloudflare analytics CORS message.

- [ ] **Step 3: Hand-off notes for the owner** (in the final message, not in code)
- Create the Web3Forms key → `.env.local` (`VITE_WEB3FORMS_KEY=…`) and Cloudflare → Workers & Pages → redesign-system-blueprint → Settings → Build → Variables (build-time).
- After deploy: check `/` and `/project/talenta-sap-integration` with LinkedIn Post Inspector and opengraph.xyz; send one real form message.
- Later: custom domain → change `SITE_URL` in `src/lib/profile.ts`, regenerate the OG image only if its text changes.
