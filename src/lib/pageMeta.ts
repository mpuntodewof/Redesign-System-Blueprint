// Relative imports only: this module is bundled into the Cloudflare Worker.
import projects from "../data/projects";
import { roles } from "../data/experience";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "./profile";

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  url: string;
}

export const defaultMeta: PageMeta = { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, url: `${SITE_URL}/` };

const SUFFIX = "M. Puntodewo Fadhillah";

/** Title, description and canonical URL for a route, or null when the route has no page of its own. */
export function metaForPath(pathname: string): PageMeta | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return defaultMeta;

  const projectSlug = path.match(/^\/project\/([^/]+)$/)?.[1];
  if (projectSlug) {
    const project = projects.find((p) => p.slug === projectSlug && p.clickable !== false);
    if (!project) return null;
    return {
      title: `${project.title} — Case study · ${SUFFIX}`,
      description: project.impact,
      url: `${SITE_URL}/project/${project.slug}`,
    };
  }

  const roleSlug = path.match(/^\/experience\/([^/]+)$/)?.[1];
  if (roleSlug) {
    const role = roles.find((r) => r.slug === roleSlug);
    if (!role) return null;
    return {
      title: `${role.role} at ${role.company} · ${SUFFIX}`,
      description: `${role.fullPeriod} · ${role.modules.map((m) => m.name).join(", ")}.`,
      url: `${SITE_URL}/experience/${role.slug}`,
    };
  }

  return null;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Rewrites the SPA shell's page-specific head tags. Tags the shell lacks are left alone. */
export function injectMeta(html: string, meta: PageMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  // Function replacers: a `$` in page text must not be read as a back-reference.
  const attr = (pattern: RegExp, value: string) => (source: string) =>
    source.replace(pattern, (_, before: string, after: string) => `${before}${value}${after}`);
  const steps = [
    (s: string) => s.replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`),
    attr(/(<meta name="description" content=")[^"]*(")/, description),
    attr(/(<link rel="canonical" href=")[^"]*(")/, url),
    attr(/(<meta property="og:title" content=")[^"]*(")/, title),
    attr(/(<meta property="og:description" content=")[^"]*(")/, description),
    attr(/(<meta property="og:url" content=")[^"]*(")/, url),
    attr(/(<meta name="twitter:title" content=")[^"]*(")/, title),
    attr(/(<meta name="twitter:description" content=")[^"]*(")/, description),
  ];
  return steps.reduce((acc, step) => step(acc), html);
}
