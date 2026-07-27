# Portfolio Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend project detail pages from Overview/Features/Stack into a five-section case study flow — Overview, Case Study, Architecture, Business Value, Features — using optional schema fields so existing projects keep rendering unchanged.

**Architecture:** Three new presentational components under `src/components/project/`, each driven by one optional field on the `Project` interface. `ProjectDetail.tsx` becomes a thin composition that conditionally renders each. Architecture diagrams are structured node/edge data rendered as inline SVG (desktop) and stacked cards (mobile), never an imported image.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, framer-motion, react-router-dom v6, Vitest + @testing-library/react (jsdom).

**Spec:** `docs/superpowers/specs/2026-07-27-portfolio-case-studies-design.md`

---

## Conventions

Read before starting any task.

**Test commands.** `npm test` runs once; `npm run test:watch` watches. Run a single file with
`npx vitest run src/path/to/file.test.tsx`. Vitest has `globals: true`, so `describe`,
`it`, and `expect` need no import. The `@` alias maps to `src/`.

**Styling.** Use only existing project utilities — `glass` (translucent card),
`gradient-text` (gradient heading span), `glow` (hover shadow). All are defined in
`src/index.css` with light and dark variants. Do not add new CSS files and do not
hardcode hex colors; per-project color comes from `project.headerGradient`, a
`[string, string]` tuple of raw HSL triplets such as `"239 84% 67%"`, used as
`` `hsl(${color1})` `` or `` `hsl(${color1} / 0.15)` ``.

**Section heading pattern.** Every section heading in `ProjectDetail.tsx` follows
`<h2 className="font-heading text-2xl font-bold mb-4">Plain <span className="gradient-text">Accent</span></h2>`.
Match it exactly.

**Animation.** Sections use framer-motion with
`initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` and a stagger via
`transition={{ delay: N }}`. Existing delays are 0.2 (Overview), 0.3 (Features),
0.4 (sidebar). New sections slot in and later delays shift; each task states its value.

**Commits.** Commit after each task. Use `feat:` for new capability, `fix:` for
corrections, `test:` for test-only changes.

**Branch.** Work happens on `portfolio-case-studies`, already created and holding the
spec commits.

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `src/data/projects.ts` | Project data and type definitions | Modify — add 3 optional fields + 6 exported interfaces |
| `src/components/project/CaseStudy.tsx` | Renders four labeled prose blocks | Create |
| `src/components/project/ArchitectureDiagram.tsx` | Node/edge layout as SVG + mobile stack | Create |
| `src/components/project/BusinessValue.tsx` | Metric row + narrative | Create |
| `src/components/project/layout.ts` | Pure column/edge geometry helpers | Create |
| `src/pages/ProjectDetail.tsx` | Composition; conditional section rendering | Modify |
| `src/components/project/*.test.tsx` | Component tests | Create |
| `src/pages/ProjectDetail.test.tsx` | Integration tests for conditional rendering | Create |

Layout math lives in `layout.ts`, separate from the component, because it is pure
input-to-output logic that is far easier to test directly than through rendered SVG.

---

## Task 1: Schema extension

**Files:**
- Modify: `src/data/projects.ts:1-13`

- [ ] **Step 1: Add the new interfaces above the existing `Project` interface**

Insert at the top of `src/data/projects.ts`, before `export interface Project`:

```ts
export interface CaseStudy {
  context: string;
  challenge: string;
  approach: string;
  outcome: string;
}

export type ArchitectureGroup = "source" | "service" | "store" | "target";

export interface ArchitectureNode {
  id: string;
  label: string;
  sub?: string;
  group: ArchitectureGroup;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
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
  value: string;
  label: string;
}

export interface BusinessValue {
  metrics: BusinessMetric[];
  narrative: string;
}
```

- [ ] **Step 2: Add the three optional fields to `Project`**

In the existing `Project` interface, after `clickable?: boolean;`, add:

```ts
  caseStudy?: CaseStudy;
  architecture?: Architecture;
  businessValue?: BusinessValue;
```

- [ ] **Step 3: Verify the project still typechecks and builds**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output, exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/data/projects.ts
git commit -m "feat: add optional caseStudy, architecture, businessValue to Project"
```

---

## Task 2: Fix the unconditional GitHub card

This is a live bug, independent of new content: `ProjectDetail.tsx` renders the GitHub
card even when `githubUrl` is `""`, producing a dead link. E-MOC and E-Credit already
carry empty values. The spec also depends on this for the Banking Middleware
no-source-link rule.

**Files:**
- Create: `src/pages/ProjectDetail.test.tsx`
- Modify: `src/pages/ProjectDetail.tsx:181-199`

- [ ] **Step 1: Write the failing test**

Create `src/pages/ProjectDetail.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProjectDetail from "./ProjectDetail";

