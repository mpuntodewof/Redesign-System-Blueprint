# Systems Blueprint Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage into the employer-first "Systems Blueprint" design (Navy & Azure palette, animated integration console, CV-aligned stack, all eight projects, downloadable CV), and restyle the case-study pages to match.

**Architecture:** Design tokens live in `src/index.css` (shadcn-style HSL variables, light in `:root`, dark in `.dark`) and are exposed to Tailwind in `tailwind.config.ts`. Shared blueprint primitives (`HudCard`, `SectionHeading`, `Reveal`) and two hooks (`usePrefersReducedMotion`, `useTypewriter`) are built first. Each homepage section is then rewritten as a focused component that reads static data (`src/data/*.ts`, `src/lib/profile.ts`). Legacy utility class names (`glass`, `gradient-text`, `glow`, `gradient-border`) are kept but restyled, so the case-study pages and dialogs pick up the new look without structural edits.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3 + shadcn/ui, framer-motion 12, next-themes, react-router-dom 6, Vitest 3 + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-25-systems-blueprint-redesign-design.md`
**Visual reference:** `docs/superpowers/specs/assets/2026-10-25-systems-blueprint-mockup.html` (open it in a browser; ignore its floating palette switcher)

---

## Working environment

- Work in the worktree `P:\Projects\Playground\Web Profile Porto\redesign-systems-blueprint`, branch `redesign/systems-blueprint`. The branch has **no upstream on purpose**. Do not push.
- Run all commands from the worktree root with Git Bash.
- Dependencies are already installed (`npm ci`). If `node_modules` is missing, run `npm ci --no-audit --no-fund`.
- **Baseline (verified 2026-10-25):** `npx vitest run` passes 7 files / 45 tests. `npm run build` succeeds. `npm run lint` reports **3 errors and 7 warnings, all pre-existing** (`src/components/ui/command.tsx`, `src/components/ui/textarea.tsx`, `tailwind.config.ts:96`). The rule is **no new lint errors**. Do not fix the pre-existing ones.
- Commit after every task. End every commit message with the trailer line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The commands below pass it as a second `-m`.
- `core.autocrlf=true` is set. Git's LF→CRLF warnings on `git add` are expected.

## File map

| File | Status | Responsibility |
|---|---|---|
| `public/Muhammad-Puntodewo-Fadhillah-CV.pdf` | create | the downloadable CV |
| `src/lib/profile.ts` | create | name, email, social URLs, résumé URL/filename (spec's `resume.ts` constants live here) |
| `src/index.css` | rewrite | tokens, fonts, blueprint component classes, keyframes, legacy utility remap |
| `tailwind.config.ts` | modify | Geist fonts, extra colour tokens |
| `index.html` | modify | title/meta, remove unused portrait preload |
| `src/hooks/usePrefersReducedMotion.ts` | create | live `prefers-reduced-motion` flag |
| `src/hooks/useTypewriter.ts` | create | cycling typed text |
| `src/test/reducedMotion.ts` | create | test helper that mocks `matchMedia` |
| `src/components/blueprint/HudCard.tsx` | create | bracketed panel with optional cursor glow |
| `src/components/blueprint/SectionHeading.tsx` | create | `// 01 Title ──── meta` heading |
| `src/components/blueprint/Reveal.tsx` | create | scroll reveal that respects reduced motion |
| `src/data/skills.ts` | create | the CV's 5 categories / 35 skills |
| `src/components/TechStack.tsx` | rewrite | stack section |
| `src/data/projects.ts` | modify | add `org`, `group`, `featured`, `highlight`; drop `headerGradient` |
| `src/pages/ProjectDetail.tsx` | modify | palette colours instead of per-project gradients, no orbs |
| `src/components/Projects.tsx` | rewrite | featured + professional + personal |
| `src/components/Experience.tsx` | rewrite | pipeline timeline + details dialog |
| `src/components/IntegrationConsole.tsx` | create | animated SVG diagram + event log |
| `src/components/Hero.tsx` | rewrite | identity, typed role, CTAs, console |
| `src/components/KpiStrip.tsx` | create | four static figures |
| `src/components/ThemeToggle.tsx` | rewrite | compact toggle used by the navbar |
| `src/components/Navbar.tsx` | rewrite | brand, links, toggle, résumé, scroll progress |
| `src/components/Services.tsx` | rewrite | contract panel + `ContactFormDialog` |
| `src/components/Contact.tsx` | create | terminal contact block |
| `src/components/Footer.tsx` | rewrite | mono footer |
| `src/pages/Index.tsx` | modify | new composition + grid backdrop |
| `src/App.tsx` | modify | `MotionConfig reducedMotion="user"` |
| `src/components/{TrustMetrics,WorkProcess,About,FinalCTA}.tsx` | delete | replaced or removed |

---

### Task 1: Profile constants and the CV file

**Files:**
- Create: `src/lib/profile.ts`
- Create: `public/Muhammad-Puntodewo-Fadhillah-CV.pdf`
- Test: `src/lib/profile.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/profile.test.ts`:

```ts
import { existsSync } from "node:fs";
import path from "node:path";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "./profile";

describe("profile", () => {
  it("serves the CV from the site root under the owner's name", () => {
    expect(RESUME_FILENAME).toBe("Muhammad-Puntodewo-Fadhillah-CV.pdf");
    expect(RESUME_URL).toBe("/Muhammad-Puntodewo-Fadhillah-CV.pdf");
  });

  it("ships the CV file in public/", () => {
    expect(existsSync(path.resolve(process.cwd(), "public", RESUME_FILENAME))).toBe(true);
  });

  it("exposes the contact channels used across the page", () => {
    expect(EMAIL).toBe("puntodewofadhillah@gmail.com");
    expect(GITHUB_URL).toBe("https://github.com/mpuntodewof");
    expect(LINKEDIN_URL).toBe("https://www.linkedin.com/in/muhammad-puntodewo-fadhillah-347169160/");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/profile.test.ts`
Expected: FAIL, with "Failed to resolve import "./profile"".

- [ ] **Step 3: Implement**

`src/lib/profile.ts`:

```ts
export const FULL_NAME = "Muhammad Puntodewo Fadhillah";
export const EMAIL = "puntodewofadhillah@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/muhammad-puntodewo-fadhillah-347169160/";
export const GITHUB_URL = "https://github.com/mpuntodewof";

/** The CV is served as a static file; update it by replacing the file in public/. */
export const RESUME_FILENAME = "Muhammad-Puntodewo-Fadhillah-CV.pdf";
export const RESUME_URL = `/${RESUME_FILENAME}`;
```

Copy the CV:

