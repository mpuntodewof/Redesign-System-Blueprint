import type {
  ArchitectureEdge,
  ArchitectureGroup,
  ArchitectureNode,
} from "@/data/projects";

export const GROUP_ORDER: ArchitectureGroup[] = ["source", "service", "store", "target"];

/**
 * SVG <text> does not wrap, so a node is only as legible as its width allows.
 * 168px holds roughly 20 characters at the 13px label size before the text
 * reaches the padding; keep labels shorter than that.
 */
export const NODE_WIDTH = 168;
export const NODE_HEIGHT = 64;
export const COLUMN_GAP = 64;
export const ROW_GAP = 28;

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
  /**
   * True when both endpoints sit in the same column. Such an edge leaves the
   * bottom of one box and enters the top of the next rather than exiting right
   * and entering left, which would double back across the box it started from.
   */
  vertical: boolean;
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
    .map((edge) => {
      const from = positions[edge.from];
      const to = positions[edge.to];

      if (from.x === to.x) {
        const downward = to.y > from.y;
        return {
          from: {
            x: from.x + NODE_WIDTH / 2,
            y: downward ? from.y + NODE_HEIGHT : from.y,
          },
          to: {
            x: to.x + NODE_WIDTH / 2,
            y: downward ? to.y : to.y + NODE_HEIGHT,
          },
          label: edge.label,
          vertical: true,
        };
      }

      return {
        from: { x: from.x + NODE_WIDTH, y: from.y + NODE_HEIGHT / 2 },
        to: { x: to.x, y: to.y + NODE_HEIGHT / 2 },
        label: edge.label,
        vertical: false,
      };
    });
}

/**
 * Edge endpoints that match no node id. `resolveEdges` drops these silently so a
 * typo cannot break the diagram, but a dropped edge is invisible — the connection
 * simply never appears. Content is hand-written, so surfacing the bad ids is what
 * makes the typo findable.
 */
export function findDanglingEdgeIds(
  edges: ArchitectureEdge[],
  nodes: ArchitectureNode[]
): string[] {
  const known = new Set(nodes.map((node) => node.id));
  const dangling = new Set<string>();

  edges.forEach((edge) => {
    if (!known.has(edge.from)) dangling.add(edge.from);
    if (!known.has(edge.to)) dangling.add(edge.to);
  });

  return [...dangling];
}

/** Total canvas size needed for a set of columns. */
export function canvasSize(columns: NodeColumn[]): { width: number; height: number } {
  const tallest = Math.max(0, ...columns.map((c) => c.nodes.length));
  return {
    width: Math.max(0, columns.length * NODE_WIDTH + (columns.length - 1) * COLUMN_GAP),
    height: Math.max(0, tallest * NODE_HEIGHT + (tallest - 1) * ROW_GAP),
  };
}
