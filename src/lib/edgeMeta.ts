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

  const shell = await assets.fetch(new Request(new URL("/", request.url), { headers: request.headers }));
  try {
    const type = shell.headers.get("content-type") ?? "";
    if (!shell.ok || !type.includes("text/html")) return shell;
    const html = injectMeta(await shell.clone().text(), meta);
    const headers = new Headers(shell.headers);
    headers.delete("content-length");
    return new Response(request.method === "HEAD" ? null : html, { status: shell.status, headers });
  } catch {
    return shell;
  }
}