```bash
cp "P:/Archive/Docs/Puntodewo Docs/CV Puntodewo - 2026.10.25.pdf" public/Muhammad-Puntodewo-Fadhillah-CV.pdf
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/profile.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/profile.ts src/lib/profile.test.ts public/Muhammad-Puntodewo-Fadhillah-CV.pdf
git commit -m "feat: add profile constants and downloadable CV" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Design tokens, fonts, blueprint styles and page metadata

CSS has no unit tests. This task is verified by the build and by the existing suite still passing.

**Files:**
- Rewrite: `src/index.css`
- Modify: `tailwind.config.ts` (the `fontFamily` block and `colors`)
- Modify: `index.html` (lines 7–27)

- [ ] **Step 1: Replace `src/index.css` entirely**

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Palette: Navy & Azure. Light values in :root, dark in .dark (next-themes, attribute="class").
   All text pairs pass WCAG AA; see the design spec for the contrast table. */
@layer base {
  :root {
    --background: 220 43% 97%;
    --foreground: 218 65% 12%;
    --card: 0 0% 100%;
    --card-foreground: 218 65% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 218 65% 12%;
    --primary: 218 76% 47%;
    --primary-foreground: 0 0% 100%;
    --secondary: 216 45% 98%;
    --secondary-foreground: 217 22% 34%;
    --muted: 216 45% 98%;
    --muted-foreground: 218 15% 44%;
    --accent: 218 76% 47%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 219 33% 90%;
    --input: 217 31% 84%;
    --ring: 218 76% 47%;
    --radius: 0.375rem;

    --node: 216 45% 98%;
    --body: 217 22% 34%;
    --border-strong: 217 31% 84%;
    --impact: 34 100% 32%;
    --success: 142 72% 29%;
    --grid-line: 218 65% 12% / 0.055;

    --sidebar-background: 0 0% 100%;
    --sidebar-foreground: 218 65% 12%;
    --sidebar-primary: 218 76% 47%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 216 45% 98%;
    --sidebar-accent-foreground: 217 22% 34%;
    --sidebar-border: 219 33% 90%;
    --sidebar-ring: 218 76% 47%;
  }

  .dark {
    --background: 221 58% 6%;
    --foreground: 218 53% 94%;
    --card: 220 51% 10%;
    --card-foreground: 218 53% 94%;
    --popover: 220 51% 10%;
    --popover-foreground: 218 53% 94%;
    --primary: 211 100% 68%;
    --primary-foreground: 218 83% 9%;
    --secondary: 221 55% 12%;
    --secondary-foreground: 217 25% 69%;
    --muted: 221 55% 12%;
    --muted-foreground: 219 20% 57%;
    --accent: 211 100% 68%;
    --accent-foreground: 218 83% 9%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 221 47% 17%;
    --input: 221 45% 24%;
    --ring: 211 100% 68%;

    --node: 221 55% 12%;
    --body: 217 25% 69%;
    --border-strong: 221 45% 24%;
    --impact: 39 84% 68%;
    --success: 142 69% 58%;
    --grid-line: 211 100% 68% / 0.055;

    --sidebar-background: 220 51% 10%;
    --sidebar-foreground: 218 53% 94%;
    --sidebar-primary: 211 100% 68%;
    --sidebar-primary-foreground: 218 83% 9%;
    --sidebar-accent: 221 55% 12%;
    --sidebar-accent-foreground: 217 25% 69%;
    --sidebar-border: 221 47% 17%;
    --sidebar-ring: 211 100% 68%;
  }

  * {
    @apply border-border;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-background font-sans text-[15px] leading-relaxed text-body antialiased;
  }

  ::selection {
    background-color: hsl(var(--primary) / 0.3);
    color: hsl(var(--foreground));
  }
}

@layer components {
  /* Page backdrop: masked grid plus one soft horizon glow. */
  .grid-backdrop {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  }
  .grid-backdrop::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(hsl(var(--grid-line)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--grid-line)) 1px, transparent 1px);
    background-size: 44px 44px;
    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%);
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%);
  }
  .grid-backdrop::after {
    content: "";
    position: absolute;
    left: 50%;
    top: -30vh;
    width: 120vw;
    height: 60vh;
    transform: translateX(-50%);
    background: radial-gradient(ellipse at center, hsl(var(--primary) / 0.13), transparent 65%);
  }

  /* HUD panel with two corner brackets. */
  .hud {
    position: relative;
    background: hsl(var(--card) / 0.78);
    border: 1px solid hsl(var(--border));
    border-radius: 4px;
    backdrop-filter: blur(6px);
  }
  .hud::before,
  .hud::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    border: 1px solid hsl(var(--primary));
    opacity: 0.8;
    pointer-events: none;
  }
  .hud::before {
    top: -1px;
    left: -1px;
    border-right: 0;
    border-bottom: 0;
  }
  .hud::after {
    bottom: -1px;
    right: -1px;
    border-left: 0;
    border-top: 0;
  }

  /* Cursor-follow glow; HudCard writes --mx/--my on mouse move. */
  .glowcard {
    transition: border-color 0.2s;
  }
  .glowcard:hover {
    border-color: hsl(var(--primary) / 0.45);
  }
  .glowcard .spot {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
    background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.12), transparent 60%);
  }
  .glowcard:hover .spot {
    opacity: 1;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 2px 8px;
    border: 1px solid hsl(var(--border-strong));
    border-radius: 3px;
    font: 500 11.5px/1.6 "Geist Mono", ui-monospace, monospace;
    color: hsl(var(--body));
  }
  .chip-impact {
    color: hsl(var(--impact));
    border-color: hsl(var(--impact) / 0.4);
    background: hsl(var(--impact) / 0.08);
  }
  .chip-dim {
    color: hsl(var(--muted-foreground));
    border-style: dashed;
  }
  .chip-icon {
    padding: 4px 10px;
    font-size: 12px;
    color: hsl(var(--foreground));
  }

  .mono-label {
    font: 500 11px/1.4 "Geist Mono", ui-monospace, monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: hsl(var(--muted-foreground));
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: 1px solid hsl(var(--border-strong));
    border-radius: 6px;
    background: hsl(var(--card) / 0.78);
    color: hsl(var(--foreground));
    font-size: 14px;
    font-weight: 500;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .btn:hover {
    border-color: hsl(var(--primary) / 0.7);
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.08);
  }
  .btn:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
  .btn-primary {
    background: hsl(var(--primary));
    border-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    font-weight: 600;
  }
  .btn-primary:hover {
    box-shadow: 0 0 24px -4px hsl(var(--primary) / 0.7);
  }

  .text-gradient-brand {
    background: linear-gradient(90deg, hsl(var(--foreground)) 30%, hsl(var(--primary)));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .subhead {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 40px 0 16px;
  }
  .subhead::before {
    content: "";
    width: 6px;
    height: 6px;
    background: hsl(var(--primary));
    transform: rotate(45deg);
  }
  .subhead::after {
    content: "";
    flex: 1;
    height: 1px;
    background: hsl(var(--border));
  }

  .caret {
    display: inline-block;
    width: 8px;
    height: 1.05em;
    margin-left: 2px;
    vertical-align: -2px;
    background: hsl(var(--primary));
    animation: caret-blink 1s steps(1) infinite;
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: hsl(var(--success));
    animation: status-ping 2.2s infinite;
  }
  .scroll-progress {
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 100%;
    height: 1px;
    transform: scaleX(0);
    transform-origin: left;
    background: hsl(var(--primary));
    box-shadow: 0 0 8px hsl(var(--primary));
  }

  /* Experience pipeline: a vertical line, a travelling pulse, one node per job. */
  .pipe {
    position: relative;
    padding-left: 28px;
    overflow: hidden;
  }
  .pipe::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(hsl(var(--primary)), hsl(var(--primary) / 0.05));
  }
  .pipe-pulse {
    position: absolute;
    left: 2px;
    top: 0;
    width: 8px;
    height: 40px;
    border-radius: 4px;
    background: linear-gradient(transparent, hsl(var(--primary)), transparent);
    filter: blur(1px);
    animation: pipe-travel 5s linear infinite;
  }
  .pipe-node {
    position: absolute;
    left: -30px;
    top: 28px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: hsl(var(--background));
    border: 2px solid hsl(var(--primary));
    box-shadow: 0 0 12px hsl(var(--primary) / 0.6);
  }
  @media (min-width: 768px) {
    .pipe {
      padding-left: 44px;
    }
    .pipe::before {
      left: 11px;
    }
    .pipe-pulse {
      left: 8px;
    }
    .pipe-node {
      left: -40px;
    }
  }

  /* Integration console SVG. */
  .cx-box {
    fill: hsl(var(--node));
    stroke: hsl(var(--border-strong));
  }
  .cx-label {
    fill: hsl(var(--foreground));
    font: 500 11px "Geist Mono", ui-monospace, monospace;
  }
  .cx-cap {
    fill: hsl(var(--muted-foreground));
    font: 500 9.5px "Geist Mono", ui-monospace, monospace;
    letter-spacing: 0.08em;
  }
  .cx-wire {
    fill: none;
    stroke: hsl(var(--border-strong));
    stroke-width: 1.2;
  }
  .cx-wire-live {
    fill: none;
    stroke: hsl(var(--primary) / 0.35);
    stroke-width: 1.2;
    stroke-dasharray: 3 5;
    animation: wire-flow 1.6s linear infinite;
  }
  .cx-core {
    fill: hsl(var(--primary) / 0.08);
    stroke: hsl(var(--primary));
  }
  .cx-core-glow {
    fill: none;
    stroke: hsl(var(--primary));
    opacity: 0.35;
    transform-box: fill-box;
    transform-origin: center;
    animation: core-pulse 3s ease-in-out infinite;
  }
  .cx-core-title {
    fill: hsl(var(--primary));
    font: 600 11px "Geist Mono", ui-monospace, monospace;
  }
  .cx-core-sub {
    fill: hsl(var(--body));
    font: 400 9.5px "Geist Mono", ui-monospace, monospace;
  }
  .cx-pkt {
    fill: hsl(var(--primary));
    filter: drop-shadow(0 0 4px hsl(var(--primary)));
  }
}

@layer utilities {
  /* Legacy names still used by the case-study pages and dialogs, restyled to the blueprint look. */
  .glass {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
  }
  .gradient-text {
    color: hsl(var(--primary));
  }
  .gradient-border {
    box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.4);
  }
  .glow {
    box-shadow: 0 0 0 1px hsl(var(--primary) / 0.25);
  }
}

@keyframes status-ping {
  0% { box-shadow: 0 0 0 0 hsl(var(--success) / 0.55); }
  70% { box-shadow: 0 0 0 9px hsl(var(--success) / 0); }
  100% { box-shadow: 0 0 0 0 hsl(var(--success) / 0); }
}
@keyframes caret-blink {
  50% { opacity: 0; }
}
@keyframes wire-flow {
  to { stroke-dashoffset: -16; }
}
@keyframes core-pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.04); }
}
@keyframes pipe-travel {
  from { transform: translateY(0); }
  to { transform: translateY(1100px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .caret,
  .status-dot,
  .cx-wire-live,
  .cx-core-glow,
  .pipe-pulse {
    animation: none;
  }
}
```

- [ ] **Step 2: Update `tailwind.config.ts`**

Replace:

```ts
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
```

with:

```ts
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
        heading: ["Geist", "system-ui", "sans-serif"],
        body: ["Geist", "system-ui", "sans-serif"],
      },
```

Then, directly after the line `ring: "hsl(var(--ring))",`, insert:

```ts
        node: "hsl(var(--node))",
        body: "hsl(var(--body))",
        "border-strong": "hsl(var(--border-strong))",
        impact: "hsl(var(--impact))",
        success: "hsl(var(--success))",
```

- [ ] **Step 3: Update `index.html`**

Replace lines 7–27 (from `<title>` through the closing `/>` of the preload `<link>`) with:

```html
    <title>Muhammad Puntodewo Fadhillah — Backend & Integration Engineer</title>
    <meta name="description" content="Backend & integration engineer (.NET, Go, SQL Server) building the APIs and background services that move data between SAP, HR platforms, payment gateways and banks." />
    <meta name="author" content="Muhammad Puntodewo Fadhillah" />
    <meta property="og:title" content="Muhammad Puntodewo Fadhillah — Backend & Integration Engineer" />
    <meta property="og:description" content="I design the APIs and background services that move data between enterprise systems, and the data has to arrive correctly every time." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
```

This removes the HTML comment and the `profile-*.webp` preload. Leave the image files in `public/`.

- [ ] **Step 4: Verify**

Run: `npx vitest run`
Expected: PASS, 8 files / 48 tests (the 45 baseline tests plus Task 1).

Run: `npm run build`
Expected: `✓ built in …` with no CSS errors. Chunk-size warnings are pre-existing.

- [ ] **Step 5: Commit**

```bash
git add src/index.css tailwind.config.ts index.html
git commit -m "feat: add Navy & Azure tokens, Geist fonts and blueprint styles" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Reduced-motion and typewriter hooks

**Files:**
- Create: `src/test/reducedMotion.ts`
- Create: `src/hooks/usePrefersReducedMotion.ts`
- Create: `src/hooks/useTypewriter.ts`
- Test: `src/hooks/usePrefersReducedMotion.test.ts`, `src/hooks/useTypewriter.test.ts`

- [ ] **Step 1: Add the test helper**

`src/test/reducedMotion.ts`:

```ts
/**
 * Replaces window.matchMedia so `(prefers-reduced-motion: reduce)` matches or not.
 * Call mockReducedMotion(false) in afterEach to restore the setup.ts default.
 */
export function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 2: Write the failing tests**

`src/hooks/usePrefersReducedMotion.test.ts`:

```ts
import { renderHook } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
  afterEach(() => mockReducedMotion(false));

  it("is false when the user has not asked for reduced motion", () => {
    mockReducedMotion(false);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(false);
  });

  it("is true when the OS asks for reduced motion", () => {
    mockReducedMotion(true);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true);
  });
});
```

`src/hooks/useTypewriter.test.ts`:

