// Relative imports only: this module is bundled into the Cloudflare Worker.
import { injectMeta, metaForPath } from "./pageMeta";

/** The subset of the Workers static-assets binding this module uses. */
export interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

/**
 * Serves the SPA shell for a deep link with that page's title and preview tags,
 * so link unfurlers (LinkedIn, WhatsApp, Slack) that do not run JavaScript see
 * the right card. Anything unexpected falls back to the untouched asset response.
 */
export async function handlePageRequest(request: Request, assets: AssetFetcher): Promise<Response> {
  const meta = request.method === "GET" || request.method === "HEAD" ? metaForPath(new URL(request.url).pathname) : null;
  if (!meta) return assets.fetch(request);

  try {
    // No request headers: Range or conditional headers would yield a partial or 304 shell.
    const shell = await assets.fetch(new Request(new URL("/", request.url)));
    const type = shell.headers.get("content-type") ?? "";
    if (shell.status !== 200 || !type.includes("text/html")) return shell;
    const html = injectMeta(await shell.text(), meta);
    const headers = new Headers(shell.headers);
    // The body differs per page, so the shell's length and validator no longer apply.
    headers.delete("content-length");
    headers.delete("etag");
    return new Response(request.method === "HEAD" ? null : html, { status: 200, headers });
  } catch {
    return assets.fetch(request);
  }
}
