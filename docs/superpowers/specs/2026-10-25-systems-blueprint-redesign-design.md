# Systems Blueprint Redesign — Design

**Date:** 2026-10-25
**Status:** Approved (design), pending spec review
**Reference mockup:** [`assets/2026-10-25-systems-blueprint-mockup.html`](assets/2026-10-25-systems-blueprint-mockup.html)
(open it in a browser; the floating palette switcher is review-only and not part of the build)

## Problem

The homepage reads as a generic AI template rather than an engineer's profile:

- The visual layer (indigo→violet gradients, glassmorphism, blurred floating orbs, emoji
  metric icons, animated counters) is shared with thousands of generated sites.
- The owner's name appears nowhere. The logo is `</> Engineer`, and the meta author is "Software Engineer".
- The page speaks to freelance buyers first ("What I Can Build For You"), while the CV
  targets employers.
- The site and the CV disagree. The site says 5+ years, and the CV implies 7+. The CV skills also include
  Golang, CI/CD, Jenkins, Claude Code and Agentic AI, which the site omits.

## Goal

Make the site read as a credible, senior backend and integration engineer, **employer-first and
contract work second**, with a restrained futuristic "systems blueprint" look. The look
centres on a diagram of the integration work the owner actually does.

## Decisions

| Topic | Decision |
|---|---|
| Audience | Employers first. A smaller contract/freelance section sits near the end. |
| Visual direction | "Systems Blueprint, Futuristic": HUD panels with corner brackets, mono labels, masked grid, one soft horizon glow. No gradient blobs, glassmorphism or emoji. |
| Palette | **Navy & Azure** (tokens below). Blue was chosen for trust and enterprise and banking credibility. |
| Default theme | Dark. A light theme is available through the existing toggle. |
| Typography | Geist (text) + Geist Mono (labels, data, code). These replace Space Grotesk and DM Sans. |
| Identity | The full name "Muhammad Puntodewo Fadhillah" appears in the hero. The navbar shows an `MPF` badge plus "Puntodewo Fadhillah". |
| Portrait | Removed for this version. The current image is a stylised 3D avatar, and a real headshot can be added later as separate work. |
| Experience claim | 7+ years (Apr 2018 to present). |
| Source of truth | Experience and skills come from the CV dated 2026-10-25. Projects come from `src/data/projects.ts`. |
| Résumé | The real CV PDF is served from `public/` and linked from three places. |

## Palette tokens

The tokens follow the existing shadcn convention: HSL triplets, light values in `:root`, dark values in `.dark`
(next-themes `attribute="class"`, `defaultTheme="dark"`; unchanged). All text pairs below pass
WCAG AA (≥ 4.5:1). The lowest pairs are muted on background: 5.7:1 dark and 5.0:1 light.

| Token | Role | Dark (hex · HSL) | Light (hex · HSL) |
|---|---|---|---|
| `--background` | page | `#070D1A` · `221 58% 6%` | `#F5F7FB` · `220 43% 97%` |
| `--card` | HUD panel fill | `#0D1628` · `220 51% 10%` | `#FFFFFF` · `0 0% 100%` |
| `--node` | diagram boxes, modules | `#0E1930` · `221 55% 12%` | `#F7F9FC` · `216 45% 98%` |
| `--border` | hairlines | `#172440` · `221 47% 17%` | `#DDE3EE` · `219 33% 90%` |
| `--border-strong` | chips, buttons | `#22345A` · `221 45% 24%` | `#C8D2E2` · `217 31% 84%` |
| `--foreground` | headings, strong text | `#E8EEF8` · `218 53% 94%` | `#0B1A33` · `218 65% 12%` |
| `--body` | paragraph text | `#9DACC4` · `217 25% 69%` | `#44536B` · `217 22% 34%` |
| `--muted-foreground` | mono labels, meta | `#7D8CA8` · `219 20% 57%` | `#5F6B80` · `218 15% 44%` |
| `--primary` | accent: links, nodes, packets | `#5AA9FF` · `211 100% 68%` | `#1D5FD1` · `218 76% 47%` |
| `--primary-foreground` | text on primary | `#04122A` · `218 83% 9%` | `#FFFFFF` · `0 0% 100%` |
| `--impact` | impact chips (−40%, 1,000+/day) | `#F2C26B` · `39 84% 68%` | `#A35C00` · `34 100% 32%` |
| `--success` | "Available" status dot | `#4ADE80` · `142 69% 58%` | `#15803D` · `142 72% 29%` |

Background grid line colour: `--primary` at 5.5% alpha (dark), and `--foreground` at 5.5% alpha (light).
Map the remaining shadcn tokens (`--secondary`, `--muted`, `--accent`, `--input`, `--ring`,
`--popover`, `--sidebar-*`) onto these values so `src/components/ui/*` keeps working.