```ts
import { act, renderHook } from "@testing-library/react";
import { useTypewriter } from "./useTypewriter";

const PHRASES = ["ab", "cd"] as const;
const TIMING = { hold: 100, erase: 10, type: 20 };

describe("useTypewriter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows the first phrase in full and never changes when disabled", () => {
    const { result } = renderHook(() => useTypewriter(PHRASES, false, TIMING));
    expect(result.current).toBe("ab");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe("ab");
  });

  it("holds, erases, then types the next phrase when enabled", () => {
    const { result } = renderHook(() => useTypewriter(PHRASES, true, TIMING));
    expect(result.current).toBe("ab");
    act(() => vi.advanceTimersByTime(100)); // hold ends, erasing starts
    expect(result.current).toBe("ab");
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe("");
    act(() => vi.advanceTimersByTime(20)); // switch to the next phrase
    expect(result.current).toBe("");
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe("c");
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe("cd");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/hooks`
Expected: FAIL, with "Failed to resolve import "./usePrefersReducedMotion"" and "./useTypewriter".

- [ ] **Step 4: Implement**

`src/hooks/usePrefersReducedMotion.ts`:

```ts
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Tracks the OS "reduce motion" setting and updates if the user changes it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

`src/hooks/useTypewriter.ts`:

```ts
import { useEffect, useState } from "react";

interface Timing {
  /** How long a fully typed phrase stays on screen. */
  hold: number;
  /** Delay per erased character. */
  erase: number;
  /** Delay per typed character (also the pause between phrases). */
  type: number;
}

const DEFAULT_TIMING: Timing = { hold: 2600, erase: 28, type: 55 };

/**
 * Cycles through phrases by erasing and retyping them. When disabled it returns
 * the first phrase in full and schedules nothing. `phrases` must be referentially stable.
 */
