import fs from "fs";
import path from "path";
import assert from "assert";
import worker from "../src/worker.js";

const SITE_DIR = path.resolve("_site");
const SEO_PATH = path.resolve("src/_data/seo.json");
const SEO = JSON.parse(fs.readFileSync(SEO_PATH, "utf8"));
const ACTIVE_APPS = SEO.activeApps || [];
const DEPRECATED_APPS = new Set(SEO.deprecatedApps || []);
const NG_TERMS = ["税理士不要", "税理士の代わり", "申請代行", "確実に許可"];

const errors = [];
function fail(msg) {
  errors.push(msg);
}

function walkHtml(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

function stripTagsAndScripts(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countChars(text) {
  const hiragana = (text.match(/[\u3040-\u309F]/g) || []).length;
  const katakana = (text.match(/[\u30A0-\u30FF]/g) || []).length;
  const hangul = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  return { hiragana, katakana, hangul, kana: hiragana + katakana, total: text.length };
}

// 1. Check required discovery & markdown files
const requiredFiles = [
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "llms-full.txt",
  "blog/feed.xml",
  "index.md",
  ...ACTIVE_APPS.map((s) => `${s}/index.md`),
];

for (const rel of requiredFiles) {
  const full = path.join(SITE_DIR, rel);
  if (!fs.existsSync(full)) {
    fail(`Missing required output file: ${rel}`);
  } else if (fs.statSync(full).size < 50) {
    fail(`Output file suspiciously small: ${rel}`);
  } else if (rel.endsWith(".txt") || rel.endsWith(".md")) {
    const content = fs.readFileSync(full, "utf8");
    if (/&#39;|&amp;|&quot;|&lt;|&gt;/.test(content)) {
      fail(`Plain-text/Markdown file contains HTML entity escaping: ${rel}`);
    }
  }
}

// 2. Check robots.txt
if (fs.existsSync(path.join(SITE_DIR, "robots.txt"))) {
  const robots = fs.readFileSync(path.join(SITE_DIR, "robots.txt"), "utf8");
  for (const bot of ["OAI-SearchBot", "GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"]) {
    if (!robots.includes(bot)) fail(`robots.txt missing ${bot}`);
  }
  if (!robots.includes("Sitemap: https://sta3e-n.com/sitemap.xml")) {
    fail("robots.txt missing Sitemap directive");
  }
}

// 3. Check sitemap.xml
if (fs.existsSync(path.join(SITE_DIR, "sitemap.xml"))) {
  const sm = fs.readFileSync(path.join(SITE_DIR, "sitemap.xml"), "utf8");
  if (!sm.startsWith("<?xml version=\"1.0\"") || !sm.includes("</urlset>")) {
    fail("sitemap.xml is not valid XML wrapper");
  }
  for (const dep of DEPRECATED_APPS) {
    if (sm.includes(`/${dep}/`)) fail(`sitemap.xml must exclude deprecated app: ${dep}`);
  }
  for (const app of ACTIVE_APPS) {
    for (const locUrl of [
      `https://sta3e-n.com/${app}/`,
      `https://sta3e-n.com/en/${app}/`,
      `https://sta3e-n.com/ko/${app}/`,
    ]) {
      if (!sm.includes(`<loc>${locUrl}</loc>`)) {
        fail(`sitemap.xml missing <loc>${locUrl}</loc>`);
      }
    }
  }
}

// 4. Check JSON files for stray Korean Hangul in Japanese metadata
for (const jf of fs.readdirSync("src/_data/pages")) {
  if (!jf.endsWith(".json") || jf === "banjem.json") continue;
  const content = fs.readFileSync(path.join("src/_data/pages", jf), "utf8");
  if (/[\uAC00-\uD7AF]/.test(content)) {
    fail(`Unexpected Korean Hangul in Japanese page metadata: src/_data/pages/${jf}`);
  }
}

// 5. Check every built HTML file
const htmlFiles = walkHtml(SITE_DIR);
for (const file of htmlFiles) {
  const rel = path.relative(SITE_DIR, file);
  const html = fs.readFileSync(file, "utf8");

  if (!/<link rel="canonical" href="https:\/\/sta3e-n\.com\/[^"]*">/.test(html)) {
    fail(`${rel}: missing canonical link`);
  }
  if (!/<meta name="description" content="[^"]+">/.test(html)) {
    fail(`${rel}: missing meta description`);
  }
  if (!/<h1[\s>]/i.test(html)) {
    fail(`${rel}: missing <h1>`);
  }
  if (!/<main[\s>]/i.test(html)) {
    fail(`${rel}: missing <main> landmark`);
  }
  if (!/<meta property="og:site_name" content="STAGEN">/.test(html)) {
    fail(`${rel}: missing og:site_name`);
  }
  if (!/<meta property="og:locale" content="(ja_JP|en_US|ko_KR)">/.test(html)) {
    fail(`${rel}: missing og:locale`);
  }
  if (html.includes("/assets/branding/favicon.png")) {
    fail(`${rel}: references missing /assets/branding/favicon.png`);
  }

  const sanitizedForNg = html.replace(/申請代行は行いません/g, "");
  for (const ng of NG_TERMS) {
    if (sanitizedForNg.includes(ng)) fail(`${rel}: contains prohibited NG phrase "${ng}"`);
  }

  const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ldMatches.length === 0) {
    fail(`${rel}: missing JSON-LD`);
  }
  const graphTypes = new Set();
  for (const m of ldMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const node of parsed["@graph"] || [parsed]) {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        types.forEach((t) => graphTypes.add(t));
      }
    } catch (err) {
      fail(`${rel}: invalid JSON-LD (${err.message})`);
    }
  }

  const parts = rel.split(path.sep);
  const isEnOrKo = parts[0] === "en" || parts[0] === "ko";
  const locale = isEnOrKo ? parts[0] : "ja";
  const appSlug = isEnOrKo ? parts[1] : parts[0];
  const fileName = parts[parts.length - 1];

  if (DEPRECATED_APPS.has(appSlug)) {
    if (!/<meta name="robots" content="noindex, follow">/.test(html)) {
      fail(`${rel}: deprecated app page missing noindex`);
    }
  } else if (ACTIVE_APPS.includes(appSlug)) {
    if (fileName === "index.html") {
      for (const expectedType of ["SoftwareApplication", "FAQPage", "BreadcrumbList"]) {
        if (!graphTypes.has(expectedType)) {
          fail(`${rel}: active app index missing JSON-LD type ${expectedType}`);
        }
      }
      if (!html.includes('class="ai-seo-table"') || !html.includes('class="ai-seo-faq"')) {
        fail(`${rel}: active app index missing on-page spec table or FAQ`);
      }
    }
    if (isEnOrKo) {
      const text = stripTagsAndScripts(html);
      const stats = countChars(text);
      // Product names or loanwords may mention occasional Japanese terms (e.g. Tokyo addresses),
      // so verify kana density is strictly low (< 2.5% of body text).
      const kanaRatio = stats.kana / Math.max(stats.total, 1);
      if (kanaRatio > 0.025 || stats.kana > 45) {
        fail(`${rel}: localized ${locale} page still contains too much Japanese kana (${stats.kana} chars, ${(kanaRatio * 100).toFixed(2)}%)`);
      }
      if (locale === "ko" && stats.hangul < 40) {
        fail(`${rel}: localized Korean page has too little Hangul (${stats.hangul} chars)`);
      }
    }
  }

  // Check broken relative paths inside /en/{app}/ or /ko/{app}/
  if (isEnOrKo && ACTIVE_APPS.includes(appSlug)) {
    if (/src="(?:icon[^"]*\.png|screenshot-|screenshots\/|\.\.\/assets\/)/.test(html)) {
      fail(`${rel}: unrewritten relative image src in localized page`);
    }
  }
}

