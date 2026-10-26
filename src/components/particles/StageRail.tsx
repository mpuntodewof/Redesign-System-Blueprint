import { useEffect, useRef, useState } from "react";
import { sampleStage } from "./stage";

export interface RailStage {
  href: string;
  label: string;
  /** Caption for the shape, e.g. "service mesh · 13 nodes". */
  figure: string;
}

/** Side progress dots and a figure caption that track the field's morph stage. */
const StageRail = ({ stages }: { stages: RailStage[] }) => {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const stage = Math.min(Math.max(sampleStage().stage, 0), stages.length - 1);
      setActive(Math.round(stage));
      const dots = listRef.current?.querySelectorAll("i");
      if (dots && dots.length > 1 && fillRef.current) {
        const first = dots[0].getBoundingClientRect().top;
        const last = dots[dots.length - 1].getBoundingClientRect().top;
        fillRef.current.style.height = `${(last - first) * (stage / (stages.length - 1))}px`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [stages.length]);

  return (
    <>
      <nav aria-label="Section progress" className="stage-rail">
        <span ref={fillRef} className="stage-rail-fill" aria-hidden="true" />
        <ol ref={listRef}>
          {stages.map((stage, i) => (
            <li key={stage.href}>
              <a href={stage.href} aria-current={i === active ? "step" : undefined}>
                <span>{stage.label}</span>
                <i aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <p className="stage-figure" aria-hidden="true">
        fig.<b>{String(active + 1).padStart(2, "0")}</b> / {stages[active]?.figure}
      </p>
    </>
  );
};

export default StageRail;