export function useTypewriter(
  phrases: readonly string[],
  enabled: boolean,
  timing: Timing = DEFAULT_TIMING,
): string {
  const [state, setState] = useState({ index: 0, length: phrases[0]?.length ?? 0, deleting: false });
  const { hold, erase, type } = timing;

  useEffect(() => {
    if (!enabled || phrases.length < 2) return;
    const current = phrases[state.index];
    let delay: number;
    let next: typeof state;

    if (!state.deleting && state.length === current.length) {
      delay = hold;
      next = { ...state, deleting: true };
    } else if (state.deleting && state.length === 0) {
      delay = type;
      next = { index: (state.index + 1) % phrases.length, length: 0, deleting: false };
    } else if (state.deleting) {
      delay = erase;
      next = { ...state, length: state.length - 1 };
    } else {
      delay = type;
      next = { ...state, length: state.length + 1 };
    }

    const id = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(id);
  }, [state, enabled, phrases, hold, erase, type]);

  if (!enabled) return phrases[0] ?? "";
  return phrases[state.index].slice(0, state.length);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/hooks`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/test/reducedMotion.ts src/hooks/usePrefersReducedMotion.ts src/hooks/usePrefersReducedMotion.test.ts src/hooks/useTypewriter.ts src/hooks/useTypewriter.test.ts
git commit -m "feat: add reduced-motion and typewriter hooks" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Blueprint primitives (HudCard, SectionHeading, Reveal)

**Files:**
- Create: `src/components/blueprint/HudCard.tsx`, `src/components/blueprint/SectionHeading.tsx`, `src/components/blueprint/Reveal.tsx`
- Test: `src/components/blueprint/blueprint.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/blueprint/blueprint.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import HudCard from "./HudCard";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

describe("HudCard", () => {
  it("renders a hud panel without the glow layer by default", () => {
    render(<HudCard data-testid="card">content</HudCard>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("hud");
    expect(card).not.toHaveClass("glowcard");
    expect(card.querySelector(".spot")).toBeNull();
  });

  it("tracks the cursor for the glow when glow is on", () => {
    render(<HudCard glow as="article" data-testid="card">content</HudCard>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("ARTICLE");
    expect(card).toHaveClass("glowcard");
    fireEvent.mouseMove(card, { clientX: 40, clientY: 12 });
    expect(card.style.getPropertyValue("--mx")).toBe("40px");
    expect(card.style.getPropertyValue("--my")).toBe("12px");
  });
});

describe("SectionHeading", () => {
  it("renders the index, an h2 title and the meta line", () => {
    render(<SectionHeading index="02" title="Projects" meta="8 projects" />);
    expect(screen.getByRole("heading", { level: 2, name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("// 02")).toBeInTheDocument();
    expect(screen.getByText("8 projects")).toBeInTheDocument();
  });
});

describe("Reveal", () => {
  afterEach(() => mockReducedMotion(false));

  it("renders children in a plain wrapper under reduced motion", () => {
    mockReducedMotion(true);
    render(<Reveal className="wrap">child</Reveal>);
    const wrapper = screen.getByText("child");
    expect(wrapper).toHaveClass("wrap");
    expect(wrapper.getAttribute("style")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/blueprint`
Expected: FAIL, with "Failed to resolve import "./HudCard"".

- [ ] **Step 3: Implement**

`src/components/blueprint/HudCard.tsx`:

```tsx
import { type HTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface HudCardProps extends HTMLAttributes<HTMLElement> {
  /** Adds the cursor-follow glow and hover border. */
  glow?: boolean;
  as?: "div" | "article";
}

const HudCard = ({ glow = false, as: Tag = "div", className, children, onMouseMove, ...rest }: HudCardProps) => {
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (glow) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    onMouseMove?.(event);
  };

  return (
    <Tag className={cn("hud", glow && "glowcard", className)} onMouseMove={handleMouseMove} {...rest}>
      {glow && <span className="spot" aria-hidden="true" />}
      {children}
    </Tag>
  );
};

export default HudCard;
```

`src/components/blueprint/SectionHeading.tsx`:

```tsx
interface SectionHeadingProps {
  index: string;
  title: string;
  meta?: string;
}

const SectionHeading = ({ index, title, meta }: SectionHeadingProps) => (
  <div className="mb-8 flex items-center gap-4">
    <span className="font-mono text-xs font-medium tracking-[0.08em] text-primary">{`// ${index}`}</span>
    <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
    <span className="h-px flex-1 bg-gradient-to-r from-border-strong to-transparent" aria-hidden="true" />
    {meta && <p className="mono-label hidden md:block">{meta}</p>}
  </div>
);

export default SectionHeading;
```

`src/components/blueprint/Reveal.tsx`:

```tsx
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Fades content up once when it scrolls into view; static under reduced motion. */
const Reveal = ({ children, className, delay = 0 }: RevealProps) => {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/blueprint`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/blueprint
git commit -m "feat: add HudCard, SectionHeading and Reveal primitives" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: CV-aligned skills data and the Tech Stack section

**Files:**
- Create: `src/data/skills.ts`
- Rewrite: `src/components/TechStack.tsx`
- Test: `src/data/skills.test.ts`, `src/components/TechStack.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/data/skills.test.ts`:

```ts
import { skillCategories } from "./skills";

// Copied word for word from the CV (2026-10-25), in CV order.
const CV_SKILLS: Record<string, string[]> = {
  Backend: [".NET Core", "C#", "ASP.NET", "gRPC", "RESTful APIs", "PHP", "Laravel", "Microservices", "API Gateway", "Clean Architecture", "Background Services", "Golang"],
  Frontend: ["React.js", "Bootstrap", "HTML", "CSS", "JavaScript", "Material UI"],
  Databases: ["SQL Server", "MySQL", "Relational Database Design", "Query Optimization"],
  "Tools & DevOps": ["Git", "GitHub", "GitLab", "Postman", "Jira", "Docker", "CI/CD", "Jenkins"],
  Other: ["Agile/Scrum", "SAP Integration", "API Documentation", "Claude Code", "Agentic AI"],
};

describe("skillCategories", () => {
  it("matches the CV's five categories in order", () => {
    expect(skillCategories.map((c) => c.title)).toEqual(Object.keys(CV_SKILLS));
  });

  it("lists exactly the CV's skills in each category", () => {
    for (const category of skillCategories) {
      expect(category.skills.map((s) => s.name)).toEqual(CV_SKILLS[category.title]);
    }
  });

  it("has 35 skills in total", () => {
    expect(skillCategories.flatMap((c) => c.skills)).toHaveLength(35);
  });

  it("loads every logo from the pinned devicon release", () => {
    for (const skill of skillCategories.flatMap((c) => c.skills)) {
      if (skill.icon.kind === "logo") {
        expect(skill.icon.src).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/gh\/devicons\/devicon@v2\.16\.0\/icons\//);
      }
    }
  });
});
```

`src/components/TechStack.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { skillCategories } from "@/data/skills";
import TechStack from "./TechStack";

describe("TechStack", () => {
  it("renders one h3 per category", () => {
    render(<TechStack />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Backend", "Frontend", "Databases", "Tools & DevOps", "Other"]);
  });

  it("renders every skill name", () => {
    render(<TechStack />);
    for (const skill of skillCategories.flatMap((c) => c.skills)) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
  });

  it("summarises the totals in the heading meta", () => {
    render(<TechStack />);
    expect(screen.getByText("5 domains · 35 skills")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/skills.test.ts src/components/TechStack.test.tsx`
Expected: FAIL. `skills.test.ts` can't resolve `./skills`, and `TechStack.test.tsx` fails on the heading titles.

- [ ] **Step 3: Implement the data**

`src/data/skills.ts`:

```ts
export type SkillIcon =
  | { kind: "logo"; src: string; invertInDark?: boolean; padInDark?: boolean }
  | { kind: "glyph"; glyph: string };

export interface Skill {
  name: string;
  icon: SkillIcon;
}

export interface SkillCategory {
  title: string;
  /** Spans two columns on wide screens. */
  wide?: boolean;
  skills: Skill[];
}

// Pinned release: @latest can change logos under a published page.
const devicon = (path: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${path}.svg`;
const logo = (path: string, options: { invertInDark?: boolean; padInDark?: boolean } = {}): SkillIcon => ({
  kind: "logo",
  src: devicon(path),
  ...options,
});
// Concepts have no real logo; a neutral glyph avoids borrowing another brand's mark.
const glyph = (value: string): SkillIcon => ({ kind: "glyph", glyph: value });

/** Mirrors the Skills section of the CV word for word. Update both together. */
export const skillCategories: SkillCategory[] = [
  {
    title: "Backend",
    wide: true,
    skills: [
      { name: ".NET Core", icon: logo("dotnetcore/dotnetcore-original") },
      { name: "C#", icon: logo("csharp/csharp-original") },
      { name: "ASP.NET", icon: logo("dot-net/dot-net-original") },
      { name: "gRPC", icon: logo("grpc/grpc-original", { padInDark: true }) },
      { name: "RESTful APIs", icon: glyph("{}") },
      { name: "PHP", icon: logo("php/php-original") },
      { name: "Laravel", icon: logo("laravel/laravel-original") },
      { name: "Microservices", icon: glyph("⬡") },
      { name: "API Gateway", icon: glyph("⇄") },
      { name: "Clean Architecture", icon: glyph("◎") },
      { name: "Background Services", icon: glyph("↻") },
      { name: "Golang", icon: logo("go/go-original") },
    ],
  },
  {
    title: "Frontend",
    skills: [
      { name: "React.js", icon: logo("react/react-original") },
      { name: "Bootstrap", icon: logo("bootstrap/bootstrap-original") },
      { name: "HTML", icon: logo("html5/html5-original") },
      { name: "CSS", icon: logo("css3/css3-original") },
      { name: "JavaScript", icon: logo("javascript/javascript-original") },
      { name: "Material UI", icon: logo("materialui/materialui-original") },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "SQL Server", icon: logo("microsoftsqlserver/microsoftsqlserver-original") },
      { name: "MySQL", icon: logo("mysql/mysql-original", { padInDark: true }) },
      { name: "Relational Database Design", icon: glyph("⊞") },
      { name: "Query Optimization", icon: glyph("⚡") },
    ],
  },
  {
    title: "Tools & DevOps",
    skills: [
      { name: "Git", icon: logo("git/git-original") },
      { name: "GitHub", icon: logo("github/github-original", { invertInDark: true }) },
      { name: "GitLab", icon: logo("gitlab/gitlab-original") },
      { name: "Postman", icon: logo("postman/postman-original") },
      { name: "Jira", icon: logo("jira/jira-original") },
      { name: "Docker", icon: logo("docker/docker-original") },
      { name: "CI/CD", icon: glyph("⟳") },
      { name: "Jenkins", icon: logo("jenkins/jenkins-original") },
    ],
  },
  {
    title: "Other",
    skills: [
      { name: "Agile/Scrum", icon: glyph("◷") },
      { name: "SAP Integration", icon: glyph("⇆") },
      { name: "API Documentation", icon: logo("swagger/swagger-original") },
      { name: "Claude Code", icon: glyph("✦") },
      { name: "Agentic AI", icon: glyph("◈") },
    ],
  },
];
```

- [ ] **Step 4: Rewrite `src/components/TechStack.tsx`**

```tsx
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { skillCategories, type Skill } from "@/data/skills";
import { cn } from "@/lib/utils";

const totalSkills = skillCategories.reduce((sum, category) => sum + category.skills.length, 0);

const SkillIcon = ({ skill }: { skill: Skill }) => {
  const { icon } = skill;
  if (icon.kind === "glyph") {
    return (
      <span aria-hidden="true" className="w-3.5 text-center text-xs text-primary">
        {icon.glyph}
      </span>
    );
  }
  return (
    <img
      src={icon.src}
      alt=""
      width={14}
      height={14}
      loading="lazy"
      className={cn(
        "h-3.5 w-3.5",
        icon.invertInDark && "dark:invert",
        icon.padInDark && "dark:rounded-[3px] dark:bg-foreground dark:p-px",
      )}
    />
  );
};

const TechStack = () => (
  <section id="stack" className="mb-28 scroll-mt-20">
    <Reveal>
      <SectionHeading index="03" title="Tech stack" meta={`${skillCategories.length} domains · ${totalSkills} skills`} />
    </Reveal>
    <div className="grid gap-4 md:grid-cols-3">
      {skillCategories.map((category) => (
        <Reveal key={category.title} className={cn(category.wide && "md:col-span-2")}>
          <HudCard className="h-full p-5">
            <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              {category.title}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {category.skills.map((skill) => (
                <li key={skill.name} className="chip chip-icon">
                  <SkillIcon skill={skill} />
                  {skill.name}
                </li>
              ))}
            </ul>
          </HudCard>
        </Reveal>
      ))}
    </div>
  </section>
);

export default TechStack;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/data/skills.test.ts src/components/TechStack.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/data/skills.ts src/data/skills.test.ts src/components/TechStack.tsx src/components/TechStack.test.tsx
git commit -m "feat: align tech stack with the CV's 35 skills" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Project data grouping and palette-coloured case-study pages

**Files:**
- Modify: `src/data/projects.ts` (the `Project` interface and the eight `headerGradient` lines)
- Modify: `src/pages/ProjectDetail.tsx` (line 37 and the "Floating orbs" block)
- Test: `src/data/projects.test.ts`

- [ ] **Step 1: Write the failing test**

`src/data/projects.test.ts`:

```ts
import projects from "./projects";

const slugs = (group: "professional" | "personal") =>
  projects.filter((p) => p.group === group).map((p) => p.slug);

describe("projects data", () => {
  it("features exactly one project, the Talenta → SAP integration, with a three-step highlight", () => {
    const featured = projects.filter((p) => p.featured);
    expect(featured.map((p) => p.slug)).toEqual(["talenta-sap-integration"]);
    expect(featured[0].highlight).toEqual({
      context: expect.any(String),
      approach: expect.any(String),
      outcome: expect.any(String),
    });
  });

  it("splits the eight projects into five professional and three personal", () => {
    expect(slugs("professional")).toEqual([
      "talenta-sap-integration",
      "e-timesheet",
      "banking-middleware-apis",
      "e-management-of-change",
      "e-credit-management",
    ]);
    expect(slugs("personal")).toEqual(["stockledger", "habit-tracker", "meal-planner"]);
  });

  it("names the organisation for every professional project and none for personal ones", () => {
    for (const project of projects) {
      if (project.group === "professional") expect(project.org).toBeTruthy();
      else expect(project.org).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/projects.test.ts`
Expected: FAIL, because `featured` is empty and `group` is undefined.

- [ ] **Step 3: Update the `Project` interface**

In `src/data/projects.ts`, replace:

```ts
  githubUrl: string;
  headerGradient: [string, string]; // two HSL colors for the header background
  clickable?: boolean; // defaults to true if omitted
```

with:

```ts
  githubUrl: string;
  clickable?: boolean; // defaults to true if omitted
  /** Employer the system was built for; omitted for personal builds. */
  org?: string;
  group: "professional" | "personal";
  /** Shown as the homepage's featured case study. Exactly one project sets this. */
  featured?: boolean;
  /** Three-step summary on the featured homepage card. */
  highlight?: { context: string; approach: string; outcome: string };
```

- [ ] **Step 4: Replace each `headerGradient` line**

Each old line is unique. Replace each one with the new lines shown, keeping the 4-space indent.

| Project | Old line | New lines |
|---|---|---|
| talenta-sap-integration | `    headerGradient: ["239 84% 67%", "217 91% 60%"],` | see below |
| e-timesheet | `    headerGradient: ["199 89% 48%", "239 84% 67%"],` | `    org: "Bluebird Group",`<br>`    group: "professional",` |
| banking-middleware-apis | `    headerGradient: ["263 70% 50%", "239 84% 67%"],` | `    org: "Bank Raya",`<br>`    group: "professional",` |
| e-management-of-change | `    headerGradient: ["45 93% 47%", "25 95% 53%"],` | `    org: "Bayer",`<br>`    group: "professional",` |
| e-credit-management | `    headerGradient: ["15 85% 55%", "339 84% 55%"],` | `    org: "Bayer",`<br>`    group: "professional",` |
| stockledger | `    headerGradient: ["160 84% 39%", "217 91% 60%"],` | `    group: "personal",` |
| habit-tracker | `    headerGradient: ["339 84% 55%", "263 70% 50%"],` | `    group: "personal",` |
| meal-planner | `    headerGradient: ["25 95% 53%", "45 93% 47%"],` | `    group: "personal",` |

For talenta-sap-integration, the new lines are:

```ts
    org: "Bluebird Group",
    group: "professional",
    featured: true,
    highlight: {
      context:
        "Driver shift, overtime and time-off records were kept by hand in SAP. When HR moved to Talenta, a vendor platform, the data still had to reach SAP, across a boundary neither side controlled.",
      approach:
        "Middleware that owns the timing. Records are acknowledged and staged in SQL Server, then Hangfire workers post batches to SAP over RFC, with automatic retries and end-to-end logging.",
      outcome:
        "Shift, overtime and time-off data reaches SAP without manual re-entry, and transfers survive volumes that would time out a direct call.",
    },
```

Check: `grep -n headerGradient src/data/projects.ts` prints nothing.

- [ ] **Step 5: Switch `ProjectDetail.tsx` to palette colours**

Replace:

```tsx
  const [color1, color2] = project.headerGradient;
```

with:

```tsx
  // Case-study pages follow the site palette rather than per-project colours.
  const color1 = "var(--primary)";
  const color2 = "var(--border-strong)";
```

Then delete this whole block (the blurred orbs):

```tsx
          {/* Floating orbs */}
          <div
            className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full blur-[100px] animate-pulse"
            style={{ backgroundColor: `hsl(${color1} / 0.2)` }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-[80px] animate-pulse"
            style={{ backgroundColor: `hsl(${color2} / 0.15)`, animationDelay: "1.5s" }}
          />
```

`color1` and `color2` are used inside `hsl(${…})` and `hsl(${…} / 0.25)`. Because the tokens are bare HSL triplets, `hsl(var(--primary) / 0.25)` is valid CSS.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/data src/pages src/components/project`
Expected: PASS. That's the new `projects.test.ts` (3 tests) and every existing `ProjectDetail` and `components/project` test.

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no output, meaning no remaining reference to `headerGradient`.

- [ ] **Step 7: Commit**

```bash
git add src/data/projects.ts src/data/projects.test.ts src/pages/ProjectDetail.tsx
git commit -m "feat: group projects and colour case-study pages from the palette" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Projects section

**Files:**
- Rewrite: `src/components/Projects.tsx`
- Test: `src/components/Projects.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/Projects.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Projects from "./Projects";

const renderProjects = () =>
  render(
    <MemoryRouter>
      <Projects />
    </MemoryRouter>,
  );

const card = (title: string) => screen.getByRole("heading", { level: 3, name: title }).closest(".hud") as HTMLElement;

describe("Projects", () => {
  it("renders all eight projects as h3 cards", () => {
    renderProjects();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
  });

  it("leads with the featured Talenta → SAP case study and its three steps", () => {
    renderProjects();
    const featured = card("Talenta → SAP Integration");
    expect(within(featured).getByText("Featured case study · Backend System")).toBeInTheDocument();
    ["Context", "Approach", "Outcome"].forEach((step) =>
      expect(within(featured).getByRole("heading", { level: 4, name: new RegExp(step) })).toBeInTheDocument(),
    );
    expect(within(featured).getByRole("link", { name: "Read case study →" })).toHaveAttribute(
      "href",
      "/project/talenta-sap-integration",
    );
  });

  it("labels the two groups", () => {
    renderProjects();
    expect(screen.getByText("Professional systems")).toBeInTheDocument();
    expect(screen.getByText("Personal builds")).toBeInTheDocument();
  });

  it("marks internal systems as private and gives them no case-study link", () => {
    renderProjects();
    const credit = card("E-Credit Management");
    expect(within(credit).getByText("Internal system · private")).toBeInTheDocument();
    expect(within(credit).queryByRole("link")).toBeNull();
  });

  it("links a case study but notes a private codebase when there is no repo", () => {
    renderProjects();
    const banking = card("Banking Middleware APIs");
    expect(within(banking).getByRole("link", { name: "Case study →" })).toHaveAttribute(
      "href",
      "/project/banking-middleware-apis",
    );
    expect(within(banking).getByText("Private codebase")).toBeInTheDocument();
  });

  it("previews four stack chips and counts the rest", () => {
    renderProjects();
    expect(within(card("E-Timesheet")).getByText("+4 more")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Projects.test.tsx`
Expected: FAIL. The heading count doesn't match, and there's no "Professional systems" text.

- [ ] **Step 3: Rewrite `src/components/Projects.tsx`**

```tsx
import { Fragment } from "react";
import { Link } from "react-router-dom";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import projects, { type Project } from "@/data/projects";

const STACK_PREVIEW = 4;
const linkClass = "text-foreground transition-colors hover:text-primary";
const STEPS = [
  { num: "01", title: "Context", key: "context" },
  { num: "02", title: "Approach", key: "approach" },
  { num: "03", title: "Outcome", key: "outcome" },
] as const;

const StackChips = ({ stack, limit }: { stack: string[]; limit?: number }) => {
  const shown = limit ? stack.slice(0, limit) : stack;
  const hidden = stack.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((tech) => (
        <span key={tech} className="chip">
          {tech}
        </span>
      ))}
      {hidden > 0 && <span className="chip chip-dim">+{hidden} more</span>}
    </div>
  );
};

const ProjectLinks = ({ project, caseStudyLabel }: { project: Project; caseStudyLabel: string }) => {
  if (project.clickable === false) {
    return <p className="mt-3.5 font-mono text-xs text-muted-foreground">Internal system · private</p>;
  }
  return (
    <div className="mt-3.5 flex flex-wrap gap-4 font-mono text-xs font-medium">
      <Link to={`/project/${project.slug}`} className={linkClass}>
        {caseStudyLabel}
      </Link>
      {project.githubUrl ? (
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          GitHub ↗
        </a>
      ) : (
        <span className="text-muted-foreground">Private codebase</span>
      )}
    </div>
  );
};

const CardTop = ({ label, org }: { label: string; org?: string }) => (
  <div className="flex items-baseline justify-between gap-2.5">
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">{label}</span>
    {org && <span className="mono-label whitespace-nowrap">{org}</span>}
  </div>
);

const FeaturedProject = ({ project }: { project: Project }) => (
  <HudCard glow className="mb-4 p-6 md:p-7">
    <CardTop label={`Featured case study · ${project.type}`} org={project.org} />
    <h3 className="mb-5 mt-2 text-[21px] font-semibold tracking-[-0.02em] text-foreground">{project.title}</h3>
    {project.highlight && (
      <div className="grid items-stretch gap-3.5 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {STEPS.map((step, i) => (
          <Fragment key={step.key}>
            {i > 0 && (
              <span aria-hidden="true" className="rotate-90 self-center justify-self-center font-mono text-sm text-primary md:rotate-0">
                →
              </span>
            )}
            <div className="rounded border border-border p-4">
              <h4 className="mono-label mb-1.5">
                <span className="mr-1.5 text-primary">{step.num}</span>
                {step.title}
              </h4>
              <p className="text-sm">{project.highlight?.[step.key]}</p>
            </div>
          </Fragment>
        ))}
      </div>
    )}
    <div className="flex flex-wrap items-end justify-between gap-5 pt-5">
      <StackChips stack={project.stack} />
      <ProjectLinks project={project} caseStudyLabel="Read case study →" />
    </div>
  </HudCard>
);

const ProjectCard = ({ project }: { project: Project }) => (
  <HudCard as="article" glow className="flex h-full flex-col p-[22px]">
    <CardTop label={project.type} org={project.org} />
    <h3 className="mb-1.5 mt-2 text-[17px] font-semibold text-foreground">{project.title}</h3>
    <p className="text-sm">{project.problem}</p>
    <p className="mt-2.5 text-sm text-foreground">
      <span className="text-primary" aria-hidden="true">
        ↳{" "}
      </span>
      {project.impact}
    </p>
    <div className="mt-auto pt-4">
      <StackChips stack={project.stack} limit={STACK_PREVIEW} />
      <ProjectLinks project={project} caseStudyLabel="Case study →" />
    </div>
  </HudCard>
);

const Projects = () => {
  const featured = projects.find((p) => p.featured);
  const professional = projects.filter((p) => p.group === "professional" && !p.featured);
  const personal = projects.filter((p) => p.group === "personal");
  const professionalCount = projects.filter((p) => p.group === "professional").length;

  return (
    <section id="projects" className="mb-28 scroll-mt-20">
      <Reveal>
        <SectionHeading
          index="02"
          title="Projects"
          meta={`${professionalCount} professional systems · ${personal.length} personal builds`}
        />
      </Reveal>
      {featured && (
        <Reveal>
          <FeaturedProject project={featured} />
        </Reveal>
      )}

      <p className="subhead mono-label">Professional systems</p>
      <div className="grid gap-4 md:grid-cols-2">
        {professional.map((project) => (
          <Reveal key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      <p className="subhead mono-label">Personal builds</p>
      <div className="grid gap-4 md:grid-cols-3">
        {personal.map((project) => (
          <Reveal key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Projects;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Projects.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Projects.tsx src/components/Projects.test.tsx
git commit -m "feat: show featured case study plus professional and personal projects" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Experience pipeline

**Files:**
- Rewrite: `src/components/Experience.tsx`
- Test: `src/components/Experience.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/Experience.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import Experience from "./Experience";

describe("Experience", () => {
  it("lists the four CV roles, newest first", () => {
    render(<Experience />);
    const companies = ["PT Bluebird Group", "PT Bank Raya", "PT Bayer Indonesia", "Thortech Asia"];
    const positions = companies.map((name) => screen.getByText(name));
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i - 1].compareDocumentPosition(positions[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("shows system modules with their integration routes and impact chips", () => {
    render(<Experience />);
    expect(screen.getByText("Talenta Receiver Service")).toBeInTheDocument();
    expect(screen.getByText("Talenta HR → SAP")).toBeInTheDocument();
    expect(screen.getByText("−40% errors")).toBeInTheDocument();
    expect(screen.getByText("1,000+ tx/day")).toBeInTheDocument();
  });

  it("opens the full CV bullets for a role", () => {
    render(<Experience />);
    fireEvent.click(screen.getByRole("button", { name: "Full details: IT Application Developer at PT Bluebird Group" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Driver SIO \(Surat Izin Operasi\)/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Experience.test.tsx`
Expected: FAIL, because there's no "Talenta HR → SAP" text and no "Full details" button.

- [ ] **Step 3: Rewrite `src/components/Experience.tsx`**

```tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { LINKEDIN_URL } from "@/lib/profile";

interface SystemModule {
  name: string;
  summary: string;
  /** Integration direction, e.g. "Talenta HR → SAP". */
  route?: string;
}

interface Role {
  company: string;
  industry: string;
  role: string;
  /** Compact form for the card, e.g. "2023 → NOW". */
  period: string;
  /** Full form for the details dialog. */
  fullPeriod: string;
  modules: SystemModule[];
  impact: string[];
  stack: string[];
  /** CV bullets, verbatim. */
  bullets: string[];
}

const roles: Role[] = [
  {
    company: "PT Bluebird Group",
    industry: "Transport",
    role: "IT Application Developer",
    period: "2023 → NOW",
    fullPeriod: "Mar 2023 — Present",
    modules: [
      { name: "E-Timesheet Service", summary: "Driver contracts, timesheets and operating permits (SIO).", route: "Portal Timesheet → SAP" },
      { name: "Talenta Receiver Service", summary: "Shifts, overtime and time-off via background processing.", route: "Talenta HR → SAP" },
      { name: "Journaling Service", summary: "Multi-gateway transactions with less manual reconciliation.", route: "Gateways → Ledger" },
    ],
    impact: [],
    stack: [".NET Core", "Go", "gRPC", "SQL Server", "MySQL", "SAP"],
    bullets: [
      "Designed and developed scalable RESTful APIs for the E-Timesheet Service, an API middleware integrating Portal Timesheet with SAP, covering driver contract, driver timesheet, and Driver SIO (Surat Izin Operasi) data to improve HR and operational data accuracy.",
      "Built and maintained the Talenta Receiver Service, an API middleware integrating Talenta (external HR platform) with SAP, handling driver shift schedules, overtime, and time-off data with reliable background processing.",
      "Engineered the Journaling Service, an internal finance application to record and manage transactions from multiple payment gateway platforms, improving financial tracking accuracy and reducing manual reconciliation.",
      "Designed backend service flows and background processing for high-volume data integration systems, ensuring reliability, scalability, and fault tolerance.",
      "Optimized SQL queries and implemented fault-handling mechanisms, improving API performance and stability under high-load conditions.",
      "Collaborated with cross-functional teams (business, QA, SAP) to design system architecture and deliver features iteratively using Agile/Scrum methodology.",
    ],
  },
  {
    company: "PT Bank Raya",
    industry: "Banking",
    role: "Backend Developer",
    period: "2021 → 2023",
    fullPeriod: "Mar 2021 — Feb 2023",
    modules: [
      { name: "BI-FAST middleware", summary: "Real-time interbank transfer APIs for web and mobile banking.", route: "Bank ↔ BI-FAST" },
      { name: "Card Management System", summary: "Automated issuance and status tracking.", route: "Web Forms · SQL Server" },
    ],
    impact: ["1,000+ tx/day", "5,000+ cardholders"],
    stack: [".NET Core", "SQL Server"],
    bullets: [
      "Designed and developed RESTful APIs for the BI-FAST middleware service using .NET Core and SQL Server, enabling secure real-time integration across web and mobile banking applications.",
      "Implemented backend service flows for interbank fund transfers, supporting over 1,000 daily transactions with a strong focus on data consistency, validation, and reliability.",
      "Collaborated with cross-functional teams to integrate frontend and backend components, ensuring low-latency and seamless real-time transaction experiences.",
      "Optimized SQL Server queries and backend logic to improve transaction performance and maintain system stability under peak usage.",
      "Developed and maintained a Card Management System using .NET Framework Web Forms and SQL Server, supporting daily operations for 5,000+ active cardholders through automated issuance and status tracking.",
      "Used Git-based workflows and team collaboration practices to streamline development, improve code quality, and support faster release cycles.",
    ],
  },
  {
    company: "PT Bayer Indonesia",
    industry: "Pharmaceutical",
    role: "IT Application Developer",
    period: "2019 → 2021",
    fullPeriod: "Apr 2019 — Feb 2021",
    modules: [
      { name: "Credit Management", summary: "Redesigned the database and workflows." },
      { name: "E-Management of Change", summary: "Documentation and approval workflow app." },
    ],
    impact: ["−40% errors", "+30% approvals", "−25% support"],
    stack: [".NET C#", "Laravel"],
    bullets: [
      "Developed and maintained enterprise web applications using .NET C#, SQL Server, Laravel, and Bootstrap, supporting multiple internal business processes.",
      "Optimized database design and backend workflows for the Credit Management system, reducing processing errors by 40% and improving overall system reliability.",
      "Improved mailing and approval workflows by resolving critical backend issues, resulting in faster approvals and reduced operational bottlenecks.",
      "Collaborated closely with business stakeholders to gather requirements and translate them into backend solutions, contributing to the successful delivery of 5+ internal applications.",
      "Provided application guidance and user training to improve system adoption and reduce support requests by over 25%.",
      "Enhanced HR-related web applications in collaboration with external vendors, improving system performance and cross-departmental data flow.",
      "Developed and optimized the E-Management of Change (E-MOC) application, increasing documentation and approval efficiency by approximately 30%.",
    ],
  },
  {
    company: "Thortech Asia",
    industry: "Web & mobile",
    role: "Web Developer",
    period: "2018 → 2019",
    fullPeriod: "Apr 2018 — Apr 2019",
    modules: [
      { name: "Kirimkanai", summary: "Mobile app APIs and admin tooling for 1,000+ users." },
      { name: "Gapallan", summary: "Logistics and ship-maintenance management." },
    ],
    impact: ["+25% admin efficiency", "−40% manual entry"],
    stack: ["Laravel", "MySQL"],
    bullets: [
      "Developed and maintained web applications using Laravel, MySQL, JavaScript, Bootstrap, and AJAX, supporting internal business operations across multiple departments.",
      "Designed and implemented RESTful APIs for the Kirimkanai mobile application, enabling secure transactions for 1,000+ active users and seamless integration with admin systems.",
      "Built backend services for Kirimkanai admin tools, improving transaction monitoring, reporting, and operational visibility, resulting in a 25% increase in administrative efficiency.",
      "Developed core features for the Gapallan Web Application, a logistics and ship maintenance management system, reducing manual data entry by approximately 40% and improving operational turnaround time.",
      "Collaborated with product and operational teams to gather requirements and deliver full-stack features aligned with business needs.",
    ],
  },
];

const Experience = () => {
  const [selected, setSelected] = useState<Role | null>(null);

  return (
    <section id="experience" className="mb-28 scroll-mt-20">
      <Reveal>
        <SectionHeading index="01" title="Experience" meta="4 orgs · banking · transport · pharma · logistics" />
      </Reveal>

      <div className="pipe">
        <span className="pipe-pulse" aria-hidden="true" />
        {roles.map((role) => (
          <Reveal key={role.company} className="relative mb-5">
            <span className="pipe-node" aria-hidden="true" />
            <HudCard as="article" glow className="grid gap-3 p-5 md:grid-cols-[190px_1fr] md:gap-7 md:p-6">
              <div>
                <p className="font-mono text-xs font-medium tracking-[0.04em] text-primary">{role.period}</p>
                <p className="mt-1 text-[17px] font-semibold text-foreground">{role.company}</p>
                <p className="mono-label">{role.industry}</p>
              </div>
              <div>
                <h3 className="mb-3 text-[15.5px] font-semibold text-foreground">{role.role}</h3>
                <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                  {role.modules.map((module) => (
                    <div key={module.name} className="rounded border border-border bg-primary/[0.025] px-3.5 py-3">
                      <p className="text-[14.5px] font-semibold text-foreground">{module.name}</p>
                      <p className="mt-0.5 text-[13.5px]">{module.summary}</p>
                      {module.route && (
                        <p className="mt-1.5 font-mono text-[11px] font-medium text-primary">{module.route}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {role.impact.map((item) => (
                    <span key={item} className="chip chip-impact">
                      {item}
                    </span>
                  ))}
                  {role.stack.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(role)}
                  aria-label={`Full details: ${role.role} at ${role.company}`}
                  className="mt-4 font-mono text-xs font-medium text-foreground transition-colors hover:text-primary"
                >
                  Full details →
                </button>
              </div>
            </HudCard>
          </Reveal>
        ))}
      </div>

      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="btn mt-4">
        View on LinkedIn ↗
      </a>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-[600px]">
          {selected && (
            <>
              <DialogHeader>
                <p className="font-mono text-xs text-primary">{selected.fullPeriod}</p>
                <DialogTitle className="text-2xl text-foreground">{selected.role}</DialogTitle>
                <DialogDescription>
                  {selected.company} · {selected.industry}
                </DialogDescription>
              </DialogHeader>
              <ul className="mt-2 space-y-3">
                {selected.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm">
                    <span className="mt-0.5 text-primary" aria-hidden="true">
                      →
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Experience;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Experience.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Experience.tsx src/components/Experience.test.tsx
git commit -m "feat: redraw experience as a pipeline timeline" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Integration console

**Files:**
- Create: `src/components/IntegrationConsole.tsx`
- Test: `src/components/IntegrationConsole.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/IntegrationConsole.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import IntegrationConsole from "./IntegrationConsole";

describe("IntegrationConsole", () => {
  afterEach(() => {
    mockReducedMotion(false);
    vi.useRealTimers();
  });

  it("is a labelled figure that says the flow is simulated", () => {
    render(<IntegrationConsole />);
    expect(
      screen.getByRole("figure", { name: "Animated overview of the integrations I build at Bluebird" }),
    ).toBeInTheDocument();
    expect(screen.getByText("SIMULATED FLOW")).toBeInTheDocument();
  });

  it("draws the five systems around the middleware", () => {
    render(<IntegrationConsole />);
    ["Portal Timesheet", "Talenta HR", "Payment gateways", "SAP", "Finance ledger", "middleware"].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument(),
    );
  });

  it("animates packets and rotates the log when motion is allowed", () => {
    vi.useFakeTimers();
    const { container } = render(<IntegrationConsole />);
    expect(container.querySelectorAll(".cx-pkt")).toHaveLength(5);
    const log = screen.getByTestId("console-log");
    expect(log.children).toHaveLength(3);
    const first = log.textContent;
    act(() => vi.advanceTimersByTime(1700));
    expect(log.textContent).not.toBe(first);
  });

  it("is static under reduced motion", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<IntegrationConsole />);
    expect(container.querySelectorAll(".cx-pkt")).toHaveLength(0);
    const log = screen.getByTestId("console-log");
    const first = log.textContent;
    act(() => vi.advanceTimersByTime(5000));
    expect(log.textContent).toBe(first);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/IntegrationConsole.test.tsx`
Expected: FAIL, with "Failed to resolve import "./IntegrationConsole"".

- [ ] **Step 3: Implement `src/components/IntegrationConsole.tsx`**

```tsx
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Illustrative events only; the console is labelled SIMULATED FLOW.
const LOG_LINES = [
  { source: "talenta.receiver", message: "shift batch staged" },
  { source: "talenta.receiver", message: "posted to SAP", ok: true },
  { source: "etimesheet.api", message: "driver SIO validated" },
  { source: "journaling.svc", message: "gateway tx recorded", ok: true },
  { source: "etimesheet.api", message: "timesheet synced → SAP", ok: true },
  { source: "talenta.receiver", message: "retry scheduled (backoff)" },
  { source: "journaling.svc", message: "reconciliation matched", ok: true },
];
const VISIBLE_LINES = 3;
const LOG_INTERVAL_MS = 1700;

const NODES = [
  { x: 16, y: 34, label: "Portal Timesheet" },
  { x: 16, y: 128, label: "Talenta HR" },
  { x: 16, y: 222, label: "Payment gateways" },
  { x: 372, y: 70, label: "SAP" },
  { x: 372, y: 186, label: "Finance ledger" },
];

const WIRES = [
  { id: "cx-w1", d: "M148 56 C 175 56, 175 118, 196 118", dur: "2.4s", begin: "0s" },
  { id: "cx-w2", d: "M148 150 L 196 150", dur: "1.8s", begin: "0.6s" },
  { id: "cx-w3", d: "M148 244 C 175 244, 175 184, 196 184", dur: "2.8s", begin: "1.1s" },
  { id: "cx-w4", d: "M328 124 C 350 124, 350 92, 372 92", dur: "2.1s", begin: "0.9s" },
  { id: "cx-w5", d: "M328 176 C 350 176, 350 208, 372 208", dur: "2.5s", begin: "1.6s" },
];

const IntegrationConsole = () => {
  const reduced = usePrefersReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setOffset((value) => (value + 1) % LOG_LINES.length), LOG_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const visible = Array.from({ length: VISIBLE_LINES }, (_, i) => LOG_LINES[(offset + i) % LOG_LINES.length]);

  return (
    <figure className="hud" aria-label="Animated overview of the integrations I build at Bluebird">
      <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5 font-mono text-[11.5px] font-medium text-muted-foreground">
        bluebird / integration-overview
        <span className="ml-auto rounded-[3px] border border-primary/40 px-1.5 text-[10.5px] tracking-[0.06em] text-primary">
          SIMULATED FLOW
        </span>
      </div>

      <svg viewBox="0 0 520 300" className="block h-auto w-full" aria-hidden="true">
        <text className="cx-cap" x="16" y="22">SOURCES</text>
        <text className="cx-cap" x="372" y="58">TARGETS</text>

        {WIRES.map((wire) => (
          <path key={wire.id} id={wire.id} className="cx-wire" d={wire.d} />
        ))}
        {WIRES.map((wire) => (
          <path key={`${wire.id}-live`} className="cx-wire-live" d={wire.d} />
        ))}

        {NODES.map((node) => (
          <g key={node.label}>
            <rect className="cx-box" x={node.x} y={node.y} width="132" height="44" rx="4" />
            <text className="cx-label" x={node.x + 66} y={node.y + 26} textAnchor="middle">
              {node.label}
            </text>
          </g>
        ))}

        <rect className="cx-core-glow" x="190" y="90" width="144" height="120" rx="8" />
        <rect className="cx-core" x="196" y="96" width="132" height="108" rx="6" />
        <text className="cx-core-title" x="262" y="132" textAnchor="middle">.NET / Go</text>
        <text className="cx-core-title" x="262" y="148" textAnchor="middle">middleware</text>
        <text className="cx-core-sub" x="262" y="172" textAnchor="middle">retries · staging</text>
        <text className="cx-core-sub" x="262" y="186" textAnchor="middle">contracts · audit</text>

        {!reduced &&
          WIRES.map((wire) => (
            <circle key={`${wire.id}-pkt`} className="cx-pkt" r="3">
              <animateMotion dur={wire.dur} begin={wire.begin} repeatCount="indefinite">
                <mpath href={`#${wire.id}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>

      <div
        data-testid="console-log"
        aria-hidden="true"
        className="h-[84px] overflow-hidden border-t border-border px-3.5 pb-3 pt-2.5 font-mono text-xs leading-[1.7] text-muted-foreground"
      >
        {visible.map((line, i) => (
          <div key={`${offset}-${i}`} className="truncate">
            <span className="text-primary">[{line.source}]</span> {line.message}
            {line.ok && <span className="text-success"> ✓</span>}
          </div>
        ))}
      </div>
    </figure>
  );
};

export default IntegrationConsole;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/IntegrationConsole.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/IntegrationConsole.tsx src/components/IntegrationConsole.test.tsx
git commit -m "feat: add animated integration console" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Hero and KPI strip

**Files:**
- Rewrite: `src/components/Hero.tsx`
- Create: `src/components/KpiStrip.tsx`
- Test: `src/components/Hero.test.tsx`, `src/components/KpiStrip.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/Hero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Hero from "./Hero";

describe("Hero", () => {
  afterEach(() => mockReducedMotion(false));

  it("names the owner in the page's only h1", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Muhammad Puntodewo Fadhillah");
  });

  it("offers experience, CV download and GitHub", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "View experience →" })).toHaveAttribute("href", "#experience");
    const cv = screen.getByRole("link", { name: "Download CV ↓" });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
    expect(screen.getByRole("link", { name: "GitHub ↗" })).toHaveAttribute("href", "https://github.com/mpuntodewof");
  });

  it("shows the first role in full, without typing, under reduced motion", () => {
    mockReducedMotion(true);
    render(<Hero />);
    expect(screen.getByTestId("typed-role")).toHaveTextContent(/^Backend & Integration Engineer$/);
  });
});
```

`src/components/KpiStrip.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import KpiStrip from "./KpiStrip";

describe("KpiStrip", () => {
  it("shows the four static figures", () => {
    render(<KpiStrip />);
    ["backend & integration", "interbank transfers", "active cardholders", "processing errors"].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument(),
    );
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("−40")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/Hero.test.tsx src/components/KpiStrip.test.tsx`
Expected: FAIL. The Hero has no "Download CV ↓" link yet, and `./KpiStrip` can't be resolved.

- [ ] **Step 3: Rewrite `src/components/Hero.tsx`**

```tsx
import IntegrationConsole from "@/components/IntegrationConsole";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { GITHUB_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const ROLES = ["Backend & Integration Engineer", ".NET Core · Go · SQL Server", "SAP / HR / payments middleware"] as const;

const Hero = () => {
  const reduced = usePrefersReducedMotion();
  const role = useTypewriter(ROLES, !reduced);

  return (
    <section className="grid items-center gap-12 py-12 md:py-20 lg:grid-cols-[1fr_1.02fr]">
      <div>
        <p className="flex flex-wrap items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.04em] text-primary">
          <span className="status-dot" aria-hidden="true" />
          Available
          <span className="text-muted-foreground">/ open to remote roles · Jakarta UTC+7</span>
        </p>
        <h1 className="mb-3.5 mt-5 text-[clamp(36px,5vw,58px)] font-bold leading-[1.02] tracking-[-0.04em] text-foreground">
          Muhammad Puntodewo <span className="text-gradient-brand">Fadhillah</span>
        </h1>
        <p className="mb-5 min-h-[1.6em] font-mono text-[14.5px] font-medium text-body">
          <span className="text-primary" aria-hidden="true">
            &gt;
          </span>{" "}
          <span className="sr-only">{ROLES[0]}</span>
          <span aria-hidden="true" data-testid="typed-role">
            {role}
          </span>
          <span className="caret" aria-hidden="true" />
        </p>
        <p className="max-w-[540px] text-[17.5px]">
          I design the APIs and background services that move data between enterprise systems, such as{" "}
          <b className="font-medium text-foreground">SAP and HR platforms</b>,{" "}
          <b className="font-medium text-foreground">payment gateways and finance ledgers</b>, or a bank and the national{" "}
          <b className="font-medium text-foreground">BI-FAST</b> rails. The data has to arrive correctly every time.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a className="btn btn-primary" href="#experience">
            View experience →
          </a>
          <a className="btn" href={RESUME_URL} download={RESUME_FILENAME}>
            Download CV ↓
          </a>
          <a className="btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </div>
      </div>
      <IntegrationConsole />
    </section>
  );
};

export default Hero;
```

- [ ] **Step 4: Create `src/components/KpiStrip.tsx`**

```tsx
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";

const KPIS = [
  { key: "Experience", value: "7", unit: "+ yrs", label: "backend & integration" },
  { key: "BI-FAST", value: "1,000", unit: "+/day", label: "interbank transfers" },
  { key: "Card mgmt", value: "5,000", unit: "+", label: "active cardholders" },
  { key: "Credit mgmt", value: "−40", unit: "%", label: "processing errors" },
];

const KpiStrip = () => (
  <Reveal className="mb-28">
    {/* gap-px over a border-coloured background draws the 1px dividers between cells. */}
    <HudCard className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
      {KPIS.map((kpi) => (
        <div key={kpi.key} className="bg-card p-6">
          <p className="mono-label">{kpi.key}</p>
          <p className="mt-1.5 font-mono text-[30px] font-semibold tracking-[-0.03em] text-foreground">
            {kpi.value}
            <small className="ml-0.5 text-[15px] text-primary">{kpi.unit}</small>
          </p>
          <p className="text-[13px]">{kpi.label}</p>
        </div>
      ))}
    </HudCard>
  </Reveal>
);

export default KpiStrip;
```

`getByText("1,000")` matches because Testing Library compares an element's own text nodes, and the unit sits in a child `<small>`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/Hero.test.tsx src/components/KpiStrip.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.tsx src/components/Hero.test.tsx src/components/KpiStrip.tsx src/components/KpiStrip.test.tsx
git commit -m "feat: rebuild hero with typed role and add KPI strip" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Theme toggle and navbar

**Files:**
- Rewrite: `src/components/ThemeToggle.tsx`, `src/components/Navbar.tsx`
- Test: `src/components/Navbar.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/Navbar.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Navbar from "./Navbar";

const renderNavbar = () =>
  render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Navbar />
    </ThemeProvider>,
  );

describe("Navbar", () => {
  it("shows the owner's name instead of a generic logo", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /Puntodewo Fadhillah/ })).toHaveAttribute("href", "#top");
  });

  it("links to every homepage section", () => {
    renderNavbar();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["#experience", "#projects", "#stack", "#contract", "#contact"]);
  });

  it("downloads the CV from the résumé button", () => {
    renderNavbar();
    const resume = screen.getByRole("link", { name: "Résumé ↓" });
    expect(resume).toHaveAttribute("href", RESUME_URL);
    expect(resume).toHaveAttribute("download", RESUME_FILENAME);
  });

  it("toggles between dark and light", async () => {
    renderNavbar();
    const toggle = await screen.findByRole("button", { name: "Switch to light mode" });
    fireEvent.click(toggle);
    expect(await screen.findByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Navbar.test.tsx`
Expected: FAIL. There's no "Primary" navigation and no "Résumé ↓" link.

- [ ] **Step 3: Rewrite `src/components/ThemeToggle.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Reserve the space until the theme is known, so the header doesn't shift.
  if (!mounted) return <span className="h-[34px] w-[34px]" aria-hidden="true" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="grid h-[34px] w-[34px] place-items-center rounded-md border border-border-strong text-body transition-colors hover:border-primary/60 hover:text-primary"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
```

- [ ] **Step 4: Rewrite `src/components/Navbar.tsx`**

```tsx
import { useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const navLinks = [
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Contract", href: "#contract" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const ratio = max > 0 ? root.scrollTop / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[62px] max-w-[1180px] items-center gap-3 px-4 md:px-8 lg:gap-7">
        <a href="#top" className="mr-auto flex items-center gap-3 font-semibold tracking-tight text-foreground">
          <span className="rounded border border-primary/50 px-[7px] py-1 font-mono text-[11px] font-semibold text-primary">
            MPF
          </span>
          Puntodewo Fadhillah
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[5px] px-3 py-1.5 font-mono text-[12.5px] uppercase tracking-[0.04em] text-muted-foreground transition-colors hover:bg-primary/[0.07] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <a className="btn" href={RESUME_URL} download={RESUME_FILENAME}>
          Résumé ↓
        </a>
      </div>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
    </header>
  );
};

export default Navbar;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/Navbar.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/Navbar.tsx src/components/Navbar.test.tsx
git commit -m "feat: rebuild navbar with name, résumé download and scroll progress" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Contract panel

**Files:**
- Rewrite: `src/components/Services.tsx`
- Modify: `src/components/Services.test.tsx` (add one test at the end of the `describe` block)

- [ ] **Step 1: Add the failing test**

Append inside the existing `describe("Services", …)` block in `src/components/Services.test.tsx`:

```tsx
  it("opens the project enquiry dialog from the contract panel", () => {
    render(<Services />);
    fireEvent.click(screen.getByRole("button", { name: "Discuss a project →" }));
    expect(screen.getByRole("dialog", { name: "Start a Project" })).toBeInTheDocument();
  });
```

Change the file's first import to:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
```

- [ ] **Step 2: Run tests to verify the new one fails**

Run: `npx vitest run src/components/Services.test.tsx`
Expected: the three existing tests PASS, and the new one FAILs because no "Discuss a project →" button exists.

- [ ] **Step 3: Rewrite `src/components/Services.tsx`**

```tsx
import { useState } from "react";
import ContactFormDialog from "@/components/ContactFormDialog";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";

// Integration leads: it is the least commoditised offering (see Services.test.tsx).
const services = [
  { title: "Enterprise System Integration", summary: "SAP, HR and finance middleware that owns timing, retries and contracts." },
  { title: "Backend & API Development", summary: ".NET services with OpenAPI contracts and background processing." },
  { title: "Legacy Modernisation & Performance", summary: "An audit first, then targeted query tuning and fault handling." },
  { title: "Workflow & Approval Automation", summary: "Multi-level approvals with state machines and an audit trail." },
];

const Services = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section id="contract" className="mb-28 scroll-mt-20">
      <Reveal>
        <HudCard glow className="grid items-start gap-10 p-6 md:grid-cols-[1fr_1.35fr] md:p-9">
          <div>
            <p className="font-mono text-xs text-primary">{"// also available"}</p>
            <h2 className="mb-2.5 mt-2 text-[26px] font-semibold tracking-[-0.03em] text-foreground">
              Contract &amp; freelance engagements
            </h2>
            <p>
              I take on a few remote backend and integration projects, with working hours that overlap Asia-Pacific and
              Europe.
            </p>
            <button type="button" className="btn mt-5" onClick={() => setDialogOpen(true)}>
              Discuss a project →
            </button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <li key={service.title} className="rounded border border-border p-3.5">
                <h3 className="text-[14.5px] font-semibold text-foreground">{service.title}</h3>
                <p className="text-[13.5px]">{service.summary}</p>
              </li>
            ))}
          </ul>
        </HudCard>
      </Reveal>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default Services;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/Services.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Services.tsx src/components/Services.test.tsx
git commit -m "feat: turn services into a compact contract panel with enquiry dialog" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Terminal contact block and footer

**Files:**
- Create: `src/components/Contact.tsx`
- Rewrite: `src/components/Footer.tsx`
- Test: `src/components/Contact.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/Contact.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Contact from "./Contact";
import Footer from "./Footer";

describe("Contact", () => {
  it("is addressed to people hiring", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { level: 2, name: "Hiring for backend or integration work?" })).toBeInTheDocument();
  });

  it("lists email, LinkedIn, GitHub and the CV as terminal commands", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
    expect(screen.getByRole("link", { name: "linkedin.com/in/muhammad-puntodewo-fadhillah" })).toHaveAttribute("href", LINKEDIN_URL);
    expect(screen.getByRole("link", { name: "github.com/mpuntodewof" })).toHaveAttribute("href", GITHUB_URL);
    const cv = screen.getByRole("link", { name: RESUME_FILENAME });
    expect(cv).toHaveAttribute("href", RESUME_URL);
    expect(cv).toHaveAttribute("download", RESUME_FILENAME);
  });
});

describe("Footer", () => {
  it("credits the owner by name", () => {
    render(<Footer />);
    expect(screen.getByText(/Muhammad Puntodewo Fadhillah/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Contact.test.tsx`
Expected: FAIL, with "Failed to resolve import "./Contact"".

- [ ] **Step 3: Create `src/components/Contact.tsx`**

```tsx
import { type ReactNode } from "react";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const linkClass =
  "border-b border-dashed border-primary/60 text-foreground transition-colors [overflow-wrap:anywhere] hover:text-primary";

const TerminalLine = ({ command, children }: { command: string; children: ReactNode }) => (
  <p>
    <span className="text-primary" aria-hidden="true">
      $
    </span>{" "}
    {command} {children}
  </p>
);

const Contact = () => (
  <section id="contact" className="mb-6 scroll-mt-20">
    <Reveal>
      <HudCard>
        <div className="flex gap-[7px] border-b border-border px-3.5 py-[11px]" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <i key={dot} className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          ))}
        </div>
        <div className="px-6 py-6 font-mono text-sm leading-[1.9] md:px-7">
          <h2 className="mb-2.5 font-sans text-[26px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Hiring for backend or integration work?
          </h2>
          <TerminalLine command="contact --email">
            <a className={linkClass} href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </TerminalLine>
          <TerminalLine command="open">
            <a className={linkClass} href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              linkedin.com/in/muhammad-puntodewo-fadhillah
            </a>
          </TerminalLine>
          <TerminalLine command="open">
            <a className={linkClass} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              github.com/mpuntodewof
            </a>
          </TerminalLine>
          <TerminalLine command="download">
            <a className={linkClass} href={RESUME_URL} download={RESUME_FILENAME}>
              {RESUME_FILENAME}
            </a>
            <span className="caret" aria-hidden="true" />
          </TerminalLine>
        </div>
      </HudCard>
    </Reveal>
  </section>
);

export default Contact;
```

- [ ] **Step 4: Rewrite `src/components/Footer.tsx`**

```tsx
import { FULL_NAME } from "@/lib/profile";

const Footer = () => (
  <footer className="flex flex-wrap justify-between gap-2 pb-14 pt-7 font-mono text-xs text-muted-foreground">
    <span>
      © {new Date().getFullYear()} {FULL_NAME}
    </span>
    <span>B.Eng. Informatics · Mulawarman University</span>
  </footer>
);

export default Footer;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/Contact.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/Contact.tsx src/components/Contact.test.tsx src/components/Footer.tsx
git commit -m "feat: add terminal contact block and named footer" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Compose the homepage and remove retired sections

**Files:**
- Modify: `src/pages/Index.tsx`, `src/App.tsx`
- Delete: `src/components/TrustMetrics.tsx`, `src/components/WorkProcess.tsx`, `src/components/About.tsx`, `src/components/FinalCTA.tsx`
- Test: `src/pages/Index.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/pages/Index.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import Index from "./Index";

const renderIndex = () =>
  render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>,
  );

describe("Index", () => {
  it("renders the sections in the agreed order and nothing retired", () => {
    const { container } = renderIndex();
    const ids = Array.from(container.querySelectorAll("section[id]")).map((s) => s.id);
    expect(ids).toEqual(["experience", "projects", "stack", "contract", "contact"]);
  });

  it("offers the CV download in exactly three places", () => {
    const { container } = renderIndex();
    const links = container.querySelectorAll(`a[download="${RESUME_FILENAME}"]`);
    expect(links).toHaveLength(3);
    links.forEach((link) => expect(link).toHaveAttribute("href", RESUME_URL));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Index.test.tsx`
Expected: FAIL. The current Index still renders the old `services`/`about` sections and has only two résumé links (Navbar and Hero).

- [ ] **Step 3: Rewrite `src/pages/Index.tsx`**

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import KpiStrip from "@/components/KpiStrip";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  return (
    <>
      <div className="grid-backdrop" aria-hidden="true" />
      <Navbar />
      <main id="top" className="mx-auto max-w-[1180px] overflow-x-hidden px-4 md:px-8">
        <Hero />
        <KpiStrip />
        <Experience />
        <Projects />
        <TechStack />
        <Services />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Index;
```

- [ ] **Step 4: Delete the retired components and confirm nothing imports them**

```bash
git rm src/components/TrustMetrics.tsx src/components/WorkProcess.tsx src/components/About.tsx src/components/FinalCTA.tsx
grep -rnE "TrustMetrics|WorkProcess|components/About|FinalCTA" src || echo "no references"
```

Expected: `no references`.

- [ ] **Step 5: Honour reduced motion for every framer-motion animation**

In `src/App.tsx`, add `import { MotionConfig } from "framer-motion";` below the other imports, then wrap the `QueryClientProvider` element:

```tsx
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        {/* …unchanged children… */}
      </QueryClientProvider>
    </MotionConfig>
  </ThemeProvider>
```

Keep everything inside `QueryClientProvider` exactly as it is.

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: PASS for all 22 files: the 7 baseline files plus 15 new ones (Tasks 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14).

- [ ] **Step 7: Commit**

```bash
git add src/pages/Index.tsx src/pages/Index.test.tsx src/App.tsx
git commit -m "feat: compose blueprint homepage and retire old sections" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Final verification

**Files:** none (verification only; fix and commit anything it uncovers)

- [ ] **Step 1: Tests, types, build, lint**

```bash
npx vitest run
npx tsc -p tsconfig.app.json --noEmit
npm run build
npm run lint
```

Expected:
- all tests pass;
- `tsc` prints nothing;
- the build ends with `✓ built in …`;
- lint reports **exactly 3 errors**, the pre-existing ones in `ui/command.tsx`, `ui/textarea.tsx` and `tailwind.config.ts`. Warnings may differ.

If lint reports any new error, fix it in the file it names and commit.

- [ ] **Step 2: Screenshot the built site**

Serve the build:

```bash
npm run preview -- --port 4173 --strictPort
```

Run it in the background, then take screenshots with headless Chrome. Headless Chrome can't go narrower than about 500px, so the phone check renders the page inside a 390px iframe:

```bash
OUT="$TMPDIR/blueprint-shots"; mkdir -p "$OUT"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=1440,4200 --screenshot="$OUT/desktop.png" http://localhost:4173/
echo "<html><body style='margin:0'><iframe src='http://localhost:4173/' style='width:390px;height:4200px;border:0'></iframe></body></html>" > "$OUT/m.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=600,4200 --screenshot="$OUT/mobile.png" "file:///$OUT/m.html"
```

Compare `desktop.png` and `mobile.png` side by side with the reference mockup (`docs/superpowers/specs/assets/2026-10-25-systems-blueprint-mockup.html`, Navy & Azure, dark). Check that:
- the order is hero (with console), KPI strip, experience pipeline, featured case study, the two project grids, stack, contract, terminal contact and footer;
- there's no horizontal scrollbar at 390px;
- no element is clipped.

- [ ] **Step 3: Manual browser checks** (open `http://localhost:4173/`)

1. Click the theme toggle. The light theme should show a navy-on-white page with a blue accent, and reloading should keep it.
2. Click **Résumé ↓**, **Download CV ↓** and the terminal `download` link. Each should save `Muhammad-Puntodewo-Fadhillah-CV.pdf`, and the file should open as the CV.
3. Open **Read case study →** on the featured project. The case-study page should use the navy palette with no rainbow header or orbs. **Back** should return to the Projects section.
4. Hard-refresh `/project/stockledger`. The page should load (Cloudflare and `vite preview` both use the SPA fallback).
5. Turn on the OS reduced-motion setting (Windows: Settings → Accessibility → Visual effects → Animation effects **off**) and reload. The role line should be static, there should be no packets, and the log should not rotate.
6. Click **Discuss a project →**. The "Start a Project" dialog should open in the new palette.

Stop the preview server when you're done.

- [ ] **Step 4: Commit any fixes**

If steps 1–3 required changes:

```bash
git add -A
git commit -m "fix: address final verification findings" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Do not push. Hand back to the owner for review and merge.
