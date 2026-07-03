/**
 * UTM Analytics Engine middleware — Cloudflare Workers + static assets
 * ponytail: UTM query only; no IP storage beyond AE defaults
 */
import { handleContact } from "./contact.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContact(request, env);
    }

    const source = url.searchParams.get("utm_source") || "";
    const medium = url.searchParams.get("utm_medium") || "";
    const campaign = url.searchParams.get("utm_campaign") || "";

    if (source || medium || campaign) {
      ctx.waitUntil(
        env.UTM_ANALYTICS.writeDataPoint({
          indexes: [source, medium, campaign],
          blobs: [url.pathname, url.searchParams.get("utm_content") || ""],
          doubles: [Date.now()],
        })
      );
    }

    return env.ASSETS.fetch(request);
  },
};
