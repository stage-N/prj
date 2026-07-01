#!/usr/bin/env node
/** Generate 1200x630 OG SVG images for Tier 1/2 marketing apps */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://sta3e-n.com";

const APPS = [
  { slug: "zaitap", name: "ZaiTap", tagline: "在留手続をタップで", color: "#1395ba" },
  { slug: "zeical", name: "ZeiCal", tagline: "税務カレンダー", color: "#15b788" },
  { slug: "rakubill", name: "ラクビル", tagline: "請求書 ¥500買切", color: "#333333" },
  { slug: "wbgt-alert", name: "WBGT Alert", tagline: "熱中症アラート", color: "#e85d04" },
  { slug: "wbgt-recorder", name: "熱中症レコーダー Pro", tagline: "現場記録", color: "#e85d04" },
  { slug: "forest-school", name: "もりのがっこう", tagline: "完全無料・知育", color: "#2d6a4f" },
  { slug: "fuzen", name: "Fuzen", tagline: "Think in Fuzen", color: "#15b788" },
  { slug: "stock-pulse", name: "StockPulse", tagline: "日本株ポートフォリオ分析", color: "#1A237E" },
];

function svg({ name, tagline, color }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1a1a1a"/>
  <rect x="0" y="0" width="1200" height="8" fill="${color}"/>
  <text x="80" y="280" fill="#ffffff" font-family="system-ui,sans-serif" font-size="72" font-weight="800">${name}</text>
  <text x="80" y="360" fill="${color}" font-family="system-ui,sans-serif" font-size="36" font-weight="600">${tagline}</text>
  <text x="80" y="520" fill="#888888" font-family="system-ui,sans-serif" font-size="28">STAGEN — sta3e-n.com</text>
</svg>`;
}

for (const app of APPS) {
  const dir = path.join(ROOT, "..", app.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "og-image.svg"), svg(app));
  console.log(`${BASE}/${app.slug}/og-image.svg`);
}

console.log("done: 6 OG SVG files");
