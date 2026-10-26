import { Link } from "react-router-dom";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { roles } from "@/data/experience";
import { LINKEDIN_URL } from "@/lib/profile";

const Experience = () => (
  <section id="experience" data-stage="1" data-stage-x="0.5" className="mb-28 scroll-mt-20">
    <div className="xl:w-[min(620px,54%)]">
      <Reveal>
        <SectionHeading index="01" title="Experience" />
        <p className="-mt-5 mb-8 mono-label">4 orgs · banking · transport · pharma · logistics</p>
      </Reveal>

      <div className="pipe">
        <span className="pipe-track" aria-hidden="true">
          <span className="pipe-pulse" />
        </span>
        {roles.map((role) => (
          <Reveal key={role.slug} className="relative mb-5">
            <span className="pipe-node" aria-hidden="true" />
            <HudCard as="article" glow className="p-5 md:p-6">
              <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                <p className="min-w-[104px] font-mono text-xs font-medium tracking-[0.04em] text-primary">{role.period}</p>
                <p className="text-[17px] font-semibold text-foreground">{role.company}</p>
                <p className="mono-label">{role.industry}</p>
              </div>
              <h3 className="mb-3 mt-1.5 text-[15.5px] font-semibold text-foreground">{role.role}</h3>
              <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                {role.modules.map((module) => (
                  <div key={module.name} className="rounded border border-border bg-primary/[0.025] px-3.5 py-3">
                    <p className="text-[14.5px] font-semibold text-foreground">{module.name}</p>
                    <p className="mt-0.5 text-[13.5px]">{module.summary}</p>
                    {module.route && <p className="mt-1.5 font-mono text-[11px] font-medium text-primary">{module.route}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {role.impact.map((item) => (
                  <span key={item} className="chip chip-impact">
                    {item}
                  </span>
                ))}
                {role.stack.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to={`/experience/${role.slug}`}
                aria-label={`Full details: ${role.role} at ${role.company}`}
                className="tap mt-3 font-mono text-xs font-medium text-foreground transition-colors hover:text-primary"
              >
                Full details →
              </Link>
            </HudCard>
          </Reveal>
        ))}
      </div>

      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="btn mt-4">
        View on LinkedIn ↗
      </a>
    </div>
  </section>
);

export default Experience;
