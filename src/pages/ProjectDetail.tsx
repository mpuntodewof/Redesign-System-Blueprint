import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import projects from "@/data/projects";
import Footer from "@/components/Footer";
import CaseStudy from "@/components/project/CaseStudy";
import ArchitectureDiagram from "@/components/project/ArchitectureDiagram";
import BusinessValue from "@/components/project/BusinessValue";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 glass rounded-lg px-6 py-3 font-heading font-semibold text-foreground transition-all hover:bg-secondary"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Case-study pages follow the site palette rather than per-project colours.
  const color1 = "var(--primary)";
  const color2 = "var(--border-strong)";

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header with background */}
      <section className="relative h-[340px] sm:h-[400px] flex items-end overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, hsl(${color1} / 0.25), hsl(${color2} / 0.25))`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(${color1}) 1px, transparent 1px), linear-gradient(90deg, hsl(${color1}) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
          {/* Decorative icons */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <line x1="15%" y1="25%" x2="45%" y2="55%" stroke={`hsl(${color1})`} strokeWidth="1" strokeDasharray="8 8">
              <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="55%" y1="20%" x2="80%" y2="50%" stroke={`hsl(${color2})`} strokeWidth="1" strokeDasharray="8 8">
              <animate attributeName="stroke-dashoffset" values="0;-16" dur="2.5s" repeatCount="indefinite" />
            </line>
            <circle cx="45%" cy="55%" r="4" fill={`hsl(${color1})`} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="80%" cy="50%" r="3" fill={`hsl(${color2})`} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </circle>
          </svg>
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Back button */}
        <motion.button
          onClick={() => navigate("/", { state: { scrollTo: "projects" } })}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 glass rounded-lg px-4 py-2 text-sm font-heading font-semibold text-foreground transition-all hover:bg-secondary"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </motion.button>

        {/* Header content */}
        <div className="container relative z-10 mx-auto px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-heading font-semibold rounded-full px-3 py-1 mb-4 inline-block"
              style={{
                backgroundColor: `hsl(${color1} / 0.15)`,
                color: `hsl(${color1})`,
              }}
            >
              {project.type}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
              {project.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{project.impact}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
            {/* Main content - left/center */}
            <div className="lg:col-span-2 space-y-12">
              {/* Project Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-heading text-2xl font-bold mb-4">
                  Project <span className="gradient-text">Overview</span>
                </h2>
                <p className="text-secondary-foreground leading-relaxed">{project.overview}</p>
              </motion.div>

              {/* Case Study */}
              {project.caseStudy && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h2 className="font-heading text-2xl font-bold mb-4">
                    Case <span className="gradient-text">Study</span>
                  </h2>
                  <CaseStudy data={project.caseStudy} accent={color1} />
                </motion.div>
              )}

              {/* Business Value */}
              {project.businessValue && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h2 className="font-heading text-2xl font-bold mb-4">
                    Business <span className="gradient-text">Value</span>
                  </h2>
                  <BusinessValue data={project.businessValue} accent={color1} />
                </motion.div>
              )}

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-heading text-2xl font-bold mb-4">
                  Key <span className="gradient-text">Features</span>
                </h2>
                <ul className="space-y-3">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-secondary-foreground">
                      <span
                        className="mt-1 flex-shrink-0"
                        style={{ color: `hsl(${color1})` }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Tech Stack */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-heading text-lg font-semibold mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span key={tech} className="text-xs bg-secondary text-secondary-foreground rounded-md px-3 py-1.5 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* GitHub link */}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl p-6 flex items-center gap-4 group hover:glow transition-all duration-300 cursor-pointer block"
                >
                  <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-foreground group-hover:text-primary transition-colors">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">View on GitHub</p>
                    <p className="text-xs text-muted-foreground">Source code & documentation</p>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              )}

              {/* Back to projects */}
              <button
                onClick={() => {
                  navigate("/", { state: { scrollTo: "projects" } });
                }}
                className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 font-heading font-semibold text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to All Projects
              </button>
            </motion.div>
          </div>

          {/* Architecture - full width */}
          {project.architecture && (
            <motion.div
              className="max-w-6xl mx-auto mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="font-heading text-2xl font-bold mb-4">
                <span className="gradient-text">Architecture</span>
              </h2>
              <ArchitectureDiagram data={project.architecture} accent={color1} />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ProjectDetail;
