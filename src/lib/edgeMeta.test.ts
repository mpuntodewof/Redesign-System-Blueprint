// @vitest-environment node
import { handlePageRequest, type AssetFetcher } from "./edgeMeta";

const SHELL = '<html><head><title>Home</title><meta property="og:title" content="Home" /></head></html>';

const assets = (body = SHELL, init: ResponseInit = { headers: { "content-type": "text/html; charset=utf-8" } }) => {
  const calls: string[] = [];
  const fetcher: AssetFetcher = {
    fetch: async (request) => {
      calls.push(new URL(request.url).pathname);
      return new Response(body, init);
    },
  };
  return { fetcher, calls };
};

describe("handlePageRequest", () => {
  it("serves the SPA shell with case-study tags for a project URL", async () => {
    const { fetcher, calls } = assets();
    const res = await handlePageRequest(new Request("https://site.test/project/talenta-sap-integration"), fetcher);
    const html = await res.text();
    expect(calls).toEqual(["/"]);
    expect(html).toContain("<title>Talenta → SAP Integration — Case study · M. Puntodewo Fadhillah</title>");
    expect(html).toContain('content="Talenta → SAP Integration — Case study · M. Puntodewo Fadhillah"');
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("passes unknown pages through unchanged", async () => {
    const { fetcher } = assets();
    const res = await handlePageRequest(new Request("https://site.test/project/nope"), fetcher);
    expect(await res.text()).toBe(SHELL);
  });

  it("does not touch non-HTML or non-GET responses", async () => {
    const { fetcher } = assets("{}", { headers: { "content-type": "application/json" } });
    const res = await handlePageRequest(new Request("https://site.test/experience/bank-raya"), fetcher);
    expect(await res.text()).toBe("{}");
    const post = await handlePageRequest(new Request("https://site.test/experience/bank-raya", { method: "POST" }), assets().fetcher);
    expect(await post.text()).toBe(SHELL);
  });
});
