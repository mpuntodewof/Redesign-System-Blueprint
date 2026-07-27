# Portfolio Case Studies & Freelance Positioning — Design

**Date:** 2026-07-27
**Status:** Approved (design), pending flagship content interviews

## Problem

The site's portfolio and services sections read as an employment record rather than a
freelance offer. Project detail pages carry Overview, Key Features, and Tech Stack —
enough to describe *what* was built, but not enough to show *how it was engineered* or
*what it was worth*. A prospective client cannot tell from the current pages whether the
author can be trusted with a comparable system.

The goal is to deepen project pages into case studies with visible architecture and
quantified business value, and to rewrite the service offerings around what that
portfolio actually demonstrates.

## Scope

In scope:

- Extend the `Project` schema with optional `caseStudy`, `architecture`, and
  `businessValue` fields.
- Restructure `ProjectDetail.tsx` to render the five-section flow, extracting new
  sections into dedicated components.
- Populate two flagship projects with full content.
- Rewrite the Services section once flagship content exists.

Out of scope:

- Changes to the homepage project cards (`Projects.tsx`) beyond what the schema requires.
- Any change to Experience, About, Hero, or the contact flow.
- Pricing pages, booking integrations, or CMS migration.

## Approach

Content is the binding constraint, not code. Case Study and Architecture content comes
from the author's memory, not from the repository, so the design deliberately separates
the structural work (fast, complete, done once) from the content work (slow, per-project,
ongoing).

Every new field is optional. Every new section renders only when its data is present.
This means all seven projects keep working from the moment the schema lands, and content
can be added project by project without further code changes.

Two projects get full content immediately, chosen for defensibility rather than recency:

- **Banking Middleware APIs** (PT Bank Raya) — regulated fintech, BI-FAST interbank
  transfers, hard throughput numbers.
- **Talenta → SAP Integration** (PT Bluebird Group) — enterprise SAP integration, the
  least commoditized skill in the portfolio.

The remaining five render today's layout until content is written for them.

## Data Model

Added to `src/data/projects.ts`, alongside the existing `Project` interface. All fields
optional; existing fields unchanged.

```ts
export interface CaseStudy {
  context: string;    // the system landscape before the work started
  challenge: string;  // what made it genuinely hard
  approach: string;   // key decisions, and the alternatives rejected
  outcome: string;    // what shipped, and what measurably changed
}

export interface ArchitectureNode {
  id: string;
  label: string;  // primary name, e.g. "Talenta Receiver"
  sub?: string;   // one-line qualifier rendered smaller beneath the label,
                  // e.g. ".NET Core" or "Hangfire worker". Omit when the
                  // label alone is self-explanatory.
  group: "source" | "service" | "store" | "target";
}

export interface ArchitectureEdge {
  from: string;   // must match an ArchitectureNode.id
  to: string;     // must match an ArchitectureNode.id
  label?: string;
}

export interface ArchitectureDecision {
  title: string;
  detail: string;
}

export interface Architecture {
  summary: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  decisions?: ArchitectureDecision[];
}

export interface BusinessMetric {
  value: string;  // "40%", "1,000+", "5,000+"
  label: string;  // "fewer processing errors"
}
// Two to four metrics per project. Below two, the row reads as an orphan
// statistic and the narrative carries it better; above four, no single
// number registers. The renderer lays out 2-4 across on desktop and two
// per row on mobile; a fifth metric and beyond is not rendered.

export interface BusinessValue {
  metrics: BusinessMetric[];
  narrative: string;
}

export interface Project {
  // ...existing fields unchanged...
  caseStudy?: CaseStudy;
  architecture?: Architecture;
  businessValue?: BusinessValue;
}
```

### Why architecture is structured data, not an image

Nodes and edges are rendered as inline SVG rather than embedded as an exported diagram.
This inherits each project's `headerGradient`, works in both light and dark themes,
stays legible at mobile widths, adds no external dependency, and cannot go stale relative
to the surrounding copy. An exported PNG would fail on at least the first three counts.

This also removes any dependency on the Mermaid Chart and Excalidraw connectors, which
are unauthorized in the current environment.

### Why business metrics are a distinct field

The numbers that matter — 40% fewer processing errors, 1,000+ daily transactions, 5,000+
cardholders — currently exist only inside prose paragraphs. Promoting them to structured
data allows them to render as a scannable metric row, which is the first thing a
prospective client's eye reaches on a case study page.

## Page Structure

`ProjectDetail.tsx` renders, in order:

1. **Header** — unchanged (gradient, type badge, title, impact line).
2. **Project Overview** — existing `overview` field.
3. **Case Study** — four labeled blocks: Context, Challenge, Approach, Outcome.
4. **Architecture** — full-width. SVG diagram, summary, then Key Decisions as cards.
5. **Business Value** — metric row above narrative.
6. **Key Features** — retained, demoted below Business Value.
7. **Sidebar** — Tech Stack, GitHub link, Back button. Unchanged.

Sections 2, 3, 5, and 6 sit in the existing two-column grid's left column. Section 4
breaks full-width; a diagram constrained to two-thirds width is not legible on a laptop,
let alone a tablet.

Tech Stack remains in the sidebar rather than being promoted inline. It is reference
material a reader scans, not narrative they read, and the sidebar already serves it well.

### Component boundaries

`ProjectDetail.tsx` is currently 222 lines and would roughly double if the new sections
were added inline. New sections are extracted to `src/components/project/`:

