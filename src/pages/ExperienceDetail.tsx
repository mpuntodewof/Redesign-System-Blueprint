import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BackLink, DetailHero, Pager, Panel, SideCard } from "@/components/detail/DetailParts";
import { roles } from "@/data/experience";
import projects from "@/data/projects";
import { useScrollStage } from "@/hooks/useScrollStage";
import { LINKEDIN_URL } from "@/lib/profile";

const ExperienceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const index = roles.findIndex((r) => r.slug === slug);
  const role = roles[index];
  useScrollStage(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!role) {
    return (
      <>
        <Navbar home={false} />
        <main className="mx-auto flex min-h-[70svh] max-w-[1180px] items-center px-4 md:px-8">
          <div data-stage="4" data-stage-x="0.5">
            <h1 className="mb-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">Role not found</h1>
            <p className="mb-6">There is no role at this address.</p>
            <BackLink section="experience" label="All experience" />
          </div>
        </main>
      </>
    );
  }

  const related = role.projectOrg ? projects.filter((p) => p.org === role.projectOrg) : [];
  // Roles are newest first, so the previous index is the more recent role.
  const newer = roles[index - 1];
  const older = roles[index + 1];

  return (
    <>
      <Navbar home={false} />
      <main className="mx-auto max-w-[1180px] overflow-x-clip px-4 md:px-8">
        <DetailHero
          stage={1}
          back={<BackLink section="experience" label="All experience" />}
          eyebrow={
            <>
              {role.fullPeriod}
              <span className="text-muted-foreground"> · {role.industry}</span>
            </>
          }
          title={role.role}
          lede={
            <p>
              at <b className="font-semibold text-foreground">{role.company}</b>, building{" "}
              {role.modules.map((m) => m.name).join(", ")}.
            </p>
          }
        >
          {role.impact.length > 0 && (
            <ul aria-label="Impact" className="mt-6 flex flex-wrap gap-1.5">
              {role.impact.map((item) => (
                <li key={item} className="chip chip-impact">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </DetailHero>

        <section
          data-stage="2"
          data-stage-x="0.62"
          data-stage-dim="0.35"
          className="grid items-start gap-5 pb-16 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="space-y-5">
            <Panel index="01" title="Systems delivered">
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                {role.modules.map((module) => (
                  <div key={module.name} className="rounded border border-border bg-primary/[0.03] p-4">
                    <h3 className="text-[15px] font-semibold text-foreground">{module.name}</h3>
                    <p className="mt-1 text-[13.5px]">{module.summary}</p>
                    {module.route && <p className="mt-2 font-mono text-[11px] font-medium text-primary">{module.route}</p>}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel index="02" title="What I did">
              <ul className="space-y-3.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-[14.5px] leading-relaxed">
                    <span className="mt-0.5 text-primary" aria-hidden="true">
                      →
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <SideCard title="Stack">
              <div className="flex flex-wrap gap-1.5">
                {role.stack.map((tech) => (
                  <span key={tech} className="chip">
                    {tech}
                  </span>
                ))}
              </div>
            </SideCard>
            {related.length > 0 && (
              <SideCard title="Related case studies">
                <ul className="space-y-2.5 text-sm">
                  {related.map((project) => (
                    <li key={project.slug}>
                      {project.clickable === false ? (
                        <span>
                          {project.title} <span className="mono-label">· private</span>
                        </span>
                      ) : (
                        <Link
                          to={`/project/${project.slug}`}
                          className="font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {project.title} →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </SideCard>
            )}
            <SideCard title="Navigate">
              <div className="flex flex-col gap-2.5">
                <BackLink section="experience" label="Back to all experience" />
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-primary"
                >
                  LinkedIn profile ↗
                </a>
              </div>
            </SideCard>
          </aside>
        </section>

        <Pager
          stage={3}
          label="Other roles"
          prev={newer && { to: `/experience/${newer.slug}`, label: "More recent role", title: newer.company }}
          next={older && { to: `/experience/${older.slug}`, label: "Earlier role", title: older.company }}
        />
      </main>
      <Footer />
    </>
  );
};

export default ExperienceDetail;
