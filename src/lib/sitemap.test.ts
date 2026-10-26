import { buildRobots, buildSitemap, sitePaths } from "./sitemap";

describe("sitemap", () => {
  it("lists the homepage, clickable case studies and every role", () => {
    const paths = sitePaths();
    expect(paths[0]).toBe("/");
    expect(paths).toContain("/project/talenta-sap-integration");
    expect(paths).not.toContain("/project/e-credit-management");
    expect(paths).toContain("/experience/thortech-asia");
  });

  it("renders absolute URLs", () => {
    const xml = buildSitemap("https://site.test");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<loc>https://site.test/</loc>");
    expect(xml).toContain("<loc>https://site.test/experience/bank-raya</loc>");
  });

  it("points robots at the sitemap", () => {
    const robots = buildRobots("https://site.test");
    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots.trim().endsWith("Sitemap: https://site.test/sitemap.xml")).toBe(true);
  });
});
