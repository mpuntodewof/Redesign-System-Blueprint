import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { LINKEDIN_URL } from "@/lib/profile";

interface SystemModule {
  name: string;
  summary: string;
  /** Integration direction, e.g. "Talenta HR → SAP". */
  route?: string;
}

interface Role {
  company: string;
  industry: string;
  role: string;
  /** Compact form for the card, e.g. "2023 → NOW". */
  period: string;
  /** Full form for the details dialog. */
  fullPeriod: string;
  modules: SystemModule[];
  impact: string[];
  stack: string[];
  /** CV bullets, verbatim. */
  bullets: string[];
}

const roles: Role[] = [
  {
    company: "PT Bluebird Group",
    industry: "Transport",
    role: "IT Application Developer",
    period: "2023 → NOW",
    fullPeriod: "Mar 2023 — Present",
    modules: [
      { name: "E-Timesheet Service", summary: "Driver contracts, timesheets and operating permits (SIO).", route: "Portal Timesheet → SAP" },
      { name: "Talenta Receiver Service", summary: "Shifts, overtime and time-off via background processing.", route: "Talenta HR → SAP" },
      { name: "Journaling Service", summary: "Multi-gateway transactions with less manual reconciliation.", route: "Gateways → Ledger" },
    ],
    impact: [],
    stack: [".NET Core", "Go", "gRPC", "SQL Server", "MySQL", "SAP"],
    bullets: [
      "Designed and developed scalable RESTful APIs for the E-Timesheet Service, an API middleware integrating Portal Timesheet with SAP, covering driver contract, driver timesheet, and Driver SIO (Surat Izin Operasi) data to improve HR and operational data accuracy.",
      "Built and maintained the Talenta Receiver Service, an API middleware integrating Talenta (external HR platform) with SAP, handling driver shift schedules, overtime, and time-off data with reliable background processing.",
      "Engineered the Journaling Service, an internal finance application to record and manage transactions from multiple payment gateway platforms, improving financial tracking accuracy and reducing manual reconciliation.",
      "Designed backend service flows and background processing for high-volume data integration systems, ensuring reliability, scalability, and fault tolerance.",
      "Optimized SQL queries and implemented fault-handling mechanisms, improving API performance and stability under high-load conditions.",
      "Collaborated with cross-functional teams (business, QA, SAP) to design system architecture and deliver features iteratively using Agile/Scrum methodology.",
    ],
  },
  {
    company: "PT Bank Raya",
    industry: "Banking",
    role: "Backend Developer",
    period: "2021 → 2023",
    fullPeriod: "Mar 2021 — Feb 2023",
    modules: [
      { name: "BI-FAST middleware", summary: "Real-time interbank transfer APIs for web and mobile banking.", route: "Bank ↔ BI-FAST" },
      { name: "Card Management System", summary: "Automated issuance and status tracking.", route: "Web Forms · SQL Server" },
    ],
    impact: ["1,000+ tx/day", "5,000+ cardholders"],
    stack: [".NET Core", "SQL Server"],
    bullets: [
      "Designed and developed RESTful APIs for the BI-FAST middleware service using .NET Core and SQL Server, enabling secure real-time integration across web and mobile banking applications.",
      "Implemented backend service flows for interbank fund transfers, supporting over 1,000 daily transactions with a strong focus on data consistency, validation, and reliability.",
      "Collaborated with cross-functional teams to integrate frontend and backend components, ensuring low-latency and seamless real-time transaction experiences.",
      "Optimized SQL Server queries and backend logic to improve transaction performance and maintain system stability under peak usage.",
      "Developed and maintained a Card Management System using .NET Framework Web Forms and SQL Server, supporting daily operations for 5,000+ active cardholders through automated issuance and status tracking.",
      "Used Git-based workflows and team collaboration practices to streamline development, improve code quality, and support faster release cycles.",
    ],
  },
  {
    company: "PT Bayer Indonesia",
    industry: "Pharmaceutical",
    role: "IT Application Developer",
    period: "2019 → 2021",
    fullPeriod: "Apr 2019 — Feb 2021",
    modules: [
      { name: "Credit Management", summary: "Redesigned the database and workflows." },
      { name: "E-Management of Change", summary: "Documentation and approval workflow app." },
    ],
    impact: ["−40% errors", "+30% approvals", "−25% support"],
    stack: [".NET C#", "Laravel"],
    bullets: [
      "Developed and maintained enterprise web applications using .NET C#, SQL Server, Laravel, and Bootstrap, supporting multiple internal business processes.",
      "Optimized database design and backend workflows for the Credit Management system, reducing processing errors by 40% and improving overall system reliability.",
      "Improved mailing and approval workflows by resolving critical backend issues, resulting in faster approvals and reduced operational bottlenecks.",
      "Collaborated closely with business stakeholders to gather requirements and translate them into backend solutions, contributing to the successful delivery of 5+ internal applications.",
      "Provided application guidance and user training to improve system adoption and reduce support requests by over 25%.",
      "Enhanced HR-related web applications in collaboration with external vendors, improving system performance and cross-departmental data flow.",
      "Developed and optimized the E-Management of Change (E-MOC) application, increasing documentation and approval efficiency by approximately 30%.",
    ],
  },
  {
    company: "Thortech Asia",
    industry: "Web & mobile",
    role: "Web Developer",
    period: "2018 → 2019",
    fullPeriod: "Apr 2018 — Apr 2019",
    modules: [
      { name: "Kirimkanai", summary: "Mobile app APIs and admin tooling for 1,000+ users." },
      { name: "Gapallan", summary: "Logistics and ship-maintenance management." },
    ],
    impact: ["+25% admin efficiency", "−40% manual entry"],
    stack: ["Laravel", "MySQL"],
    bullets: [
      "Developed and maintained web applications using Laravel, MySQL, JavaScript, Bootstrap, and AJAX, supporting internal business operations across multiple departments.",
      "Designed and implemented RESTful APIs for the Kirimkanai mobile application, enabling secure transactions for 1,000+ active users and seamless integration with admin systems.",
      "Built backend services for Kirimkanai admin tools, improving transaction monitoring, reporting, and operational visibility, resulting in a 25% increase in administrative efficiency.",
      "Developed core features for the Gapallan Web Application, a logistics and ship maintenance management system, reducing manual data entry by approximately 40% and improving operational turnaround time.",
      "Collaborated with product and operational teams to gather requirements and deliver full-stack features aligned with business needs.",
    ],
  },
];

