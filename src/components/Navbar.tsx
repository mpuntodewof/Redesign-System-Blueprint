import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/profile";

const navLinks = [
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Work with me", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const brandClass = "mr-auto flex items-center gap-3 font-semibold tracking-tight text-foreground";
const brand = (
  <>
    <span className="rounded border border-primary/50 px-[7px] py-1 font-mono text-[11px] font-semibold text-primary">MPF</span>
    <span className="hidden sm:inline">Puntodewo Fadhillah</span>
  </>
);
const linkClass =
  "rounded-[5px] px-3 py-1.5 font-mono text-[12.5px] uppercase tracking-[0.04em] text-muted-foreground transition-colors hover:bg-primary/[0.07] hover:text-foreground";

interface NavbarProps {
  /** On the homepage links are in-page anchors; elsewhere they route back to "/#section". */
  home?: boolean;
}

const Navbar = ({ home = true }: NavbarProps) => {
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
        {home ? (
          <a href="#top" className={brandClass}>
            {brand}
          </a>
        ) : (
          <Link to="/" className={brandClass}>
            {brand}
          </Link>
        )}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) =>
            home ? (
              <a key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={`/${link.href}`} className={linkClass}>
                {link.label}
              </Link>
            ),
          )}
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
