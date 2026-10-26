import { useEffect } from "react";
import { buildAnchors, sampleAt, setStageSource, type StageAnchor, type StageSection } from "@/components/particles/stage";

function measureSections(): StageSection[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"))
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        height: rect.height,
        stage: Number(el.dataset.stage),
        x: Number(el.dataset.stageX ?? 0.5),
        dim: Number(el.dataset.stageDim ?? 1),
      };
    })
    .filter((s) => Number.isFinite(s.stage));
}

/**
 * Drives the particle field from this page's `[data-stage]` sections while the
 * page is mounted. Re-measures when layout changes (fonts, images, resize).
 * `key` re-runs the measurement when the page swaps content without unmounting.
 */
export function useScrollStage(key?: string) {
  useEffect(() => {
    let anchors: StageAnchor[] = [];
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      anchors = buildAnchors(measureSections(), window.innerHeight, max);
    };
    measure();
    const release = setStageSource(() => sampleAt(anchors, window.scrollY));

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(document.body);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      release();
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [key]);
}
