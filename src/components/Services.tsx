import { useState } from "react";
import ContactFormDialog from "@/components/ContactFormDialog";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";

// Integration leads: it is the least commoditised offering (see Services.test.tsx).
const services = [
  { title: "Enterprise System Integration", summary: "SAP, HR and finance middleware that owns timing, retries and contracts." },
  { title: "Backend & API Development", summary: ".NET services with OpenAPI contracts and background processing." },
  { title: "Legacy Modernisation & Performance", summary: "An audit first, then targeted query tuning and fault handling." },
  { title: "Workflow & Approval Automation", summary: "Multi-level approvals with state machines and an audit trail." },
];

const Services = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section id="contract" data-stage="3" data-stage-x="0.5" className="mb-28 scroll-mt-20">
      <Reveal className="lg:w-[min(620px,54%)]">
        <HudCard glow className="grid items-start gap-7 p-6 md:p-8">
          <div>
            <p aria-hidden="true" className="font-mono text-xs text-primary">{"// also available"}</p>
            <h2 className="mb-2.5 mt-2 text-[26px] font-semibold tracking-[-0.03em] text-foreground">
              Contract &amp; freelance engagements
            </h2>
            <p>
              I take on a few remote backend and integration projects, with working hours that overlap Asia-Pacific and
              Europe.
            </p>
            <button type="button" className="btn mt-5" onClick={() => setDialogOpen(true)}>
              Discuss a project →
            </button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <li key={service.title} className="rounded border border-border p-3.5">
                <h3 className="text-[14.5px] font-semibold text-foreground">{service.title}</h3>
                <p className="text-[13.5px]">{service.summary}</p>
              </li>
            ))}
          </ul>
        </HudCard>
      </Reveal>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default Services;
