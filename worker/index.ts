import { handlePageRequest, type AssetFetcher } from "../src/lib/edgeMeta";

interface Env {
  ASSETS: AssetFetcher;
}

// Runs only for /project/* and /experience/* (see run_worker_first in wrangler.jsonc);
// every other request is answered by the static assets directly.
export default {
  fetch: (request: Request, env: Env) => handlePageRequest(request, env.ASSETS),
};
