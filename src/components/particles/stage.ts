/**
 * Scroll → morph mapping for the particle field.
 *
 * A page marks sections with `data-stage` (shape index 0–4), plus optional
 * `data-stage-x` (horizontal slot as a fraction of the half-width, so content can
 * sit on the opposite side) and `data-stage-dim` (opacity multiplier behind long
 * text). Each section becomes two scroll anchors; between anchors all three values
 * interpolate linearly, so the morph is scrubbed to scroll position.
 */

export interface StageSample {
  stage: number;
  x: number;
  dim: number;
}

export interface StageSection extends StageSample {
  top: number;
  height: number;
}

export interface StageAnchor extends StageSample {
  y: number;
}

export const DEFAULT_SAMPLE: StageSample = { stage: 0, x: 0.5, dim: 1 };

/** Number of shapes the field can morph between (indices 0..STAGE_COUNT-1). */
export const STAGE_COUNT = 5;

export function buildAnchors(sections: StageSection[], viewportHeight: number, maxScroll: number): StageAnchor[] {
  const clamp = (y: number) => Math.min(Math.max(y, 0), Math.max(maxScroll, 0));
  const anchors: StageAnchor[] = [];
  sections.forEach((section, index) => {
    // The shape settles once the section is a third of the way up the screen and
    // holds until its end is two thirds up.
    let start = section.top - viewportHeight * 0.35;
    let end = section.top + section.height - viewportHeight * 0.65;
    if (end < start) start = end = (start + end) / 2;
    if (index === 0) start = 0;
    const { stage, x, dim } = section;
    anchors.push({ y: clamp(start), stage, x, dim }, { y: clamp(end), stage, x, dim });
  });
  return anchors.sort((a, b) => a.y - b.y);
}

const pick = ({ stage, x, dim }: StageAnchor): StageSample => ({ stage, x, dim });

export function sampleAt(anchors: StageAnchor[], y: number): StageSample {
  if (anchors.length === 0) return DEFAULT_SAMPLE;
  if (y <= anchors[0].y) return pick(anchors[0]);
  for (let i = anchors.length - 1; i >= 0; i--) {
    const prev = anchors[i];
    if (prev.y > y) continue;
    const next = anchors[i + 1];
    if (!next) return pick(prev);
    const span = next.y - prev.y;
    if (span < 1) return pick(y >= next.y ? next : prev);
    const t = (y - prev.y) / span;
    return {
      stage: prev.stage + (next.stage - prev.stage) * t,
      x: prev.x + (next.x - prev.x) * t,
      dim: prev.dim + (next.dim - prev.dim) * t,
    };
  }
  return pick(anchors[0]);
}

/* ---- the one live source the field reads each frame ---- */

type Source = () => StageSample;
const defaultSource: Source = () => DEFAULT_SAMPLE;
let source: Source = defaultSource;
const listeners = new Set<() => void>();

/** Registers the active page's sampler; returns a release function. */
export function setStageSource(next: Source): () => void {
  source = next;
  listeners.forEach((listener) => listener());
  return () => {
    if (source !== next) return;
    source = defaultSource;
    listeners.forEach((listener) => listener());
  };
}

export function sampleStage(): StageSample {
  return source();
}

export function onStageSourceChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