## Page structure (homepage)

Order and contents follow the reference mockup.

1. **Navbar.** `MPF` badge + name, mono uppercase links (Experience, Projects, Stack, Contract,
   Contact), theme toggle, and a **Résumé ↓** button. A 1px progress line under the bar fills with scroll.
2. **Hero.** Status line ("Available / open to remote roles · Jakarta UTC+7"), full name (surname
   in a foreground→primary gradient), a typed role line that cycles through three phrases, and the lede.
   CTAs: **View experience →** (primary), **Download CV ↓**, **GitHub ↗**. On the right sits the
   **Integration Console**: an SVG diagram (Portal Timesheet, Talenta HR, Payment gateways →
   .NET/Go middleware → SAP, Finance ledger) with packets moving along the wires, a
   pulsing core and a 3-line event log. The console is labelled **SIMULATED FLOW**.
   The role phrases, in order: "Backend & Integration Engineer", ".NET Core · Go · SQL Server",
   "SAP / HR / payments middleware". The log lines, the featured Context/Approach/Outcome copy and
   all other hero text are taken verbatim from the reference mockup.
3. **KPI strip.** One HUD panel with four static figures: 7+ yrs, 1,000+/day (BI-FAST),
   5,000+ cardholders, −40% processing errors. There are no count-up animations.
4. **Experience (`// 01`).** A pipeline timeline: a vertical primary-coloured line with a travelling pulse
   and one node per job. Each job is a HUD card with the period, company, industry, role, system modules
   (name, one line, route tag such as `Talenta HR → SAP`), stack chips and impact chips.
   It has four entries from the CV: Bluebird, Bank Raya, Bayer, Thortech.
5. **Projects (`// 02`).** All eight entries from `projects.ts`:
   - **Featured case study:** Talenta → SAP Integration, with Context → Approach → Outcome
     steps, its full stack chips, and **Read case study →** and **GitHub ↗** links.
   - **Professional systems** (2 columns): E-Timesheet, Banking Middleware APIs,
     E-Credit Management, E-Management of Change.
   - **Personal builds** (3 columns): StockLedger, Habit Tracker, Meal Planner.
   - Each card shows the type tag, organisation (professional only), problem, `↳` impact,
     the first four stack chips plus "+N more", and its links. Cards with no case-study page
     (`clickable: false`) show "Internal system · private". Cards without a repo show
     "Private codebase" in place of the GitHub link.
6. **Tech stack (`// 03`).** The CV's five categories and 35 skills, word for word.
   Backend spans two columns.
   - Backend: .NET Core, C#, ASP.NET, Golang, gRPC, RESTful APIs, PHP, Laravel, Microservices,
     API Gateway, Clean Architecture, Background Services
   - Frontend: React.js, JavaScript, Material UI, Bootstrap, HTML, CSS
   - Databases: SQL Server, MySQL, Relational Database Design, Query Optimization
   - Tools & DevOps: Git, GitHub, GitLab, Postman, Jira, Docker, CI/CD, Jenkins
   - Other: Agile / Scrum, SAP Integration, API Documentation, Claude Code, Agentic AI

   Logos come from devicon **pinned to `v2.16.0`** on jsDelivr (not `@latest`). Concept skills
   with no real logo use a neutral glyph in the primary colour, not another brand's logo.
7. **Contract (`// also available`).** A compact HUD panel that keeps the four existing offerings and
   their order (Enterprise System Integration first). **Discuss a project →** opens the existing
   `ContactFormDialog`, which is currently unused.
8. **Contact.** A terminal-styled panel titled "Hiring for backend or integration work?" with
   `$ contact --email …`, `$ open linkedin…`, `$ open github…` and
   `$ download Muhammad-Puntodewo-Fadhillah-CV.pdf`.
9. **Footer.** A mono line with the copyright and degree.

**Removed from the homepage:** `TrustMetrics` (replaced by the KPI strip), `WorkProcess`, `About`,
and `FinalCTA` (replaced by Contact). These components and any tests that cover them are deleted.

## Components and data

