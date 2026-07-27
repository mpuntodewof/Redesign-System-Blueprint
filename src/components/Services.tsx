import { motion } from "framer-motion";

const services = [
  {
    title: "Enterprise System Integration",
    badge: "Core Strength",
    problem: "Two systems hold the same data and neither agrees with the other",
    solution: "Middleware that owns the timing — staged transfers, retries, and a negotiated contract between both sides",
    outcome: "SAP and HR platform integrations carrying payroll-grade data without manual re-entry",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-primary">
        <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: "Backend & API Development",
    badge: ".NET Core",
    problem: "Business logic scattered across a codebase nobody wants to change",
    solution: "Layered .NET services with a clean repository split, OpenAPI contracts, and background processing",
    outcome: "Backends that survive peak load and stay legible to the next developer",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-primary">
        <path d="M5 12h14M12 5l7 7-7 7" /><rect x="2" y="3" width="20" height="18" rx="3" />
        <path d="M7 8h4M7 12h6M7 16h3" />
      </svg>
    ),
  },
  {
    title: "Legacy Modernisation & Performance",
    badge: "Audit & Fix",
    problem: "Slow queries and silent failures you have learned to work around",
    solution: "An audit first, then targeted query tuning, fault handling, and retry logic where it actually pays",
    outcome: "Measured error reduction and systems that hold up under peak-hour load",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-primary">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Workflow & Approval Automation",
    badge: "Repeatable",
    problem: "Approvals live in email and spreadsheets, and no one can prove what was agreed",
    solution: "Multi-level approval flows with validation rules, state machines, and an immutable audit trail",
    outcome: "Timesheet, credit, and change-management systems delivered across four organisations",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-primary">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary font-heading text-sm font-semibold tracking-widest uppercase mb-4 block">Services</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            What I Can <span className="gradient-text">Build For You</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Backend and integration work for teams in banking, transport, pharmaceutical, and
            logistics — delivered remotely, with overlap across Asia-Pacific and European hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className="glass rounded-2xl p-8 group hover:glow transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  {service.icon}
                </div>
                <span className="text-xs font-heading font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
                  {service.badge}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4">{service.title}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <p className="text-muted-foreground">{service.problem}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <p className="text-secondary-foreground">{service.solution}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <p className="text-foreground font-medium">{service.outcome}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 font-heading font-semibold text-primary-foreground transition-all hover:scale-105"
            style={{ backgroundImage: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(263 70% 50%))' }}
          >
            Start a Project
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
