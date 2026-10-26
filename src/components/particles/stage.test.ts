import { buildAnchors, DEFAULT_SAMPLE, sampleAt, sampleStage, setStageSource, type StageSection } from "./stage";

const section = (top: number, height: number, stage: number, x = 0.5, dim = 1): StageSection => ({ top, height, stage, x, dim });

describe("buildAnchors / sampleAt", () => {
  const vh = 1000;
  const sections = [section(0, 1000, 0), section(1200, 1400, 1, -0.5), section(3000, 1000, 2, 0.5, 0.4)];
  const anchors = buildAnchors(sections, vh, 4000);

  it("starts the first section at the very top of the page", () => {
    expect(anchors[0]).toMatchObject({ y: 0, stage: 0 });
    expect(sampleAt(anchors, 0).stage).toBe(0);
  });

  it("holds a shape while its section fills the screen", () => {
    // Section 1 holds from 1200-350=850 to 2600-650=1950.
    expect(sampleAt(anchors, 900)).toEqual({ stage: 1, x: -0.5, dim: 1 });
    expect(sampleAt(anchors, 1900)).toEqual({ stage: 1, x: -0.5, dim: 1 });
  });

  it("interpolates stage, slot and dim between sections", () => {
    // Between 1950 (end of 1) and 2650 (start of 2): halfway is 2300.
    const mid = sampleAt(anchors, 2300);
    expect(mid.stage).toBeCloseTo(1.5);
    expect(mid.x).toBeCloseTo(0);
    expect(mid.dim).toBeCloseTo(0.7);
  });

  it("clamps past the last anchor", () => {
    expect(sampleAt(anchors, 99999).stage).toBe(2);
  });

  it("collapses a section shorter than the hold window to one point", () => {
    const short = buildAnchors([section(0, 500, 0), section(2000, 100, 3)], vh, 5000);
    const pair = short.filter((a) => a.stage === 3);
    expect(pair[0].y).toBe(pair[1].y);
  });

  it("falls back to the default sample without anchors", () => {
    expect(sampleAt([], 100)).toEqual(DEFAULT_SAMPLE);
  });
});

describe("stage source", () => {
  it("restores the default once the registering page releases it", () => {
    const release = setStageSource(() => ({ stage: 3, x: 0, dim: 1 }));
    expect(sampleStage().stage).toBe(3);
    release();
    expect(sampleStage()).toEqual(DEFAULT_SAMPLE);
  });

  it("ignores a stale release after another page took over", () => {
    const releaseA = setStageSource(() => ({ stage: 1, x: 0, dim: 1 }));
    const releaseB = setStageSource(() => ({ stage: 2, x: 0, dim: 1 }));
    releaseA();
    expect(sampleStage().stage).toBe(2);
    releaseB();
  });
});
