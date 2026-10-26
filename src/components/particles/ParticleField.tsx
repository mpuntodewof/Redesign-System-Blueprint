import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { FieldTheme, ParticleEngine } from "./engine";

/**
 * Site-wide WebGL backdrop. Mounted once above the router so the field keeps its
 * state across pages and morphs into each page's shapes instead of restarting.
 * Three.js loads in its own chunk after first paint.
 */
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const { resolvedTheme } = useTheme();
  const theme: FieldTheme = resolvedTheme === "light" ? "light" : "dark";
  const themeRef = useRef(theme);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
    engineRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    import("./engine")
      .then(({ createParticleEngine }) => {
        if (cancelled || !canvasRef.current) return;
        const engine = createParticleEngine(canvasRef.current, () => setFallback(true));
        if (!engine) {
          setFallback(true);
          return;
        }
        engine.setTheme(themeRef.current);
        engineRef.current = engine;
      })
      .catch(() => setFallback(true));
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <>
      <div className={cn("field-bg", fallback && "field-bg-fallback")} aria-hidden="true" />
      {!fallback && <canvas ref={canvasRef} className="field-canvas" aria-hidden="true" />}
      <div className="field-vignette" aria-hidden="true" />
    </>
  );
};

export default ParticleField;