// 6. Worker unit verification (Markdown negotiation, AI telemetry, contact routing)
async function verifyWorker() {
  const recorded = [];
  const mockEnv = {
    UTM_ANALYTICS: {
      writeDataPoint(pt) {
        recorded.push(pt);
      },
    },
    ASSETS: {
      async fetch(req) {
        const u = new URL(req.url);
        const target = path.join(SITE_DIR, u.pathname === "/" ? "index.html" : u.pathname);
        if (fs.existsSync(target) && fs.statSync(target).isFile()) {
          return new Response(fs.readFileSync(target), { status: 200 });
        }
        return new Response("Not Found", { status: 404 });
      },
    },
  };
  const mockCtx = { waitUntil() {} };

  // Test 1: Accept: text/markdown on /zeiro/
  const mdRes = await worker.fetch(
    new Request("https://sta3e-n.com/zeiro/", {
      headers: { Accept: "text/markdown" },
    }),
    mockEnv,
    mockCtx
  );
  assert.strictEqual(mdRes.status, 200);
  assert.strictEqual(mdRes.headers.get("Content-Type"), "text/markdown; charset=utf-8");
  assert.strictEqual(mdRes.headers.get("Vary"), "Accept");
  assert.ok(mdRes.headers.get("Link")?.includes("https://sta3e-n.com/zeiro/"));
  const mdText = await mdRes.text();
  assert.ok(mdText.includes("Zeiro"), "Markdown response should contain Zeiro");

  // Test 2: AI Referrer logging
  await worker.fetch(
    new Request("https://sta3e-n.com/rakubill/", {
      headers: { Referer: "https://chatgpt.com/c/123", Accept: "text/html" },
    }),
    mockEnv,
    mockCtx
  );
  assert.ok(
    recorded.some((p) => p.indexes[0] === "ai_referral" && p.indexes[1] === "chatgpt.com" && p.blobs[0] === "/rakubill/"),
    "Worker should record AI referral telemetry"
  );

  // Test 3: AI Bot logging
  await worker.fetch(
    new Request("https://sta3e-n.com/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PerplexityBot/1.0)" },
    }),
    mockEnv,
    mockCtx
  );
  assert.ok(
    recorded.some((p) => p.indexes[0] === "ai_bot" && p.indexes[1] === "PerplexityBot"),
    "Worker should record AI bot crawl telemetry"
  );
}

await verifyWorker();

if (errors.length > 0) {
  console.error(`\n[verify-seo] FAILED with ${errors.length} error(s):`);
  for (const e of errors.slice(0, 50)) console.error(" - " + e);
  if (errors.length > 50) console.error(` ... and ${errors.length - 50} more.`);
  process.exit(1);
}

console.log(`[verify-seo] PASSED: checked ${htmlFiles.length} HTML pages, ${ACTIVE_APPS.length} active apps (ja/en/ko), discovery files, JSON-LD, and Worker behavior (0 errors).`);
