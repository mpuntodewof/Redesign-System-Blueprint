import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { SITE_URL } from "./src/lib/profile";
import { buildRobots, buildSitemap } from "./src/lib/sitemap";

/** Fills %SITE_URL% in index.html and emits sitemap.xml + robots.txt from the site data. */
const siteFiles = (): Plugin => ({
  name: "site-files",
  transformIndexHtml: {
    order: "pre",
    handler: (html) => html.replaceAll("%SITE_URL%", SITE_URL),
  },
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "sitemap.xml", source: buildSitemap(SITE_URL) });
    this.emitFile({ type: "asset", fileName: "robots.txt", source: buildRobots(SITE_URL) });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), siteFiles(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
