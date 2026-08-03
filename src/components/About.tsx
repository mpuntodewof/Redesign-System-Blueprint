import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden gradient-border glow">
              {/* Below the fold, so this one stays lazy — it reuses the same
                  variants the hero already warmed in cache. */}
              <img
                src="/profile-320.webp"
                alt="Profile"
                width={320}
                height={320}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-heading text-sm font-semibold tracking-widest uppercase mb-4 block">About Me</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
              Engineering Software That <span className="gradient-text">Scales</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I'm a Software Engineer with 5+ years of experience building backend-heavy systems for
                banking, enterprise, and logistics domains. My core strength lies in designing scalable
                architectures, building reliable APIs, and solving complex performance challenges.
              </p>
              <p>
                While I specialize in backend development with .NET Core and SQL databases, I'm fully
                capable of delivering end-to-end solutions — from database design to React-based frontends.
                I believe the best engineers understand the full stack, even when they go deep in one area.
              </p>
              <p>
                I care about writing clean, maintainable code that teams can build on.
                Whether it's a freelance project or a full-time role, I bring the same
                commitment to quality and impact.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