| Component | Responsibility | Depends on |
|---|---|---|
| `CaseStudy.tsx` | Renders four labeled prose blocks | `CaseStudy` data, `headerGradient` |
| `ArchitectureDiagram.tsx` | Lays out nodes/edges as SVG; renders summary and decisions | `Architecture` data, `headerGradient` |
| `BusinessValue.tsx` | Renders metric row and narrative | `BusinessValue` data |

`ProjectDetail.tsx` becomes a thin composition: fetch project by slug, render header,
sidebar, and conditionally each section.

`ArchitectureDiagram.tsx` is the only component with non-trivial logic — it computes
layout positions from a node graph. It is isolated for that reason and is the one
component here that warrants unit tests.

### Layout algorithm for ArchitectureDiagram

Nodes are grouped into columns by their `group` field, in fixed order:
`source → service → store → target`. Within a column, nodes stack vertically and are
centered against the tallest column. Edges are drawn as orthogonal paths between column
positions, with optional labels at the midpoint.

This is a deliberately constrained layout. It handles the left-to-right data-flow
diagrams that describe every project in this portfolio, and it fails predictably for
graphs that do not fit that shape — which is preferable to a general graph layout that
produces subtly poor results.

Mobile behavior: below the `md` breakpoint the SVG is abandoned rather than scaled. Groups
render as a vertical stack of cards in the same `source → service → store → target` order,
separated by a downward chevron between groups. Edge labels are dropped; where an edge
label carries meaning not already in the summary, that meaning belongs in
`architecture.summary`, which is visible at every width.

The alternative — keeping the SVG and allowing horizontal scroll — was rejected because a
diagram a reader must drag sideways to parse is one most will skip.

## Content Plan

### Full content (interview-driven)

**Banking Middleware APIs** and **Talenta → SAP Integration** receive `caseStudy`,
`architecture`, and `businessValue`.

Content is gathered by interview, not inferred from the existing copy. Required per
project:

- The system landscape before the work began.
- The hardest technical constraint — peak load, SAP's RFC contract, idempotency under
  retry, or otherwise.
- One or two decisions the author would defend under questioning, and the alternative
  rejected in each case.
- How the outcome was measured, including anything that cannot be disclosed.

### Structure only

The remaining five projects — E-Timesheet, E-Management of Change, E-Credit Management,
StockLedger, Habit Tracker — receive no new content in this pass. They render the
existing layout via the optional-field fallbacks.

### Confidentiality constraint

Both flagship projects are named employer systems: a bank and a listed transport group.
Published architecture diagrams must stay at the component level one would draw on a
whiteboard during a job interview.

Explicitly excluded from all published content:

- Internal hostnames, IP ranges, and environment names.
- Vendor-specific endpoint paths and integration credentials.
- Database table schemas and column-level detail.
- Authentication and authorization mechanisms.

The Bank Raya material should be reviewed for clearance before publication.

## Testing

- `ArchitectureDiagram.tsx` — unit tests for layout: node grouping into columns, edge
  path generation, empty and single-node graphs, and graceful handling of an edge whose
  `from`/`to` does not match a known node id.
- `ProjectDetail.tsx` — rendering tests confirming that a project with no optional fields
  renders exactly today's sections, and that each optional field independently adds its
  section.
Current state: Vitest is configured (`vitest.config.ts`, `src/test/setup.ts`) but
`package.json` defines no `test` script and `src/test/example.test.ts` is a placeholder.
There is no existing suite to regress against, so the rendering tests above are the only
guard on the optional-field design and must be written alongside the schema change rather
than after it.

Adding a `test` script to `package.json` is part of step 1.

## Services Rewrite

Sequenced after the flagship case studies, because service copy should cite them.

Four proposed offerings, ordered by defensibility:

1. **Enterprise System Integration** — the strongest and least commoditized offering.
   SAP RFC integrations carrying payroll data, banking middleware, multi-branch ASEAN
   systems. Becomes the headline service.
2. **Backend API Development (.NET)** — layered architecture, Repository Pattern,
   OpenAPI contracts, background processing with Hangfire.
3. **Legacy Modernization & Performance Recovery** — backed by hard numbers (40% error
   reduction, peak-load SQL tuning). Framed as audit-then-fix, which sells easily because
   the client already feels the pain.
4. **Workflow & Approval Automation** — E-Timesheet, E-MOC, and E-Credit are the same
   underlying product: multi-level approval with audit trails under compliance pressure.
   Built four times, therefore repeatable, therefore where freelance margin lives.

**Demoted:** the current "Full-Stack Web Applications" offering. It is the most crowded
category on every freelance marketplace and the portfolio's weakest differentiator.
Full-stack capability is better mentioned inside the other offers than sold as its own.

Two inputs are still required before service copy can be written, and are deliberately
deferred:

- Target market — Indonesian/ASEAN local clients, or international remote.
- Whether pricing signals appear on the page at all.

## Sequencing

1. Schema extension and component extraction, with tests. Unblocks everything else.
2. Flagship interview and content for Talenta → SAP.
3. Flagship interview and content for Banking Middleware, subject to clearance review.
4. Services rewrite, once the two case studies exist to cite.

Steps 2 and 3 are independent of each other and both depend only on step 1.

## Open Questions

- Does the Bank Raya material require formal clearance, and from whom?
- Target market for the services rewrite: local ASEAN or international remote?
- Should the page display pricing signals (day rate, project minimum, "from $X"), or
  route all pricing conversation through the contact form?
