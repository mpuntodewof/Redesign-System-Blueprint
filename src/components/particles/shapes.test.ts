import { createRng, shapeCore, shapeMesh, shapeSphere, shapeStack } from "./shapes";

describe("particle shapes", () => {
  const N = 2000;
  const generators = { shapeSphere, shapeMesh, shapeStack, shapeCore };

  it.each(Object.entries(generators))("%s fills N finite points inside the scene box", (_, generate) => {
    const points = generate(N, createRng(1));
    expect(points).toHaveLength(N * 3);
    for (const value of points) {
      expect(Number.isFinite(value)).toBe(true);
      expect(Math.abs(value)).toBeLessThan(5);
    }
  });

  it("is deterministic for a given seed", () => {
    expect(shapeMesh(500, createRng(42))).toEqual(shapeMesh(500, createRng(42)));
  });
});
