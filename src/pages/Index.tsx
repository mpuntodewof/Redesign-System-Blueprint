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

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  return (
    <>
      <div className="grid-backdrop" aria-hidden="true" />
      <Navbar />
      <main id="top" className="mx-auto max-w-[1180px] overflow-x-hidden px-4 md:px-8">
        <Hero />
        <KpiStrip />
        <Experience />
        <Projects />
        <TechStack />
        <Services />
        <Contact />
      </main>
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <Footer />
      </div>
    </>
  );
};

export default Index;
