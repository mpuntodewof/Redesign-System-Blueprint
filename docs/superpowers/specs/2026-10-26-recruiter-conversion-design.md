# Recruiter & Client Conversion — Design

**Date:** 2026-10-26
**Branch:** `feat/particle-morph` (builds on the Particle Morph redesign)
**Status:** Approved in brainstorming, awaiting spec review

## Goal

Turn visits into conversations. The owner shares the site link himself (LinkedIn profile, job applications, cold emails, Upwork/Contra proposals), so the work optimises **the first 10 seconds, the link preview, and the effort needed to make contact**. Search visibility is a cheap secondary benefit, not the target.

One site serves three visitor intents without splitting into separate landing pages:

| Visitor | Checks first | Converts by |
|---|---|---|
| Local full-time recruiter | role fit, seniority, stack, location | CV download, LinkedIn, email |
| Remote recruiter (contract or full-time) | the above plus time-zone overlap, English, remote track record | a short message |
| Freelance / part-time client | "can he solve my problem", capacity, how an engagement works | sending a brief |

## Facts the copy relies on (confirmed by the owner)

- Contract, part-time and project work: **~20 h/week**, alongside a full-time role.
- Full-time roles: open, **1-month notice**.
- English: **fluent**.
- Payment for contract work: **flexible**.
- Working window (not published): weekday 04:00–07:00 and 19:00–21:00 WIB, weekend blocks. Published only as its effect: **live overlap with US-East afternoons and EU midday**, async-first.
- No testimonials exist yet. Nothing is invented; a quote strip is out of scope until real recommendations exist.

## Scope

### 1. Hero (`src/components/Hero.tsx`)

- Status line becomes: `Available · contract & part-time (~20 h/week) · open to full-time roles`.
- Buttons: primary **"Work with me →"** (`#work`), then **"Download CV ↓"**, **"GitHub ↗"**. "View experience" is removed from the hero; the navbar still links to Experience.
- New proof line under the lede, mono style: `7+ years · banking, transport, pharma · systems running 24/7 in production`.
- Particle stage, headline animation and typed roles unchanged.
- The CV must still be downloadable from exactly three places (navbar, hero, contact); `Index.test.tsx` enforces this.

### 2. "Work with me" section (replaces `src/components/Services.tsx`)

- New component `src/components/WorkWithMe.tsx`, section `id="work"`, same position as the old Contract section (after Stack, before Contact), same particle stage (`data-stage="3"`, `data-stage-x="0.5"`) with `data-stage-dim="0.35"`. Unlike the other homepage sections it uses the **full content width** (three cards do not fit the 620 px side column), so the field dims behind it.
- Section heading: `// 04 Work with me`, meta line `3 ways to engage`.
- Three cards: stacked below `md`, three equal columns from `md`. Each card is an `article` with its own `id`:

  **`work-full-time` — Full-time roles**
  - Summary: "Backend & integration roles, remote or Jakarta-based."
  - Facts list: Jakarta · UTC+7 · remote-ready; Fluent English; 1-month notice.
  - Actions: **Download CV ↓**, **LinkedIn ↗**.

  **`work-contract` — Contract & part-time**
  - Summary: "Ongoing backend or integration work, ~20 h/week."
  - Facts list: Async-first, written weekly update; Live overlap: US-East afternoons, EU midday; Flexible payment and contract setup.
  - Action: **Ask about availability →** opens the contact form with intent `contract`.

  **`work-project` — Project work**
  - Summary: "Fixed-scope integrations, APIs and performance audits."
  - Offerings (the four existing services, integration first): Enterprise System Integration; Backend & API Development; Legacy Modernisation & Performance; Workflow & Approval Automation.
  - "How it works": ① Send a brief → ② 20-min call → ③ Written scope, timeline & quote → ④ Build with weekly demos.
  - Action: **Send a brief →** opens the contact form with intent `project`.

