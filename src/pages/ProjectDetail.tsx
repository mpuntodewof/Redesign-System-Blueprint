import { useEffect } from "react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { metaForPath } from "@/lib/pageMeta";
import { useParams } from "react-router-dom";
import projects from "@/data/projects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseStudy from "@/components/project/CaseStudy";
import ArchitectureDiagram from "@/components/project/ArchitectureDiagram";
import BusinessValue from "@/components/project/BusinessValue";
import { BackLink, DetailHero, Pager, Panel, SideCard } from "@/components/detail/DetailParts";
import { useScrollStage } from "@/hooks/useScrollStage";

// Case-study pages follow the site palette rather than per-project colours.
const ACCENT = "var(--primary)";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);
  useScrollStage(slug);
  useDocumentMeta(metaForPath(`/project/${slug ?? ""}`));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!project) {
    return (
      <>
        <Navbar home={false} />
        <main className="mx-auto flex min-h-[70svh] max-w-[1180px] items-center px-4 md:px-8">
          <div data-stage="4" data-stage-x="0.5">
            <h1 className="mb-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">Project not found</h1>
            <p className="mb-6">The project you're looking for doesn't exist.</p>
            <BackLink section="projects" label="All projects" />
          </div>
        </main>
      </>
    );
  }

  // Professional systems open on the service mesh, personal builds on the data layer.
  const start = project.group === "personal" ? 2 : 1;
  const clickable = projects.filter((p) => p.clickable !== false);
  const position = clickable.findIndex((p) => p.slug === project.slug);
  const neighbour = (offset: number) => {
    if (position < 0 || clickable.length < 2) return undefined;
    const p = clickable[(position + offset + clickable.length) % clickable.length];
    return { to: `/project/${p.slug}`, label: offset < 0 ? "Previous case study" : "Next case study", title: p.title };
  };

  let panel = 0;
  const nextIndex = () => String(++panel).padStart(2, "0");

  return (
    <>
      <Navbar home={false} />
      <main className="mx-auto max-w-[1180px] overflow-x-clip px-4 md:px-8">
        <DetailHero
          stage={start}
          back={<BackLink section="projects" label="All projects" />}
          eyebrow={
            <>
              {project.type}
              {project.org && <span className="text-muted-foreground"> · {project.org}</span>}
            </>
          }
          title={project.title}
          lede={<p>{project.impact}</p>}
        >
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a className="btn btn-primary" href="#overview">
              Read the case study ↓
            </a>
            {project.githubUrl && (
              <a className="btn" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                Source on GitHub ↗
              </a>
            )}
          </div>
        </DetailHero>

        <section
          id="overview"
          data-stage={start + 1}
          data-stage-x="0.62"
          data-stage-dim="0.35"
          className="grid scroll-mt-20 items-start gap-5 pb-16 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="space-y-5">
            <Panel index={nextIndex()} title="Project Overview">
              <p className="leading-relaxed">{project.overview}</p>
            </Panel>
            {project.caseStudy && (
              <Panel index={nextIndex()} title="Case Study">
                <CaseStudy data={project.caseStudy} accent={ACCENT} />
              </Panel>
            )}
            {project.businessValue && (
              <Panel index={nextIndex()} title="Business Value">
                <BusinessValue data={project.businessValue} accent={ACCENT} />
              </Panel>
            )}
            <Panel index={nextIndex()} title="Key Features">
              <ul className="space-y-3">
                {project.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <span className="mt-0.5 text-primary" aria-hidden="true">
                      →
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <SideCard title="Tech stack">
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span key={tech} className="chip">
                    {tech}
                  </span>
                ))}
              </div>
            </SideCard>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hud glowcard group flex items-center gap-4 p-5"
              >
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="text-foreground transition-colors group-hover:text-primary">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>
                  <span className="block font-semibold text-foreground transition-colors group-hover:text-primary">View on GitHub</span>
                  <span className="text-xs text-muted-foreground">Source code &amp; documentation</span>
                </span>
                <span className="ml-auto text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true">
                  ↗
                </span>
              </a>
            )}
            <SideCard title="Navigate">
              <BackLink section="projects" label="Back to all projects" />
            </SideCard>
          </aside>
        </section>

        {project.architecture && (
          <section data-stage={start + 2} data-stage-x="0.5" data-stage-dim="0.3" className="pb-12">
            <Panel index={nextIndex()} title="Architecture">
              <ArchitectureDiagram data={project.architecture} accent={ACCENT} />
            </Panel>
          </section>
        )}

        <Pager stage={start + 2} label="More case studies" prev={neighbour(-1)} next={neighbour(1)} />
      </main>
      <Footer />
    </>
  );
};

export default ProjectDetail;
