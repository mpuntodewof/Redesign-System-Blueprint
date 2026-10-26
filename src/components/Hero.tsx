import { type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { AVAILABILITY, FULL_NAME, GITHUB_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import { cn } from "@/lib/utils";

const ROLES = ["Backend & Integration Engineer", ".NET Core · Go · SQL Server", "SAP / HR / payments middleware"] as const;

/** Splits the name into staggered letters; the last word carries the brand gradient. */
const Headline = () => {
  const words = FULL_NAME.split(" ");
  let index = 0;
  return (
    <h1
      aria-label={FULL_NAME}
      className="mb-4 mt-6 text-[clamp(40px,6.2vw,80px)] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground [perspective:900px]"
    >
      {words.map((word, w) => (
        <span key={word}>
          <span className="hero-word" aria-hidden="true">
            {Array.from(word).map((letter) => (
              <span
                key={index}
                className={cn("hero-letter", w === words.length - 1 && "hero-letter-accent")}
                style={{ "--i": index++ } as CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>
          {w < words.length - 1 && " "}
        </span>
      ))}
    </h1>
  );
};

const Hero = () => {
  const reduced = usePrefersReducedMotion();
  const role = useTypewriter(ROLES, !reduced);

  return (
    <section data-stage="0" data-stage-x="0.5" className="flex min-h-[calc(100svh-62px)] items-center py-16">
      <div className="xl:w-[min(620px,54%)]">
        <p className="flex flex-wrap items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.04em] text-primary">
          <span className="status-dot" aria-hidden="true" />
          {AVAILABILITY}
        </p>
        <Headline />
        <p className="mb-5 min-h-[1.6em] font-mono text-[clamp(14.5px,1.5vw,17px)] font-medium text-body">
          <span className="text-primary" aria-hidden="true">
            &gt;
          </span>{" "}
          <span className="sr-only">{ROLES[0]}</span>
          <span aria-hidden="true" data-testid="typed-role">
            {role}
          </span>
          <span className="caret" aria-hidden="true" />
        </p>
        <p className="max-w-[560px] text-[17.5px]">
          I design the APIs and background services that move data between enterprise systems, such as{" "}
          <b className="font-medium text-foreground">SAP and HR platforms</b>,{" "}
          <b className="font-medium text-foreground">payment gateways and finance ledgers</b>, or a bank and the national{" "}
          <b className="font-medium text-foreground">BI-FAST</b> rails. The data has to arrive correctly every time.
        </p>
        <p className="mt-4 font-mono text-[12.5px] text-muted-foreground">
          7+ years · banking, transport, pharma · systems running 24/7 in production
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a className="btn btn-primary" href="#work">
            Work with me →
          </a>
          <a className="btn" href={RESUME_URL} download={RESUME_FILENAME}>
            Download CV ↓
          </a>
          <a className="btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </div>
        <p className="scroll-hint mt-14" aria-hidden="true">
          <i />
          SCROLL · THE FIELD REASSEMBLES PER SECTION
        </p>
      </div>
    </section>
  );
};

export default Hero;
