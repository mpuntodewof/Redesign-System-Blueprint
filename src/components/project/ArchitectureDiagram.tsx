import type { Architecture } from "@/data/projects";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  canvasSize,
  computePositions,
  findDanglingEdgeIds,
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

  if (import.meta.env.DEV) {
    const dangling = findDanglingEdgeIds(data.edges, data.nodes);
    if (dangling.length > 0) {
      console.warn(
        `ArchitectureDiagram: edge references no matching node id: ${dangling.join(", ")}. ` +
          `Those connections will not be drawn. Known ids: ${data.nodes.map((n) => n.id).join(", ")}.`
      );
    }
  }

  // `role="img"` collapses the SVG subtree, so the <text> node labels inside are
  // never announced. The mobile stack that does expose them is `display: none` at
  // this breakpoint and so is absent from the accessibility tree. Describing the
  // flow in the label is what makes the diagram reachable on desktop.
  const diagramLabel = `Architecture diagram. ${columns
    .map((column) => `${column.group}: ${column.nodes.map((node) => node.label).join(", ")}`)
    .join(". ")}.`;

  return (
    <div className="space-y-6">
      <p className="text-secondary-foreground leading-relaxed">{data.summary}</p>

      {/* Desktop: SVG diagram */}
      <div className="hidden md:flex justify-center glass rounded-2xl px-6 py-8 overflow-hidden">
        <svg
          role="img"
          aria-label={diagramLabel}
          viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
          // Capping at the diagram's natural size stops `w-full` magnifying the
          // 13px node text into something oversized on a wide container.
          style={{ maxWidth: width + pad * 2 }}
          className="w-full h-auto"
        >
          {edges.map((edge, i) => {
            const midX = (edge.from.x + edge.to.x) / 2;
            const path = edge.vertical
              ? `M ${edge.from.x} ${edge.from.y} V ${edge.to.y}`
              : `M ${edge.from.x} ${edge.from.y} H ${midX} V ${edge.to.y} H ${edge.to.x}`;
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
                    x={edge.vertical ? edge.from.x + 8 : midX}
                    y={(edge.from.y + edge.to.y) / 2 + (edge.vertical ? 3 : -6)}
                    textAnchor={edge.vertical ? "start" : "middle"}
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

      {data.flow && data.flow.length > 0 && (
        <div>
          <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            How a Request Flows
          </h3>
          <ol className="space-y-4">
            {data.flow.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="font-heading text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `hsl(${accent} / 0.15)`,
                    color: `hsl(${accent})`,
                  }}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

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
