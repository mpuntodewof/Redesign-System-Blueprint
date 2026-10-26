// Relative imports only: this module is loaded by vite.config.ts.
import projects from "../data/projects";
import { roles } from "../data/experience";

export function sitePaths(): string[] {
  return [
    "/",
    ...projects.filter((p) => p.clickable !== false).map((p) => `/project/${p.slug}`),
    ...roles.map((r) => `/experience/${r.slug}`),
  ];
}

export function buildSitemap(siteUrl: string): string {
  const urls = sitePaths()
    .map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const CRAWLERS = ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit", "LinkedInBot", "*"];

export function buildRobots(siteUrl: string): string {
  const groups = CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n");
  return `${groups}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}
