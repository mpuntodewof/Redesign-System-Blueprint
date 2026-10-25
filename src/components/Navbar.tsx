import { useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const navLinks = [
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Contract", href: "#contract" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const ratio = max > 0 ? root.scrollTop / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[62px] max-w-[1180px] items-center gap-3 px-4 md:px-8 lg:gap-7">
        <a href="#top" className="mr-auto flex items-center gap-3 font-semibold tracking-tight text-foreground">
          <span className="rounded border border-primary/50 px-[7px] py-1 font-mono text-[11px] font-semibold text-primary">
            MPF
          </span>
          Puntodewo Fadhillah
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[5px] px-3 py-1.5 font-mono text-[12.5px] uppercase tracking-[0.04em] text-muted-foreground transition-colors hover:bg-primary/[0.07] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <a className="btn" href={RESUME_URL} download={RESUME_FILENAME}>
          Résumé ↓
        </a>
      </div>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
    </header>
  );
};

export default Navbar;