const Experience = () => {
  const [selected, setSelected] = useState<Role | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <section id="experience" className="mb-28 scroll-mt-20">
      <Reveal>
        <SectionHeading index="01" title="Experience" meta="4 orgs · banking · transport · pharma · logistics" />
      </Reveal>

      <div className="pipe">
        <span className="pipe-pulse" aria-hidden="true" />
        {roles.map((role) => (
          <Reveal key={role.company} className="relative mb-5">
            <span className="pipe-node" aria-hidden="true" />
            <HudCard as="article" glow className="grid gap-3 p-5 md:grid-cols-[190px_1fr] md:gap-7 md:p-6">
              <div>
                <p className="font-mono text-xs font-medium tracking-[0.04em] text-primary">{role.period}</p>
                <p className="mt-1 text-[17px] font-semibold text-foreground">{role.company}</p>
                <p className="mono-label">{role.industry}</p>
              </div>
              <div>
                <h3 className="mb-3 text-[15.5px] font-semibold text-foreground">{role.role}</h3>
                <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                  {role.modules.map((module) => (
                    <div key={module.name} className="rounded border border-border bg-primary/[0.025] px-3.5 py-3">
                      <p className="text-[14.5px] font-semibold text-foreground">{module.name}</p>
                      <p className="mt-0.5 text-[13.5px]">{module.summary}</p>
                      {module.route && (
                        <p className="mt-1.5 font-mono text-[11px] font-medium text-primary">{module.route}</p>
                      )}
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
                <button
                  type="button"
                  onClick={() => {
                    setSelected(role);
                    setOpen(true);
                  }}
                  aria-label={`Full details: ${role.role} at ${role.company}`}
                  className="mt-4 py-1 font-mono text-xs font-medium text-foreground transition-colors hover:text-primary"
                >
                  Full details →
                </button>
              </div>
            </HudCard>
          </Reveal>
        ))}
      </div>

      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="btn mt-4">
        View on LinkedIn ↗
      </a>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-[600px]">
          {selected && (
            <>
              <DialogHeader>
                <p className="font-mono text-xs text-primary">{selected.fullPeriod}</p>
                <DialogTitle className="text-2xl text-foreground">{selected.role}</DialogTitle>
                <DialogDescription>
                  {selected.company} · {selected.industry}
                </DialogDescription>
              </DialogHeader>
              <ul className="mt-2 space-y-3">
                {selected.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm">
                    <span className="mt-0.5 text-primary" aria-hidden="true">
                      →
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Experience;
