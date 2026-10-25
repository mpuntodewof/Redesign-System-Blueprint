import { Fragment } from "react";
import { Link } from "react-router-dom";
import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import projects, { type Project } from "@/data/projects";

const STACK_PREVIEW = 4;
const linkClass = "text-foreground transition-colors hover:text-primary";
const STEPS = [
  { num: "01", title: "Context", key: "context" },
  { num: "02", title: "Approach", key: "approach" },
  { num: "03", title: "Outcome", key: "outcome" },
] as const;

const StackChips = ({ stack, limit }: { stack: string[]; limit?: number }) => {
  const shown = limit ? stack.slice(0, limit) : stack;
  const hidden = stack.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((tech) => (
        <span key={tech} className="chip">
          {tech}
        </span>
      ))}
      {hidden > 0 && <span className="chip chip-dim">+{hidden} more</span>}
    </div>
  );
};

const ProjectLinks = ({ project, caseStudyLabel }: { project: Project; caseStudyLabel: string }) => {
  if (project.clickable === false) {
    return <p className="mt-3.5 font-mono text-xs text-muted-foreground">Internal system · private</p>;
  }
  return (
    <div className="mt-3.5 flex flex-wrap gap-4 font-mono text-xs font-medium">
      <Link to={`/project/${project.slug}`} className={linkClass}>
        {caseStudyLabel}
      </Link>
      {project.githubUrl ? (
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          GitHub ↗
        </a>
      ) : (
        <span className="text-muted-foreground">Private codebase</span>
      )}
    </div>
  );
};

const CardTop = ({ label, org }: { label: string; org?: string }) => (
  <div className="flex items-baseline justify-between gap-2.5">
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">{label}</span>
    {org && <span className="mono-label whitespace-nowrap">{org}</span>}
  </div>
);

const FeaturedProject = ({ project }: { project: Project }) => (
  <HudCard glow className="mb-4 p-6 md:p-7">
    <CardTop label={`Featured case study · ${project.type}`} org={project.org} />
    <h3 className="mb-5 mt-2 text-[21px] font-semibold tracking-[-0.02em] text-foreground">{project.title}</h3>
    {project.highlight && (
      <div className="grid items-stretch gap-3.5 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {STEPS.map((step, i) => (
          <Fragment key={step.key}>
            {i > 0 && (
              <span aria-hidden="true" className="rotate-90 self-center justify-self-center font-mono text-sm text-primary md:rotate-0">
                →
              </span>
            )}
            <div className="rounded border border-border p-4">
              <h4 className="mono-label mb-1.5">
                <span className="mr-1.5 text-primary">{step.num}</span>
                {step.title}
              </h4>
              <p className="text-sm">{project.highlight?.[step.key]}</p>
            </div>
          </Fragment>
        ))}
      </div>
    )}
    <div className="flex flex-wrap items-end justify-between gap-5 pt-5">
      <StackChips stack={project.stack} />
      <ProjectLinks project={project} caseStudyLabel="Read case study →" />
    </div>
  </HudCard>
);

const ProjectCard = ({ project }: { project: Project }) => (
  <HudCard as="article" glow className="flex h-full flex-col p-[22px]">
    <CardTop label={project.type} org={project.org} />
    <h3 className="mb-1.5 mt-2 text-[17px] font-semibold text-foreground">{project.title}</h3>
    <p className="text-sm">{project.problem}</p>
    <p className="mt-2.5 text-sm text-foreground">
      <span className="text-primary" aria-hidden="true">
        ↳{" "}
      </span>
      {project.impact}
    </p>
    <div className="mt-auto pt-4">
      <StackChips stack={project.stack} limit={STACK_PREVIEW} />
      <ProjectLinks project={project} caseStudyLabel="Case study →" />
    </div>
  </HudCard>
);

const Projects = () => {
  const featured = projects.find((p) => p.featured);
  const professional = projects.filter((p) => p.group === "professional" && !p.featured);
  const personal = projects.filter((p) => p.group === "personal");
  const professionalCount = projects.filter((p) => p.group === "professional").length;

  return (
    <section id="projects" className="mb-28 scroll-mt-20">
      <Reveal>
        <SectionHeading
          index="02"
          title="Projects"
          meta={`${professionalCount} professional systems · ${personal.length} personal builds`}
        />
      </Reveal>
      {featured && (
        <Reveal>
          <FeaturedProject project={featured} />
        </Reveal>
      )}

      <p className="subhead mono-label">Professional systems</p>
      <div className="grid gap-4 md:grid-cols-2">
        {professional.map((project) => (
          <Reveal key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      <p className="subhead mono-label">Personal builds</p>
      <div className="grid gap-4 md:grid-cols-3">
        {personal.map((project) => (
          <Reveal key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Projects;
