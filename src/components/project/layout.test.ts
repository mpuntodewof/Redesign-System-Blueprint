import {
  groupNodes,
  computePositions,
  resolveEdges,
  findDanglingEdgeIds,
  GROUP_ORDER,
} from "./layout";
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

  it("routes a cross-column edge from the right edge to the left edge", () => {
    const positions = computePositions(groupNodes(nodes));
    const [edge] = resolveEdges([{ from: "a", to: "b" }], positions);
    expect(edge.vertical).toBe(false);
    expect(edge.from.x).toBeGreaterThan(positions.a.x);
    expect(edge.to.x).toBe(positions.b.x);
  });

  it("routes a same-column edge vertically between the two boxes", () => {
    // b and c share the service column; exiting right would double back over b.
    const positions = computePositions(groupNodes(nodes));
    const [edge] = resolveEdges([{ from: "b", to: "c" }], positions);
    expect(edge.vertical).toBe(true);
    expect(edge.from.x).toBe(edge.to.x);
    expect(edge.from.y).toBeLessThan(edge.to.y);
  });

  it("routes an upward same-column edge from the top of the lower box", () => {
    const positions = computePositions(groupNodes(nodes));
    const [edge] = resolveEdges([{ from: "c", to: "b" }], positions);
    expect(edge.vertical).toBe(true);
    expect(edge.from.y).toBeGreaterThan(edge.to.y);
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

describe("findDanglingEdgeIds", () => {
  it("returns nothing when every endpoint resolves", () => {
    const edges: ArchitectureEdge[] = [
      { from: "a", to: "b" },
      { from: "b", to: "d" },
    ];
    expect(findDanglingEdgeIds(edges, nodes)).toEqual([]);
  });

  it("reports an unknown id on either end", () => {
    const edges: ArchitectureEdge[] = [
      { from: "a", to: "ghost" },
      { from: "phantom", to: "d" },
    ];
    expect(findDanglingEdgeIds(edges, nodes).sort()).toEqual(["ghost", "phantom"]);
  });

  it("reports each unknown id once", () => {
    const edges: ArchitectureEdge[] = [
      { from: "a", to: "ghost" },
      { from: "ghost", to: "d" },
    ];
    expect(findDanglingEdgeIds(edges, nodes)).toEqual(["ghost"]);
  });
});

describe("GROUP_ORDER", () => {
  it("flows source to target", () => {
    expect(GROUP_ORDER).toEqual(["source", "service", "store", "target"]);
  });
});
