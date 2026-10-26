import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";

/** Shared building blocks for the case-study and experience detail pages. */

export const BackLink = ({ section, label }: { section: string; label: string }) => (
  <Link
    to="/"
    state={{ scrollTo: section }}
    className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-primary"
  >
    <span aria-hidden="true">←</span> {label}
  </Link>
);

interface DetailHeroProps {
  stage: number;
  back: ReactNode;
  eyebrow: ReactNode;
  title: string;
  lede: ReactNode;
  children?: ReactNode;
}

/** Full-height intro with the field's shape on the right and the text on the left. */
export const DetailHero = ({ stage, back, eyebrow, title, lede, children }: DetailHeroProps) => (
  <section data-stage={stage} data-stage-x="0.5" className="flex min-h-[68svh] items-center py-14">
    <div className="lg:w-[min(640px,56%)]">
      {back}
      <p className="mt-8 font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-primary">{eyebrow}</p>
      <h1 className="mb-4 mt-3 text-[clamp(34px,5vw,60px)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
        {title}
      </h1>
      <div className="max-w-[560px] text-[17px]">{lede}</div>
      {children}
    </div>
  </section>
);

interface PanelProps {
  index: string;
  title: string;
  children: ReactNode;
}

/** Glass panel with a numbered h2, used for each block of a detail page. */
export const Panel = ({ index, title, children }: PanelProps) => (
  <Reveal>
    <HudCard className="p-6 md:p-8">
      <div className="mb-5 flex items-center gap-3.5">
        <span aria-hidden="true" className="font-mono text-xs font-medium tracking-[0.08em] text-primary">{`// ${index}`}</span>
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-border-strong to-transparent" aria-hidden="true" />
      </div>
      {children}
    </HudCard>
  </Reveal>
);

export const SideCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <HudCard className="p-5">
    <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{title}</h3>
    {children}
  </HudCard>
);

export interface PagerItem {
  to: string;
  label: string;
  title: string;
}

/** Previous / next navigation; the last stage of the page's morph. */
export const Pager = ({ stage, prev, next, label }: { stage: number; prev?: PagerItem; next?: PagerItem; label: string }) => (
  <nav aria-label={label} data-stage={stage} data-stage-x="0.5" className="grid gap-4 pb-20 pt-6 sm:grid-cols-2">
    {[prev, next].map((item, i) =>
      item ? (
        <Link
          key={item.to}
          to={item.to}
          className={`hud glowcard group block p-5 transition-colors ${i === 1 ? "sm:text-right" : ""}`}
        >
          <span className="mono-label">{item.label}</span>
          <span className="mt-1.5 block text-[17px] font-semibold text-foreground transition-colors group-hover:text-primary">
            {i === 0 ? "← " : ""}
            {item.title}
            {i === 1 ? " →" : ""}
          </span>
        </Link>
      ) : (
        <span key={i} aria-hidden="true" />
      ),
    )}
  </nav>
);