function renderProject(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/project/${slug}`]}>
      <Routes>
        <Route path="/project/:slug" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProjectDetail GitHub card", () => {
  it("renders the GitHub card when githubUrl is present", () => {
    renderProject("stockledger");
    expect(screen.getByText("View on GitHub")).toBeInTheDocument();
  });

  it("omits the GitHub card when githubUrl is empty", () => {
    renderProject("e-credit-management");
    expect(screen.queryByText("View on GitHub")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify the second case fails**

Run: `npx vitest run src/pages/ProjectDetail.test.tsx`
Expected: first test PASSES, second FAILS — the card renders when it should not.

- [ ] **Step 3: Make the card conditional**

In `src/pages/ProjectDetail.tsx`, wrap the entire `<a href={project.githubUrl} ...>`
element (currently lines 181-199) in a guard. The opening becomes:

```tsx
{project.githubUrl && (
  <a
    href={project.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="glass rounded-2xl p-6 flex items-center gap-4 group hover:glow transition-all duration-300 cursor-pointer block"
  >
```

and the element's closing `</a>` becomes `</a>\n)}`. Leave the card's inner markup
untouched.

- [ ] **Step 4: Run the test to verify both pass**

Run: `npx vitest run src/pages/ProjectDetail.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProjectDetail.tsx src/pages/ProjectDetail.test.tsx
git commit -m "fix: hide GitHub card when project has no source URL"
```

---

## Task 3: Layout geometry helpers

Pure functions, no React. Extracted so the diagram's math is testable without rendering
SVG.

**Files:**
- Create: `src/components/project/layout.ts`
- Create: `src/components/project/layout.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/project/layout.test.ts`:

```ts
import { groupNodes, computePositions, resolveEdges, GROUP_ORDER } from "./layout";
import type { ArchitectureNode, ArchitectureEdge } from "@/data/projects";

const nodes: ArchitectureNode[] = [
  { id: "a", label: "Source A", group: "source" },
  { id: "b", label: "Service B", group: "service" },
  { id: "c", label: "Service C", group: "service" },
  { id: "d", label: "Target D", group: "target" },
];

describe("groupNodes", () => {
  it("buckets nodes into groups in canonical order", () => {
    const result = groupNodes(nodes);
    expect(result.map((c) => c.group)).toEqual(["source", "service", "target"]);
    expect(result[1].nodes.map((n) => n.id)).toEqual(["b", "c"]);
  });

  it("omits groups with no nodes", () => {
    const result = groupNodes([{ id: "a", label: "A", group: "source" }]);
    expect(result).toHaveLength(1);
  });

  it("returns an empty array for no nodes", () => {
    expect(groupNodes([])).toEqual([]);
  });

  it("orders groups canonically regardless of input order", () => {
    const shuffled: ArchitectureNode[] = [
      { id: "d", label: "D", group: "target" },
      { id: "a", label: "A", group: "source" },
    ];
    expect(groupNodes(shuffled).map((c) => c.group)).toEqual(["source", "target"]);
  });
});

describe("computePositions", () => {
  it("assigns each node an x by column and centers columns vertically", () => {
    const positions = computePositions(groupNodes(nodes));
    expect(positions.a.x).toBeLessThan(positions.b.x);
    expect(positions.b.x).toBeLessThan(positions.d.x);
    // single-node columns centre against the tallest column (2 nodes)
    expect(positions.a.y).toBeGreaterThan(positions.b.y);
    expect(positions.b.y).toBeLessThan(positions.c.y);
  });

  it("handles a single node", () => {
    const positions = computePositions(groupNodes([{ id: "solo", label: "S", group: "service" }]));
    expect(positions.solo).toBeDefined();
    expect(positions.solo.x).toBe(0);
  });
});

describe("resolveEdges", () => {
  it("resolves edges whose endpoints both exist", () => {
    const positions = computePositions(groupNodes(nodes));
    const edges: ArchitectureEdge[] = [{ from: "a", to: "b", label: "sync" }];
    const resolved = resolveEdges(edges, positions);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].label).toBe("sync");
  });

  it("drops edges referencing an unknown node id", () => {
    const positions = computePositions(groupNodes(nodes));
    const edges: ArchitectureEdge[] = [
      { from: "a", to: "b" },
      { from: "a", to: "ghost" },
      { from: "ghost", to: "d" },
    ];
    expect(resolveEdges(edges, positions)).toHaveLength(1);
  });
});

