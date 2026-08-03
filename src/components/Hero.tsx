import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        {/* Architecture lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="hsl(239 84% 67%)" strokeWidth="1" strokeDasharray="8 8">
            <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="60%" y1="15%" x2="85%" y2="45%" stroke="hsl(263 70% 50%)" strokeWidth="1" strokeDasharray="8 8">
            <animate attributeName="stroke-dashoffset" values="0;-16" dur="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="30%" y1="60%" x2="70%" y2="80%" stroke="hsl(217 91% 60%)" strokeWidth="1" strokeDasharray="8 8">
            <animate attributeName="stroke-dashoffset" values="0;-16" dur="3s" repeatCount="indefinite" />
          </line>
          <circle cx="40%" cy="50%" r="4" fill="hsl(239 84% 67%)" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="85%" cy="45%" r="4" fill="hsl(263 70% 50%)" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="80%" r="3" fill="hsl(217 91% 60%)" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Nodes */}
          <rect x="8%" y="18%" width="30" height="20" rx="4" fill="none" stroke="hsl(239 84% 67%)" strokeWidth="0.5" opacity="0.3" />
          <rect x="58%" y="13%" width="30" height="20" rx="4" fill="none" stroke="hsl(263 70% 50%)" strokeWidth="0.5" opacity="0.3" />
          <rect x="28%" y="58%" width="30" height="20" rx="4" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-muted-foreground">Available for projects & opportunities</span>
            </motion.div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Full-Stack Engineer{" "}
              <span className="gradient-text">Building Scalable Backend Systems</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              I design and build reliable backend systems, APIs, and full-stack applications
              for modern products — helping businesses scale efficiently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 font-heading font-semibold text-primary-foreground transition-all hover:scale-105"
                style={{ backgroundImage: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(263 70% 50%))' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Get in Touch
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.a>
              <motion.a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 glass rounded-lg px-8 py-3.5 font-heading font-semibold text-foreground transition-all hover:bg-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                View My Work
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Profile image */}
          {/*
            This is the LCP element, so it is deliberately NOT wrapped in a
            motion fade: an element at opacity 0 does not count as painted,
            which pushed LCP out by the animation's delay + duration. The
            decorative glow behind it still animates.
          */}
          <div className="relative flex-shrink-0">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
              <motion.div
                className="absolute inset-0 rounded-full animate-float"
                style={{
                  backgroundImage: 'linear-gradient(135deg, hsl(239 84% 67% / 0.3), hsl(263 70% 50% / 0.3))',
                  filter: 'blur(30px)',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              />
              <div className="relative w-full h-full rounded-full overflow-hidden gradient-border glow">
                <img
                  src="/profile-640.webp"
                  srcSet="/profile-320.webp 320w, /profile-640.webp 640w"
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 288px, 256px"
                  alt="Software Engineer profile"
                  width={640}
                  height={640}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