- **CV-link rule:** the Full-time card adds a fourth CV download (navbar, hero, Full-time card, Contact). It is the place a full-time recruiter lands from a shared `#work-full-time` link, and the CV is the action they want. `Index.test.tsx` changes from "exactly three places" to "exactly four places".

- **Deep-link highlight:** when the page loads or the hash changes to `#work-full-time`, `#work-contract` or `#work-project`, the page scrolls to that card and adds a `is-targeted` class for 2.4 s (glowing border pulse, CSS only). Under reduced motion the border is shown statically for the same time without animation. Implemented with a small hook `useHashTarget(ids)` that returns the current targeted id.

- **No pricing rule kept:** no currency figures, "per hour", "day rate", "pricing" or "quote" wording in the section. The existing `Services.test.tsx` assertions move to `WorkWithMe.test.tsx`; the "quote" check is relaxed to allow the process step "Written scope, timeline & quote" — the test instead forbids currency amounts and rate wording (`/\$\s?\d|\bper hour\b|\bhourly\b|\bday rate\b|\bpricing\b|\bget a quote\b/i`, which the step text does not match).

### 3. Contact form (`src/components/ContactFormDialog.tsx`)

- **Delivery:** POST JSON to `https://api.web3forms.com/submit` with `access_key` from `import.meta.env.VITE_WEB3FORMS_KEY`. Email lands in the owner's Gmail; Web3Forms sets reply-to to the visitor's email (`replyto` field).
- **Without a key** (env var empty) or on network/API failure: the form keeps the current `mailto:` behaviour. On API failure the dialog shows an inline error with a "Send via email instead" link that opens the prefilled `mailto:`.
- **Success state:** the dialog body is replaced by a confirmation ("Thanks — I reply within 1–2 working days.") with a Close button; a sonner toast is also shown.
- **Spam:** hidden honeypot field `botcheck` (Web3Forms convention), visually hidden and `tabIndex={-1}`; submissions with it filled are dropped client-side.
- **Fields:**
  1. **I'm interested in** (required select): `Full-time role` / `Contract & part-time` / `Project` — value preset from the opener (`intent` prop), default `project`.
  2. Name (required), Email (required, validated).
  3. **Timeline** (optional free text, placeholder "e.g. start next month, 3 months").
  4. **Budget or rate range** (optional free text, placeholder "any currency, or leave blank").
  5. Message (required, min 10 chars), placeholder adapts to intent.
- Removed: the `$` budget select, the "within 24 hours" promise.
- Title adapts to intent: "Start a project" / "Contract & part-time enquiry" / "Full-time opportunity". Description: "I reply within 1–2 working days."
- Styling moves to the site palette (the purple gradient button is replaced by `btn btn-primary`); WhatsApp and LinkedIn alternative links stay.
- Payload subject: `"[Portfolio] {intent label} — {name}"`; `from_name`: "Portfolio contact form".
- The dialog becomes reusable: `WorkWithMe` and `Contact` both open it through one `ContactFormDialog` instance owned by `Index` (state `{ open, intent }`), passed down via a small context `ContactDialogProvider` + `useContactDialog()`.

### 4. Contact section (`src/components/Contact.tsx`)

- Terminal lines unchanged, plus a first line `$ reply --within "1–2 working days"` (informational) and a final line `$ send --brief` rendered as a button that opens the form with intent `project`.

### 5. Link previews and page metadata

- **`SITE_URL`** constant in `src/lib/profile.ts` (`https://redesign-system-blueprint.puntodewofadhillah.workers.dev`), the single place to change when a custom domain is bought. The Worker reads the same module.
- **Preview image** `public/og-image.png`, 1200×630, under 300 KB: navy background, still frame of the particle sphere on the right, name, "Backend & Integration Engineer", availability line. Produced by a script `scripts/og-image.mjs` that screenshots a dedicated HTML template (`scripts/og-template.html`) with Playwright and is run manually (`npm run og:image`); the PNG is committed.
- **`index.html` tags** added: `og:url`, `og:site_name`, `og:image` (+ width/height/alt), `twitter:image`, `link rel="canonical"`.
- **In-app titles:** hook `useDocumentMeta({ title, description })` sets `document.title` and the description meta on Index, ProjectDetail and ExperienceDetail, restoring the defaults on unmount.
  - Project: `"{title} — Case study · M. Puntodewo Fadhillah"`, description = `project.impact`.
  - Experience: `"{role} at {company} · M. Puntodewo Fadhillah"`, description = first module names joined.
