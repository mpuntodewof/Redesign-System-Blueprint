import { defaultMeta, injectMeta, metaForPath } from "./pageMeta";
import { SITE_URL } from "./profile";

describe("metaForPath", () => {
  it("returns the default meta for the homepage, with or without a trailing slash", () => {
    expect(metaForPath("/")).toEqual(defaultMeta);
    expect(metaForPath("")).toEqual(defaultMeta);
  });

  it("describes a clickable case study", () => {
    const meta = metaForPath("/project/talenta-sap-integration/");
    expect(meta?.title).toBe("Talenta → SAP Integration — Case study · M. Puntodewo Fadhillah");
    expect(meta?.url).toBe(`${SITE_URL}/project/talenta-sap-integration`);
    expect(meta?.description.length).toBeGreaterThan(20);
  });

  it("has no page for private (non-clickable) projects or unknown slugs", () => {
    expect(metaForPath("/project/e-credit-management")).toBeNull();
    expect(metaForPath("/project/nope")).toBeNull();
    expect(metaForPath("/somewhere")).toBeNull();
  });

  it("describes an experience role", () => {
    const meta = metaForPath("/experience/bank-raya");
    expect(meta?.title).toBe("Backend Developer at PT Bank Raya · M. Puntodewo Fadhillah");
    expect(meta?.description).toContain("BI-FAST middleware");
    expect(meta?.url).toBe(`${SITE_URL}/experience/bank-raya`);
  });
});

describe("injectMeta", () => {
  const shell = [
    "<title>Old</title>",
    '<meta name="description" content="old" />',
    '<link rel="canonical" href="https://x/" />',
    '<meta property="og:title" content="old" />',
    '<meta property="og:description" content="old" />',
    '<meta property="og:url" content="https://x/" />',
    '<meta name="twitter:title" content="old" />',
    '<meta name="twitter:description" content="old" />',
  ].join("\n");

  it("replaces every page-specific tag and escapes HTML", () => {
    const html = injectMeta(shell, { title: 'A & "B"', description: "Costs $1 <b>", url: "https://site/p" });
    expect(html).toContain("<title>A &amp; &quot;B&quot;</title>");
    expect(html).toContain('<meta name="description" content="Costs $1 &lt;b&gt;" />');
    expect(html).toContain('<link rel="canonical" href="https://site/p" />');
    expect(html).toContain('<meta property="og:title" content="A &amp; &quot;B&quot;" />');
    expect(html).toContain('<meta property="og:url" content="https://site/p" />');
    expect(html).toContain('<meta name="twitter:description" content="Costs $1 &lt;b&gt;" />');
    expect(html).not.toContain("old");
  });

  it("leaves a shell without those tags untouched", () => {
    expect(injectMeta("<p>hi</p>", defaultMeta)).toBe("<p>hi</p>");
  });
});