describe("GROUP_ORDER", () => {
  it("flows source to target", () => {
    expect(GROUP_ORDER).toEqual(["source", "service", "store", "target"]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/project/layout.test.ts`
Expected: FAIL — cannot resolve `./layout`.

- [ ] **Step 3: Implement the helpers**

Create `src/components/project/layout.ts`:

```ts
import type {
  ArchitectureEdge,
  ArchitectureGroup,
  ArchitectureNode,
} from "@/data/projects";

export const GROUP_ORDER: ArchitectureGroup[] = ["source", "service", "store", "target"];

export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 64;
export const COLUMN_GAP = 72;
export const ROW_GAP = 24;

export interface NodeColumn {
  group: ArchitectureGroup;
  nodes: ArchitectureNode[];
}

export interface Position {
  x: number;
  y: number;
}

export interface ResolvedEdge {
  from: Position;
  to: Position;
  label?: string;
}

/** Bucket nodes into columns, canonical order, skipping empty groups. */
export function groupNodes(nodes: ArchitectureNode[]): NodeColumn[] {
  return GROUP_ORDER.map((group) => ({
    group,
    nodes: nodes.filter((n) => n.group === group),
  })).filter((column) => column.nodes.length > 0);
}

/** Map node id to top-left position. Columns are vertically centred. */
export function computePositions(columns: NodeColumn[]): Record<string, Position> {
  const tallest = Math.max(0, ...columns.map((c) => c.nodes.length));
  const positions: Record<string, Position> = {};

  columns.forEach((column, columnIndex) => {
    const columnHeight = column.nodes.length * NODE_HEIGHT + (column.nodes.length - 1) * ROW_GAP;
    const fullHeight = tallest * NODE_HEIGHT + (tallest - 1) * ROW_GAP;
    const offset = (fullHeight - columnHeight) / 2;

    column.nodes.forEach((node, rowIndex) => {
      positions[node.id] = {
        x: columnIndex * (NODE_WIDTH + COLUMN_GAP),
        y: offset + rowIndex * (NODE_HEIGHT + ROW_GAP),
      };
    });
  });

  return positions;
}

/** Resolve edges to coordinates, dropping any that reference an unknown node. */
export function resolveEdges(
  edges: ArchitectureEdge[],
  positions: Record<string, Position>
): ResolvedEdge[] {
  return edges
    .filter((edge) => positions[edge.from] && positions[edge.to])
    .map((edge) => ({
      from: {
        x: positions[edge.from].x + NODE_WIDTH,
        y: positions[edge.from].y + NODE_HEIGHT / 2,
      },
      to: {
        x: positions[edge.to].x,
        y: positions[edge.to].y + NODE_HEIGHT / 2,
      },
      label: edge.label,
    }));
}

/** Total canvas size needed for a set of columns. */
export function canvasSize(columns: NodeColumn[]): { width: number; height: number } {
  const tallest = Math.max(0, ...columns.map((c) => c.nodes.length));
  return {
    width: Math.max(0, columns.length * NODE_WIDTH + (columns.length - 1) * COLUMN_GAP),
    height: Math.max(0, tallest * NODE_HEIGHT + (tallest - 1) * ROW_GAP),
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/components/project/layout.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/project/layout.ts src/components/project/layout.test.ts
git commit -m "feat: add architecture diagram layout helpers"
```

---

## Task 4: CaseStudy component

**Files:**
- Create: `src/components/project/CaseStudy.tsx`
- Create: `src/components/project/CaseStudy.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/project/CaseStudy.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import CaseStudy from "./CaseStudy";
import type { CaseStudy as CaseStudyData } from "@/data/projects";

const data: CaseStudyData = {
  context: "Two systems exchanged data by spreadsheet.",
  challenge: "Payroll data could not tolerate duplicate writes.",
  approach: "Idempotency keys on every write, with a replay log.",
  outcome: "Manual reconciliation dropped to zero.",
};

describe("CaseStudy", () => {
  it("renders all four block labels", () => {
    render(<CaseStudy data={data} accent="239 84% 67%" />);
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Challenge")).toBeInTheDocument();
    expect(screen.getByText("Approach")).toBeInTheDocument();
    expect(screen.getByText("Outcome")).toBeInTheDocument();
  });

  it("renders the prose for each block", () => {
    render(<CaseStudy data={data} accent="239 84% 67%" />);
    expect(screen.getByText(data.context)).toBeInTheDocument();
    expect(screen.getByText(data.challenge)).toBeInTheDocument();
    expect(screen.getByText(data.approach)).toBeInTheDocument();
    expect(screen.getByText(data.outcome)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/project/CaseStudy.test.tsx`
Expected: FAIL — cannot resolve `./CaseStudy`.

- [ ] **Step 3: Implement the component**

Create `src/components/project/CaseStudy.tsx`:

```tsx
import type { CaseStudy as CaseStudyData } from "@/data/projects";

interface CaseStudyProps {
  data: CaseStudyData;
  accent: string;
}

const CaseStudy = ({ data, accent }: CaseStudyProps) => {
  const blocks: { label: string; body: string }[] = [
    { label: "Context", body: data.context },
    { label: "Challenge", body: data.challenge },
    { label: "Approach", body: data.approach },
    { label: "Outcome", body: data.outcome },
  ];

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div key={block.label} className="border-l-2 pl-5" style={{ borderColor: `hsl(${accent} / 0.4)` }}>
          <h3
            className="font-heading text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: `hsl(${accent})` }}
          >
            {block.label}
          </h3>
          <p className="text-secondary-foreground leading-relaxed">{block.body}</p>
        </div>
      ))}
    </div>
  );
};

export default CaseStudy;
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/components/project/CaseStudy.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/project/CaseStudy.tsx src/components/project/CaseStudy.test.tsx
git commit -m "feat: add CaseStudy component"
```

---

## Task 5: BusinessValue component

Renders 2-4 metrics; a fifth and beyond is dropped per spec.

**Files:**
- Create: `src/components/project/BusinessValue.tsx`
- Create: `src/components/project/BusinessValue.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/project/BusinessValue.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import BusinessValue from "./BusinessValue";
import type { BusinessValue as BusinessValueData } from "@/data/projects";

const data: BusinessValueData = {
  metrics: [
    { value: "40%", label: "fewer processing errors" },
    { value: "1,000+", label: "daily transactions" },
  ],
  narrative: "The platform absorbed peak-hour load without manual intervention.",
};

describe("BusinessValue", () => {
  it("renders each metric value and label", () => {
    render(<BusinessValue data={data} accent="239 84% 67%" />);
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("fewer processing errors")).toBeInTheDocument();
    expect(screen.getByText("1,000+")).toBeInTheDocument();
    expect(screen.getByText("daily transactions")).toBeInTheDocument();
  });

  it("renders the narrative", () => {
    render(<BusinessValue data={data} accent="239 84% 67%" />);
    expect(screen.getByText(data.narrative)).toBeInTheDocument();
  });

  it("renders at most four metrics", () => {
    const many: BusinessValueData = {
      metrics: [
        { value: "1", label: "one" },
        { value: "2", label: "two" },
        { value: "3", label: "three" },
        { value: "4", label: "four" },
        { value: "5", label: "five" },
      ],
      narrative: "n",
    };
    render(<BusinessValue data={many} accent="239 84% 67%" />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/project/BusinessValue.test.tsx`
Expected: FAIL — cannot resolve `./BusinessValue`.

- [ ] **Step 3: Implement the component**

Create `src/components/project/BusinessValue.tsx`:

```tsx
import type { BusinessValue as BusinessValueData } from "@/data/projects";

interface BusinessValueProps {
  data: BusinessValueData;
  accent: string;
}

const MAX_METRICS = 4;

const BusinessValue = ({ data, accent }: BusinessValueProps) => {
  const metrics = data.metrics.slice(0, MAX_METRICS);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass rounded-xl p-5 text-center">
            <p
              className="font-heading text-3xl font-bold mb-1"
              style={{ color: `hsl(${accent})` }}
            >
              {metric.value}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">{metric.label}</p>
          </div>
        ))}
      </div>
      <p className="text-secondary-foreground leading-relaxed">{data.narrative}</p>
    </div>
  );
};

export default BusinessValue;
```

Note: `md:grid-cols-4` is correct for 2, 3, and 4 metrics — Tailwind's grid places
however many children exist, and the two-column mobile layout is unaffected.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/components/project/BusinessValue.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/project/BusinessValue.tsx src/components/project/BusinessValue.test.tsx
git commit -m "feat: add BusinessValue component"
```

---

## Task 6: ArchitectureDiagram component

Renders an SVG on desktop and a stacked card list on mobile. Both are always in the DOM;
Tailwind's `hidden md:block` / `md:hidden` decides which is visible. Tests assert on the
mobile list, since jsdom does not evaluate media queries.

**Files:**
- Create: `src/components/project/ArchitectureDiagram.tsx`
- Create: `src/components/project/ArchitectureDiagram.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/project/ArchitectureDiagram.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import ArchitectureDiagram from "./ArchitectureDiagram";
import type { Architecture } from "@/data/projects";

const data: Architecture = {
  summary: "Shift data flows from the HR platform into SAP via a queued worker.",
  nodes: [
    { id: "hr", label: "HR Platform", sub: "external", group: "source" },
    { id: "api", label: "Receiver API", sub: ".NET Core", group: "service" },
    { id: "db", label: "Staging Store", group: "store" },
    { id: "sap", label: "SAP", group: "target" },
  ],
  edges: [
    { from: "hr", to: "api", label: "webhook" },
    { from: "api", to: "db" },
    { from: "db", to: "sap", label: "RFC" },
  ],
  decisions: [
    { title: "Queued writes", detail: "Retries survive downstream outages." },
  ],
};

describe("ArchitectureDiagram", () => {
  it("renders the summary", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    expect(screen.getByText(data.summary)).toBeInTheDocument();
  });

  it("renders every node label in the mobile stack", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    const stack = screen.getByTestId("architecture-stack");
    expect(stack).toHaveTextContent("HR Platform");
    expect(stack).toHaveTextContent("Receiver API");
    expect(stack).toHaveTextContent("Staging Store");
    expect(stack).toHaveTextContent("SAP");
  });

  it("renders node sub-labels where present", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    expect(screen.getByTestId("architecture-stack")).toHaveTextContent(".NET Core");
  });

  it("renders decisions when present", () => {
    render(<ArchitectureDiagram data={data} accent="239 84% 67%" />);
    expect(screen.getByText("Queued writes")).toBeInTheDocument();
    expect(screen.getByText("Retries survive downstream outages.")).toBeInTheDocument();
  });

  it("omits the decisions block when absent", () => {
    const withoutDecisions: Architecture = {
      summary: data.summary,
      nodes: data.nodes,
      edges: data.edges,
    };
    render(<ArchitectureDiagram data={withoutDecisions} accent="239 84% 67%" />);
    expect(screen.queryByText("Key Decisions")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no nodes", () => {
    const empty: Architecture = { summary: "s", nodes: [], edges: [] };
    const { container } = render(<ArchitectureDiagram data={empty} accent="239 84% 67%" />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/project/ArchitectureDiagram.test.tsx`
Expected: FAIL — cannot resolve `./ArchitectureDiagram`.

- [ ] **Step 3: Implement the component**

Create `src/components/project/ArchitectureDiagram.tsx`:

```tsx
import type { Architecture } from "@/data/projects";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  canvasSize,
  computePositions,
  groupNodes,
  resolveEdges,
} from "./layout";

interface ArchitectureDiagramProps {
  data: Architecture;
  accent: string;
}

const ArchitectureDiagram = ({ data, accent }: ArchitectureDiagramProps) => {
  const columns = groupNodes(data.nodes);
  if (columns.length === 0) return null;

  const positions = computePositions(columns);
  const edges = resolveEdges(data.edges, positions);
  const { width, height } = canvasSize(columns);
  const pad = 16;

  return (
    <div className="space-y-6">
      <p className="text-secondary-foreground leading-relaxed">{data.summary}</p>

      {/* Desktop: SVG diagram */}
      <div className="hidden md:block glass rounded-2xl p-6 overflow-hidden">
        <svg
          role="img"
          aria-label="Architecture diagram"
          viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
          className="w-full h-auto"
        >
          {edges.map((edge, i) => {
            const midX = (edge.from.x + edge.to.x) / 2;
            const path = `M ${edge.from.x} ${edge.from.y} H ${midX} V ${edge.to.y} H ${edge.to.x}`;
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={`hsl(${accent} / 0.45)`}
                  strokeWidth="1.5"
                />
                <circle cx={edge.to.x} cy={edge.to.y} r="3" fill={`hsl(${accent})`} />
                {edge.label && (
                  <text
                    x={midX}
                    y={(edge.from.y + edge.to.y) / 2 - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10 }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {columns.flatMap((column) =>
            column.nodes.map((node) => {
              const pos = positions[node.id];
              return (
                <g key={node.id}>
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx="10"
                    fill={`hsl(${accent} / 0.10)`}
                    stroke={`hsl(${accent} / 0.35)`}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x + NODE_WIDTH / 2}
                    y={pos.y + (node.sub ? NODE_HEIGHT / 2 - 4 : NODE_HEIGHT / 2 + 4)}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    {node.label}
                  </text>
                  {node.sub && (
                    <text
                      x={pos.x + NODE_WIDTH / 2}
                      y={pos.y + NODE_HEIGHT / 2 + 14}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      style={{ fontSize: 10 }}
                    >
                      {node.sub}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Mobile: stacked cards, one group per row */}
      <div className="md:hidden space-y-3" data-testid="architecture-stack">
        {columns.map((column, columnIndex) => (
          <div key={column.group}>
            <div className="space-y-2">
              {column.nodes.map((node) => (
                <div
                  key={node.id}
                  className="glass rounded-xl px-4 py-3"
                  style={{ borderColor: `hsl(${accent} / 0.35)` }}
                >
                  <p className="font-heading text-sm font-semibold">{node.label}</p>
                  {node.sub && <p className="text-xs text-muted-foreground">{node.sub}</p>}
                </div>
              ))}
            </div>
            {columnIndex < columns.length - 1 && (
              <div className="flex justify-center py-1" aria-hidden="true">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={`hsl(${accent})`} strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.decisions && data.decisions.length > 0 && (
        <div>
          <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Key Decisions
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.decisions.map((decision) => (
              <div key={decision.title} className="glass rounded-xl p-5">
                <p className="font-heading text-sm font-semibold mb-1">{decision.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{decision.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureDiagram;
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/components/project/ArchitectureDiagram.test.tsx`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/project/ArchitectureDiagram.tsx src/components/project/ArchitectureDiagram.test.tsx
git commit -m "feat: add ArchitectureDiagram component with SVG and mobile layouts"
```

---

## Task 7: Wire sections into ProjectDetail

**Files:**
- Modify: `src/pages/ProjectDetail.tsx`
- Modify: `src/pages/ProjectDetail.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to `src/pages/ProjectDetail.test.tsx`, inside the existing file after the
GitHub-card describe block:

```tsx
describe("ProjectDetail optional sections", () => {
  it("renders only the baseline sections when no optional fields are present", () => {
    renderProject("habit-tracker");
    expect(screen.getByRole("heading", { name: "Project Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key Features" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Case Study" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Architecture" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Business Value" })).not.toBeInTheDocument();
  });

  it("keeps rendering Overview and Features for every project", () => {
    renderProject("stockledger");
    expect(screen.getByRole("heading", { name: "Project Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key Features" })).toBeInTheDocument();
  });
});
```

These use `getByRole("heading", { name })` rather than `getByText`. Each heading splits
its words across a plain text node and a `gradient-text` span, so `getByText("Overview")`
would match only the span and a negative assertion on a partial string like `"Study"`
would pass even if the section rendered — a test that cannot fail. The accessible name of
the `h2` is the joined text, so role queries match the full heading and the negative
assertions are meaningful.

- [ ] **Step 2: Run to verify the suite is green before changes**

Run: `npx vitest run src/pages/ProjectDetail.test.tsx`
Expected: 4 passed. These tests describe current behaviour and must pass before the
refactor; they are the regression guard for it.

- [ ] **Step 3: Add imports**

At the top of `src/pages/ProjectDetail.tsx`, after the existing `Footer` import:

```tsx
import CaseStudy from "@/components/project/CaseStudy";
import ArchitectureDiagram from "@/components/project/ArchitectureDiagram";
import BusinessValue from "@/components/project/BusinessValue";
```

- [ ] **Step 4: Insert the Case Study section**

In `src/pages/ProjectDetail.tsx`, immediately after the Project Overview `motion.div`
closes and before the Key Features block, insert:

```tsx
{project.caseStudy && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
  >
    <h2 className="font-heading text-2xl font-bold mb-4">
      Case <span className="gradient-text">Study</span>
    </h2>
    <CaseStudy data={project.caseStudy} accent={color1} />
  </motion.div>
)}
```

- [ ] **Step 5: Insert Business Value above Key Features**

Immediately before the Key Features `motion.div`, insert:

```tsx
{project.businessValue && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35 }}
  >
    <h2 className="font-heading text-2xl font-bold mb-4">
      Business <span className="gradient-text">Value</span>
    </h2>
    <BusinessValue data={project.businessValue} accent={color1} />
  </motion.div>
)}
```

- [ ] **Step 6: Insert the full-width Architecture section**

Architecture must break out of the two-column grid. The grid container is
`<div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-10">`. Close that grid after
its two children, then add Architecture as a sibling *inside* the same
`<div className="container mx-auto px-6">`, placed after the grid:

```tsx
{project.architecture && (
  <motion.div
    className="max-w-4xl mx-auto mt-12"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <h2 className="font-heading text-2xl font-bold mb-4">
      <span className="gradient-text">Architecture</span>
    </h2>
    <ArchitectureDiagram data={project.architecture} accent={color1} />
  </motion.div>
)}
```

This heading is a single gradient span rather than a plain/accent pair, since
"Architecture" is one word. Its accessible name is still `"Architecture"`, which is what
the Step 1 role query asserts against.

- [ ] **Step 7: Add the positive-case test**

The tests so far only prove sections stay *hidden*. This proves they appear, without
waiting on flagship content. Append to `src/pages/ProjectDetail.test.tsx`:

```tsx
import type { Project } from "@/data/projects";

vi.mock("@/data/projects", async () => {
  const actual = await vi.importActual<{ default: Project[] }>("@/data/projects");
  const base = actual.default[0];
  const enriched: Project = {
    ...base,
    slug: "fixture-full",
    caseStudy: {
      context: "Context prose.",
      challenge: "Challenge prose.",
      approach: "Approach prose.",
      outcome: "Outcome prose.",
    },
    architecture: {
      summary: "Summary prose.",
      nodes: [
        { id: "s", label: "Source", group: "source" },
        { id: "t", label: "Target", group: "target" },
      ],
      edges: [{ from: "s", to: "t" }],
    },
    businessValue: {
      metrics: [{ value: "99%", label: "uptime" }],
      narrative: "Narrative prose.",
    },
  };
  return { ...actual, default: [...actual.default, enriched] };
});

describe("ProjectDetail with full content", () => {
  it("renders all five sections when every optional field is present", () => {
    renderProject("fixture-full");
    expect(screen.getByRole("heading", { name: "Project Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Case Study" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Architecture" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Business Value" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key Features" })).toBeInTheDocument();
  });

  it("renders case study prose and metrics", () => {
    renderProject("fixture-full");
    expect(screen.getByText("Challenge prose.")).toBeInTheDocument();
    expect(screen.getByText("99%")).toBeInTheDocument();
    expect(screen.getByText("Narrative prose.")).toBeInTheDocument();
  });
});
```

`vi.mock` is hoisted above imports by Vitest, so it applies to the `projects` module that
`ProjectDetail` imports. `vi` is available as a global (`globals: true`).

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: all files pass. The two baseline tests from Step 1 still pass, confirming
projects without optional data render exactly as before.

- [ ] **Step 9: Typecheck, lint, and build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run lint && npm run build`
Expected: no type errors, no lint errors, build succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/pages/ProjectDetail.tsx src/pages/ProjectDetail.test.tsx
git commit -m "feat: render case study, architecture, and business value sections"
```

---

## Task 8: Verify visual result in the browser

No code changes. This catches what jsdom cannot — spacing, dark mode, mobile reflow.

**Automated portion completed 2026-07-27.** Production build succeeds (the >500 kB chunk
warning is pre-existing and unrelated). Dev server returns 200 for `/`,
`/project/habit-tracker`, `/project/e-credit-management`, and
`/project/talenta-sap-integration`. The built bundle contains the Case Study, Business
Value, and Key Decisions markup and the `architecture-stack` test id, while
`src/data/projects.ts` declares zero occurrences of `caseStudy:`, `architecture:`, or
`businessValue:` — confirming all three sections ship but stay dormant, which is the
optional-field design working.

**Steps 2-4 below still need a human eye** and are best done once flagship content exists
in Task 9, since there is currently no project that renders the new sections. Dark mode
and mobile reflow of the diagram cannot be verified against a page that does not yet
display one.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the printed local URL.

- [ ] **Step 2: Check a project with no optional data**

Navigate to `/project/habit-tracker`. Confirm the page looks exactly as it did before
this work: Overview, Key Features, sidebar with Tech Stack and GitHub.

- [ ] **Step 3: Check a project with an empty githubUrl**

Navigate to `/project/e-credit-management` via the homepage. Confirm no GitHub card
appears in the sidebar and no dead link is present.

- [ ] **Step 4: Toggle dark mode**

Use the site's theme toggle on both pages. Confirm text contrast holds and no element
disappears against its background.

- [ ] **Step 5: Stop the server**

Press Ctrl+C.

---

## Task 9: Talenta → SAP flagship content

**Blocked on interview answers.** Do not invent content — this project is a real named
employer system and fabricated technical detail is worse than an empty section.

Required from the site owner before starting:

1. What the system landscape looked like before the Receiver Service existed.
2. The hardest technical constraint — volume, SAP's RFC contract, idempotency under
   retry, or something else.
3. One or two decisions worth defending, and the alternative rejected in each case.
4. How the outcome was measured, and what cannot be disclosed.

**Files:**
- Modify: `src/data/projects.ts` — the `talenta-sap-integration` entry

- [ ] **Step 1: Add `caseStudy`, `architecture`, and `businessValue` to the entry**

Populate from interview answers, following the interfaces from Task 1. Node `group`
values must come from `"source" | "service" | "store" | "target"`, and every
`edge.from` / `edge.to` must match a node `id` in the same project — mismatched edges are
silently dropped by `resolveEdges`.

Confidentiality rules from the spec apply: no internal hostnames, endpoint paths, table
schemas, or auth mechanisms.

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`, navigate to `/project/talenta-sap-integration`.
Confirm all five sections render, the diagram is legible, and metrics display correctly.

- [ ] **Step 3: Check the mobile layout**

In devtools, switch to a 390px-wide viewport. Confirm the architecture SVG is replaced by
the stacked card list with chevrons between groups, and that metrics sit two per row.

- [ ] **Step 4: Run the suite and commit**

```bash
npm test
git add src/data/projects.ts
git commit -m "feat: add Talenta to SAP case study content"
```

---

## Task 10: Banking Middleware flagship content

**Blocked on interview answers.** Stricter rules than Task 9 — see
*Banking Middleware APIs — generalized treatment* in the spec.

Binding constraints:

- `githubUrl` stays `""`. Task 2 ensures the sidebar card is hidden.
- Node labels stay generic: "Channel Layer", "Transaction Middleware", "Core Banking",
  "Clearing Network". No internal service, vendor product, or proprietary component names.
- Prose describes the *class* of problem — real-time interbank processing, idempotency,
  reconciliation under peak load — not PT Bank Raya's specific implementation.
- Metrics limited to figures already public on the site's Experience section and
  LinkedIn: 1,000+ daily transactions, 5,000+ cardholders. No new figures.

The test for every sentence: could a competent engineer who had never seen the system
have written it from domain knowledge alone? If not, it is too specific.

**Files:**
- Modify: `src/data/projects.ts` — the `banking-middleware-apis` entry

- [ ] **Step 1: Change `githubUrl` to an empty string**

The entry currently points at `https://github.com/mpuntodewof`, a profile root rather
than a repository. Set it to `""` so the sidebar card is hidden.

- [ ] **Step 2: Add the three fields under the generalized-treatment rules**

- [ ] **Step 3: Re-read every sentence against the disclosure test**

Confirm no sentence describes implementation specifics only an insider would know.

- [ ] **Step 4: Verify in the browser and confirm no GitHub card**

Run: `npm run dev`, navigate to `/project/banking-middleware-apis`.
Confirm all five sections render and the sidebar shows Tech Stack and Back only.

- [ ] **Step 5: Run the suite and commit**

```bash
npm test
git add src/data/projects.ts
git commit -m "feat: add Banking Middleware case study at pattern level"
```

---

## Task 11: Services rewrite

Depends on Tasks 9 and 10 — service copy should cite the finished case studies.

**Files:**
- Modify: `src/components/Services.tsx:3-53`

- [ ] **Step 1: Replace the `services` array with the four offerings**

Keep the existing `problem` / `solution` / `outcome` shape and the existing card markup;
only the data changes. The four offerings, in order:

1. **Enterprise System Integration** — badge "Core Strength". SAP RFC integrations
   carrying payroll data, banking middleware, multi-branch rollouts.
2. **Backend API Development** — badge ".NET Core". Layered architecture, Repository
   Pattern, OpenAPI contracts, background processing.
3. **Legacy Modernization & Performance** — badge "Audit & Fix". Query tuning,
   fault handling, measurable error reduction.
4. **Workflow & Approval Automation** — badge "Repeatable". Multi-level approval, audit
   trails, compliance-driven documentation.

Reuse the existing SVG icons: the integration icon (currently on "System Integration")
moves to offering 1, the API icon to offering 2, the lightning icon to offering 3, and
the screen icon to offering 4.

Copy rules from the spec: phrase credibility by sector (banking, transport,
pharmaceutical, logistics) rather than by country; no pricing signals of any kind; no
"Get a quote" or "See pricing" language.

- [ ] **Step 2: Add the remote-delivery line to the section intro**

Replace the intro paragraph at `src/components/Services.tsx:69-71` with one that
establishes remote delivery and timezone posture in a single sentence, keeping the
existing `text-muted-foreground max-w-2xl mx-auto` classes.

- [ ] **Step 3: Confirm the CTA needs no change**

The existing CTA reads "Start a Project" and routes to `#contact`. This already complies
with the contact-form-only pricing rule. Leave it.

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, scroll to the Services section. Confirm four cards render in a 2x2
grid, icons are distinct, and dark mode holds.

- [ ] **Step 5: Run the suite and commit**

```bash
npm test
git add src/components/Services.tsx
git commit -m "feat: rewrite services around four freelance offerings"
```

---

## Done

Tasks 1-8 are unblocked and can run start to finish. Tasks 9 and 10 need interview
content and are independent of each other. Task 11 depends on both.

---

## Deviations from plan (recorded 2026-07-27)

Two changes were made during execution that this plan did not originally specify. Both
came out of review and are committed.

**1. SVG accessible label describes the flow** (`6045228`). As first written, the SVG
carried `aria-label="Architecture diagram"`. Because `role="img"` collapses the SVG
subtree, none of the `<text>` node labels were announced — and the mobile stack that does
expose them is `display: none` at desktop width, so it is absent from the accessibility
tree entirely. Desktop screen-reader users could not reach the node names at all. The
label is now built from the same column data the diagram renders, so it cannot drift from
what is drawn. Verified by mutation: restoring the static label fails the new test.

**2. Dev-only warning for dangling edge references** (`625c81a`). `resolveEdges` drops
edges whose `from`/`to` match no node id. That prevents a typo from breaking the diagram,
but it also means a mistyped id produces a silently missing connection. Since architecture
data is hand-written per project, this was the likeliest content error and the hardest to
notice. `findDanglingEdgeIds` was added to `layout.ts` as a pure, unit-tested function,
and `ArchitectureDiagram` calls it behind `import.meta.env.DEV`, naming both the
unresolved ids and the known ones.

**Also note:** the plan's Task 7 Step 9 called for `npm run lint`. The repo has
pre-existing lint errors in `src/components/ui/command.tsx`,
`src/components/ui/textarea.tsx`, and `tailwind.config.ts`, so that command exits 1
regardless of this work. Linting was scoped to changed files instead
(`npx eslint src/components/project/ src/pages/ProjectDetail.tsx`), which is clean.

Final state: 33 tests across 6 files, typecheck clean, changed-file lint clean, production
build succeeds.
