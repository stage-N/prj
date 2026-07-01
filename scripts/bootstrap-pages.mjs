#!/usr/bin/env node
/**
 * One-time helper: extract <body> from legacy HTML into src/_includes/bodies/
 * and create locale-paginated page stubs in src/pages/.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const APPS = [
  "zaitap",
  "zeical",
  "wbgt-recorder",
  "wbgt-alert",
  "rakubill",
  "forest-school",
  "shower-guard",
  "cool-walk",
  "fuzen",
  "stock-pulse",
];
const PAGES = ["index", "privacy", "support"];

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1].trim() : html;
}

function extractHeadMeta(html) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
  const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] || title;
  const ogDesc = html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] || desc;
  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] || "";
  const icon = html.match(/<link rel="icon" href="([^"]*)"/i)?.[1] || "";
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? styleMatch[1].trim() : "";
  const accentMatch = styles.match(/color:\s*(#[0-9a-fA-F]{3,8})/);
  const accent = accentMatch?.[1] || "#1395ba";
  return { title, desc, ogTitle, ogDesc, ogImage, icon, styles, accent };
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function writePageStub(outPath, meta) {
  const { app, page, layout } = meta;
  const permalinkBase =
    page === "index"
      ? app
        ? `${app}/index.html`
        : "index.html"
      : `${app}/${page}.html`;

  const stub = `---
layout: ${layout}
pagination:
  data: site.locales
  size: 1
  alias: loc
permalink: "{% if loc.code == 'ja' %}/${permalinkBase}{% else %}/{{ loc.code }}/${permalinkBase}{% endif %}"
app: ${app ? `"${app}"` : "false"}
pageName: ${page}
eleventyExcludeFromCollections: true
---
`;
  writeFileSync(outPath, stub);
}

// Site index
const siteHtml = readFileSync(join(ROOT, "index.html"), "utf8");
ensureDir(join(ROOT, "src/_includes/bodies"));
ensureDir(join(ROOT, "src/pages"));
ensureDir(join(ROOT, "src/_data/pages"));
writeFileSync(join(ROOT, "src/_includes/bodies/site-index.html"), extractBody(siteHtml));
writeFileSync(
  join(ROOT, "src/_data/pages/site-index.json"),
  JSON.stringify(extractHeadMeta(siteHtml), null, 2)
);
writePageStub(join(ROOT, "src/pages/index.njk"), { app: null, page: "index", layout: "site.njk" });

for (const app of APPS) {
  const metaPath = join(ROOT, `src/_data/pages/${app}.json`);
  ensureDir(dirname(metaPath));
  const appMeta = {};

  for (const page of PAGES) {
    const file = join(ROOT, `${app}/${page}.html`);
    const html = readFileSync(file, "utf8");
    const bodyPath = join(ROOT, `src/_includes/bodies/${app}-${page}.html`);
    writeFileSync(bodyPath, extractBody(html));
    appMeta[page] = extractHeadMeta(html);

    ensureDir(join(ROOT, `src/pages/${app}`));
    const layout = page === "index" ? "app.njk" : "legal.njk";
    writePageStub(join(ROOT, `src/pages/${app}/${page}.njk`), { app, page, layout });
  }

  writeFileSync(metaPath, JSON.stringify(appMeta, null, 2));
}

console.log("Bootstrap complete.");
