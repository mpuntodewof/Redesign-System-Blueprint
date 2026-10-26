import { type ReactNode } from "react";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { useContactDialog } from "@/components/contact/ContactDialogContext";
import { useHashTarget } from "@/hooks/useHashTarget";
import { LINKEDIN_URL, RESUME_FILENAME, RESUME_URL } from "@/lib/profile";
import { cn } from "@/lib/utils";

const CARD_IDS = ["work-full-time", "work-contract", "work-project"] as const;

// Integration leads: it is the least commoditised offering.
const OFFERINGS = [
  "Enterprise System Integration",
  "Backend & API Development",
  "Legacy Modernisation & Performance",
  "Workflow & Approval Automation",
];

const STEPS = ["Send a brief", "20-min call", "Written scope, timeline & quote", "Build with weekly demos"];

const Facts = ({ items }: { items: string[] }) => (
  <ul className="mt-4 space-y-2 text-[14px]">
    {items.map((item) => (
      <li key={item} className="flex gap-2.5">
        <span className="text-primary" aria-hidden="true">
          →
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

interface TrackProps {
  id: (typeof CARD_IDS)[number];
  index: string;
  title: string;
  summary: string;
  targeted: boolean;
  children: ReactNode;
  actions: ReactNode;
}

const Track = ({ id, index, title, summary, targeted, children, actions }: TrackProps) => (
  <HudCard
    as="article"
    glow
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn("flex h-full scroll-mt-24 flex-col p-6", targeted && "is-targeted")}
  >
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">{index}</p>
    <h3 id={`${id}-title`} className="mt-2 text-[19px] font-semibold tracking-[-0.02em] text-foreground">
      {title}
    </h3>
    <p className="mt-1.5 text-[14.5px]">{summary}</p>
    {children}
    <div className="mt-auto flex flex-wrap gap-2.5 pt-6">{actions}</div>
  </HudCard>
);

const WorkWithMe = () => {
  const target = useHashTarget(CARD_IDS);
  const { openContact } = useContactDialog();

  return (
    <section id="work" data-stage="3" data-stage-x="0.5" data-stage-dim="0.35" className="mb-28 scroll-mt-20">
      <Reveal>
        <SectionHeading index="04" title="Work with me" meta="3 ways to engage" />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="h-full">
          <Track
            id="work-full-time"
            index="01 · Full-time"
            title="Full-time roles"
            summary="Backend & integration roles, remote or Jakarta-based."
            targeted={target === "work-full-time"}
            actions={
              <>
                <a className="btn btn-primary" href={RESUME_URL} download={RESUME_FILENAME}>
                  Download CV ↓
                </a>
                <a className="btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </>
            }
          >
            <Facts items={["Jakarta · UTC+7 · remote-ready", "Fluent English", "1-month notice"]} />
          </Track>
        </Reveal>

        <Reveal className="h-full">
          <Track
            id="work-contract"
            index="02 · Contract"
            title="Contract & part-time"
            summary="Ongoing backend or integration work, ~20 h/week."
            targeted={target === "work-contract"}
            actions={
              <button type="button" className="btn btn-primary" onClick={() => openContact("contract")}>
                Ask about availability →
              </button>
            }
          >
            <Facts
              items={[
                "Async-first, with a written weekly update",
                "Live overlap: US-East afternoons, EU midday",
                "Flexible payment and contract setup",
              ]}
            />
          </Track>
        </Reveal>

        <Reveal className="h-full">
          <Track
            id="work-project"
            index="03 · Project"
            title="Project work"
            summary="Fixed-scope integrations, APIs and performance audits."
            targeted={target === "work-project"}
            actions={
              <button type="button" className="btn btn-primary" onClick={() => openContact("project")}>
                Send a brief →
              </button>
            }
          >
            <ul aria-label="Offerings" className="mt-4 flex flex-wrap gap-1.5">
              {OFFERINGS.map((offering) => (
                <li key={offering} className="chip">
                  {offering}
                </li>
              ))}
            </ul>
            <p className="mono-label mt-5">How it works</p>
            <ol className="mt-2 space-y-1.5 text-[14px]">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-2.5">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Track>
        </Reveal>
      </div>
    </section>
  );
};

export default WorkWithMe;