- **Edge metadata Worker** (`worker/index.ts`, wired in `wrangler.jsonc` with `"main": "worker/index.ts"`, an `ASSETS` binding and `"run_worker_first": ["/project/*", "/experience/*"]`):
  - Fetches the SPA shell from `env.ASSETS`, then uses `HTMLRewriter` to replace `<title>`, `meta[name=description]`, `og:title`, `og:description`, `og:url`, `link[rel=canonical]` for known project/experience slugs.
  - Metadata is built by a pure function `metaForPath(pathname)` in `src/lib/pageMeta.ts`, shared by the Worker and `useDocumentMeta`, so titles never drift.
  - Unknown slug or any thrown error: return the unmodified asset response.
  - Clickable projects only; `clickable: false` projects get no per-page tags (they have no page).
- **Search basics:** `public/sitemap.xml` listing `/`, every clickable `/project/{slug}` and every `/experience/{slug}`, generated at build time by `scripts/sitemap.mjs` (run from `npm run build` before `vite build`) from the same data. `robots.txt` gains a `Sitemap:` line. JSON-LD `Person` in `index.html` (name, jobTitle, address Jakarta/ID, email, sameAs LinkedIn + GitHub, knowsAbout top skills).

## Out of scope

Testimonials strip, Cal.com booking, click/event analytics, custom domain purchase, separate per-audience landing pages, pricing.

## Owner actions (documented in the final hand-off, not code)

1. Create a Web3Forms access key for `puntodewofadhillah@gmail.com`; add it as `VITE_WEB3FORMS_KEY` in `.env.local` and in Cloudflare Workers Builds → Variables (build-time).
2. Later: buy a domain, attach it to the Worker, change `SITE_URL`, regenerate the sitemap.
3. Update the CV PDF and LinkedIn "Website" field to the new URL.
4. Ask 2–3 former colleagues for LinkedIn recommendations.

## Error handling summary

| Failure | Behaviour |
|---|---|
| No Web3Forms key | Form uses `mailto:` as today |
| Web3Forms error / offline | Inline error + "Send via email instead" link; form data kept |
| Honeypot filled | Silently treated as success, nothing sent |
| Worker throws / unknown slug | Original SPA shell served unchanged |
| Unknown hash | No highlight, normal anchor behaviour |

## Testing

- `WorkWithMe.test.tsx`: three cards with ids; card facts (fluent English, 1-month notice, ~20 h/week); integration offering listed first; no-pricing regex; contract/project buttons open the dialog with the right intent.
- `useHashTarget.test.ts`: targets a known id from the hash, ignores unknown ids, clears after the timeout.
- `ContactFormDialog.test.tsx`: intent preselection and title; validation; Web3Forms payload (mocked `fetch`) including subject and `replyto`; success state; API failure shows the email fallback link; no key → `mailto:`; honeypot blocks sending; no `$` amounts and no "24 hours".
- `pageMeta.test.ts`: titles/descriptions for a project, an experience role, a `clickable: false` slug (null), unknown paths (null).
- `worker/index.test.ts`: rewrites tags for `/project/talenta-sap-integration`; passes unknown paths through untouched (HTMLRewriter mocked or tested via the pure `metaForPath` plus a thin rewriter adapter).
- `Index.test.tsx`: section order `experience, projects, stack, work, contact`; CV link count updated to 4.
- `Hero.test.tsx`: availability line, "Work with me →" points to `#work`.
- Manual after deploy: LinkedIn Post Inspector and opengraph.xyz for `/` and one case-study URL; submit one real form message.
