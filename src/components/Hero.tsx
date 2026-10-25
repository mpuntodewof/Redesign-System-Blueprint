import IntegrationConsole from "@/components/IntegrationConsole";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { GITHUB_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const ROLES = ["Backend & Integration Engineer", ".NET Core · Go · SQL Server", "SAP / HR / payments middleware"] as const;

const Hero = () => {
  const reduced = usePrefersReducedMotion();
  const role = useTypewriter(ROLES, !reduced);

  return (
    <section className="grid items-center gap-12 py-12 md:py-20 lg:grid-cols-[1fr_1.02fr]">
      <div>
        <p className="flex flex-wrap items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.04em] text-primary">
          <span className="status-dot" aria-hidden="true" />
          Available
          <span className="text-muted-foreground">/ open to remote roles · Jakarta UTC+7</span>
        </p>
        <h1 className="mb-3.5 mt-5 text-[clamp(36px,5vw,58px)] font-bold leading-[1.02] tracking-[-0.04em] text-foreground">
          Muhammad Puntodewo <span className="text-gradient-brand">Fadhillah</span>
        </h1>
        <p className="mb-5 min-h-[1.6em] font-mono text-[14.5px] font-medium text-body">
          <span className="text-primary" aria-hidden="true">
            &gt;
          </span>{" "}
          <span className="sr-only">{ROLES[0]}</span>
          <span aria-hidden="true" data-testid="typed-role">
            {role}
          </span>
          <span className="caret" aria-hidden="true" />
        </p>
        <p className="max-w-[540px] text-[17.5px]">
          I design the APIs and background services that move data between enterprise systems, such as{" "}
          <b className="font-medium text-foreground">SAP and HR platforms</b>,{" "}
          <b className="font-medium text-foreground">payment gateways and finance ledgers</b>, or a bank and the national{" "}
          <b className="font-medium text-foreground">BI-FAST</b> rails. The data has to arrive correctly every time.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a className="btn btn-primary" href="#experience">
            View experience →
          </a>
          <a className="btn" href={RESUME_URL} download={RESUME_FILENAME}>
            Download CV ↓
          </a>
          <a className="btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </div>
      </div>
      <IntegrationConsole />
    </section>
  );
};

export default Hero;