| Unit | Responsibility | Notes |
|---|---|---|
| `src/index.css` + `tailwind.config.ts` | tokens, fonts, `hud` / `glowcard` / `grid-backdrop` utilities | Replace `glass`, `gradient-text`, `gradient-border` and `glow` everywhere |
| `Navbar.tsx` | brand, links, toggle, résumé, scroll progress | Reuses `ThemeToggle` |
| `Hero.tsx` | identity, typed role, CTAs | Uses `IntegrationConsole` |
| `IntegrationConsole.tsx` (new) | SVG diagram, packets, event log | Self-contained and decorative. The log is `aria-hidden`. The figure has an `aria-label` |
| `KpiStrip.tsx` (new) | four static figures | Replaces `TrustMetrics.tsx` |
| `Experience.tsx` | pipeline timeline | Data updated to the four CV roles, with modules and route tags |
| `Projects.tsx` | featured + two groups | Reads `projects.ts` |
| `src/data/projects.ts` | project data | Add `org?: string`, `group: "professional" \| "personal"`, `featured?: boolean`, `highlight?: { context; approach; outcome }` (featured only) |
| `TechStack.tsx` | five categories | Data replaced with the CV list above |
| `Services.tsx` | contract panel | Keeps the four titles and their order, so `Services.test.tsx` stays valid |
| `Contact.tsx` (new) | terminal contact block | Replaces `FinalCTA.tsx` |
| `Footer.tsx` | mono footer | Restyle only |
| `ProjectDetail.tsx` + `components/project/*` | case-study pages | **Restyle only.** Switch to the new tokens and utilities. No structural or content change |
| `src/lib/resume.ts` (new) | `RESUME_URL`, `RESUME_FILENAME` constants | Single source for all three résumé links |
| `public/Muhammad-Puntodewo-Fadhillah-CV.pdf` | the CV | Copied from `CV Puntodewo - 2026.10.25.pdf` |

Case-study links use React Router (`/project/:slug`), not absolute URLs, so they work on
Cloudflare Pages and on any future domain.

## Motion and accessibility

- **Effects:** scroll reveal (framer-motion `whileInView`, once), packet flow
  (SVG `animateMotion`), dashed wire flow, core pulse, typed role, log ticker (every ~1.7s, three
  lines visible), timeline pulse, cursor-follow glow on cards, and the scroll progress line.
- **`prefers-reduced-motion: reduce` turns all of these off.** The role line then shows its first phrase in full,
  packets are hidden, the log stays static, and reveals render immediately. Use framer-motion's
  `useReducedMotion` in components and a CSS media query for the CSS animations.
- **Semantics:** headings are `h1` (name), `h2` (sections) and `h3` (cards). The diagram is a `figure` with an
  `aria-label`. Decorative glyphs and logos get `alt=""`. Every link and button is reachable
  by keyboard with a visible focus ring (`--ring` = `--primary`).
- **Layout:** works at 390px with a 16px gutter and no horizontal scroll. Below 920px the nav links hide
  and the grids collapse to one column (behaviour as in the mockup).

## Metadata and assets

- `index.html`: title "Muhammad Puntodewo Fadhillah — Backend & Integration Engineer". Set the
  author to the full name, and update `og:title` and `og:description` to match the hero lede.
- Remove the `profile-*.webp` preload from `index.html`, since the portrait is no longer rendered and the preload
  would fetch an unused image. The image files stay in `public/` for possible later use.
- Load fonts from Google Fonts (Geist, Geist Mono) and drop the Space Grotesk / DM Sans import.

## Error handling

- **Logos:** a failed logo load leaves the chip text visible. Logos are decorative (`alt=""`) and sized
  14×14 so the layout doesn't shift.
- **Résumé:** the file is static and same-origin, and the links carry the `download` attribute, so a missing file gives a
  normal 404. A test (below) guards the file path.
- **Theme:** persistence is handled by next-themes, which already copes with storage being unavailable.

## Testing

Automated (vitest + Testing Library, alongside the existing suites):

- `TechStack`: renders exactly the five category headings and the 35 skill names listed above.
- `Projects`: renders one featured project plus four professional and three personal projects;
  case-study links point to `/project/<slug>`; internal systems show no case-study link.
- Résumé links: the navbar, hero and contact each render an anchor with `href=RESUME_URL` and
  `download=RESUME_FILENAME`, and `public/<RESUME_FILENAME>` exists on disk.
- `Hero`: with reduced motion mocked, the full first role phrase is rendered and no typing timer
  starts.
- Existing suites (`Services`, `ProjectDetail`, `components/project/*`) still pass. Remove tests
  for deleted components along with them.
- `npm run build` and `npm run lint` pass.

Manual: compare against the reference mockup at 1440px and 390px in dark and light, and check that
the CV downloads under its filename and that case-study routes open on a hard refresh (Cloudflare
SPA fallback).

## Out of scope

- A new headshot or portrait treatment.
- Structural or content changes to case-study pages.
- A contact backend (the dialog keeps composing a `mailto:`).
- Custom domain or DNS work, and changes to the Cloudflare deployment.
- Rewriting the CV. Known gaps (3 vs 8 projects, "Daily Habit Tracker" naming, TypeScript,
  Blazor, EF Core and Hangfire missing from the skills list) are noted for the owner, not handled here.
