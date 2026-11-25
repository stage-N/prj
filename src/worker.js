/**
 * UTM + AI Referrer/Bot Analytics Engine middleware & Markdown Content Negotiation
 * Cloudflare Workers + static assets
 * ponytail: query/header telemetry only; no IP storage beyond AE defaults
 */
import { handleContact } from "./contact.js";

const ACTIVE_APPS = new Set([
  "zaitap",
  "zeical",
  "wbgt-recorder",
  "wbgt-alert",
  "rakubill",
  "forest-school",
  "fuzen",
  "stock-pulse",
  "touten",
  "phraseflow",
  "phraseflow-christianity",
  "phraseflow-buddhism",
  "phraseflow-islam",
  "phraseflow-religion",
  "banjem",
  "newsprism",
  "stillpoint",
  "pagepace",
  "zeiro",
]);

const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "you.com",
  "phind.com",
];

const AI_BOT_PATTERNS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

function matchAiReferrer(refererHeader) {
  if (!refererHeader) return "";
  try {
    const host = new URL(refererHeader).hostname.toLowerCase();
    for (const target of AI_REFERRER_HOSTS) {
      if (host === target || host.endsWith(`.${target}`)) return target;
    }
  } catch {
    return "";
  }
  return "";
}

function matchAiBot(userAgent) {
  if (!userAgent) return "";
  const lower = userAgent.toLowerCase();
  for (const bot of AI_BOT_PATTERNS) {
    if (lower.includes(bot.toLowerCase())) return bot;
  }
  return "";
}

function resolveMarkdownMapping(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return { assetPath: "/index.md", canonicalPath: "/" };
  }
  const clean = pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  const slug = clean.startsWith("/") ? clean.slice(1) : clean;
  if (ACTIVE_APPS.has(slug)) {
    return { assetPath: `/${slug}/index.md`, canonicalPath: `/${slug}/` };
  }
  return null;
}

function canonicalFromMdPath(pathname) {
  if (pathname === "/index.md") return "/";
  if (pathname.endsWith("/index.md")) {
    return pathname.slice(0, -"index.md".length);
  }
  return pathname;
}

function wantsMarkdown(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  return accept.includes("text/markdown") && !accept.includes("text/html");
}

function recordTelemetry(request, url, env, ctx) {
  const analytics = env?.UTM_ANALYTICS;
  if (!analytics || typeof analytics.writeDataPoint !== "function") return;

  const source = url.searchParams.get("utm_source") || "";
  const medium = url.searchParams.get("utm_medium") || "";
  const campaign = url.searchParams.get("utm_campaign") || "";

  let point = null;
  if (source || medium || campaign) {
    point = {
      indexes: [source, medium, campaign],
      blobs: [url.pathname, url.searchParams.get("utm_content") || ""],
      doubles: [Date.now()],
    };
  } else {
    const aiRef = matchAiReferrer(request.headers.get("Referer") || "");
    if (aiRef) {
      point = {
        indexes: ["ai_referral", aiRef, "organic"],
        blobs: [url.pathname, ""],
        doubles: [Date.now()],
      };
    } else {
      const aiBot = matchAiBot(request.headers.get("User-Agent") || "");
      if (aiBot) {
        point = {
          indexes: ["ai_bot", aiBot, "crawl"],
          blobs: [url.pathname, ""],
          doubles: [Date.now()],
        };
      }
    }
  }

  if (point) {
    const p = analytics.writeDataPoint(point);
    if (ctx && typeof ctx.waitUntil === "function" && p && typeof p.then === "function") {
      ctx.waitUntil(p);
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContact(request, env);
    }

    recordTelemetry(request, url, env, ctx);

    if (wantsMarkdown(request)) {
      const mapping = resolveMarkdownMapping(url.pathname);
      if (mapping) {
        const mdUrl = new URL(mapping.assetPath, url.origin);
        const mdReq = new Request(mdUrl.toString(), { method: request.method });
        const mdRes = await env.ASSETS.fetch(mdReq);
        if (mdRes.ok) {
          const headers = new Headers(mdRes.headers);
          headers.set("Content-Type", "text/markdown; charset=utf-8");
          headers.set("Vary", "Accept");
          headers.set("Link", `<https://sta3e-n.com${mapping.canonicalPath}>; rel="canonical"`);
          return new Response(mdRes.body, { status: mdRes.status, headers });
        }
      }
    }

    const res = await env.ASSETS.fetch(request);

    if (res.ok && url.pathname.endsWith(".md")) {
      const headers = new Headers(res.headers);
      headers.set("Content-Type", "text/markdown; charset=utf-8");
      const canonicalPath = canonicalFromMdPath(url.pathname);
      headers.set("Link", `<https://sta3e-n.com${canonicalPath}>; rel="canonical"`);
      return new Response(res.body, { status: res.status, headers });
    }

    if (res.ok && resolveMarkdownMapping(url.pathname)) {
      const headers = new Headers(res.headers);
      const vary = headers.get("Vary");
      if (!vary) {
        headers.set("Vary", "Accept");
      } else if (!vary.toLowerCase().split(",").map((v) => v.trim()).includes("accept")) {
        headers.set("Vary", `${vary}, Accept`);
      }
      return new Response(res.body, { status: res.status, headers });
    }

    return res;
  },
};
