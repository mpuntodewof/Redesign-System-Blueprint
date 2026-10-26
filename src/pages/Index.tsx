import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import KpiStrip from "@/components/KpiStrip";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StageRail, { type RailStage } from "@/components/particles/StageRail";
import { useScrollStage } from "@/hooks/useScrollStage";

/** One entry per field shape, in data-stage order. */
const RAIL: RailStage[] = [
  { href: "#top", label: "Intro", figure: "runtime · sphere" },
  { href: "#experience", label: "Experience", figure: "service mesh · 13 nodes" },
  { href: "#projects", label: "Projects", figure: "data layer · stacked stores" },
  { href: "#stack", label: "Stack", figure: "interface · {API}" },
  { href: "#contact", label: "Contact", figure: "single endpoint · core" },
];

const Index = () => {
  const location = useLocation();
  useScrollStage("home");

  // Detail pages link back with either router state ({ scrollTo }) or a hash.
  useEffect(() => {
    const fromState = (location.state as { scrollTo?: string } | null)?.scrollTo;
    const target = fromState ?? (location.hash ? decodeURIComponent(location.hash.slice(1)) : undefined);
    if (!target) return;
    const el = document.getElementById(target);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    if (fromState) window.history.replaceState({}, "");
  }, [location.state, location.hash]);

  return (
    <>
      <Navbar />
      <StageRail stages={RAIL} />
      <main id="top" className="mx-auto max-w-[1180px] overflow-x-clip px-4 md:px-8">
        <Hero />
        <KpiStrip />
        <Experience />
        <Projects />
        <TechStack />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
