#!/usr/bin/env node
/** Generate 1200x630 OG images (SVG source + PNG for X/OG crawlers) */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

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
  { slug: "touten", name: "Touten", tagline: "日本5紙の報道スタンス比較", color: "#37474F" },
  { slug: "phraseflow", name: "Phrase Flow", tagline: "Daily Wisdom & Dual Perspectives", color: "#15b788" },
  { slug: "stillpoint", name: "Stillpoint", tagline: "Sit with a thought. Let the questions deepen.", color: "#B8C0D6" },
  { slug: "pagepace", name: "PagePace", tagline: "Every page has a pace. Find yours.", color: "#F59E0B" },
  { slug: "briefforge", name: "BriefForge", tagline: "Ship Ambition. Kill the Rest.", color: "#3B82F6" },
  { slug: "banjem", name: "Banjem", tagline: "Banjem — Korean news stance comparison", color: "#15b788" },
  { slug: "newsprism", name: "NewsPrism", tagline: "US news stance comparison", color: "#15b788" },
  { slug: "zeiro", name: "Zeiro (税路)", tagline: "1人法人の統合経理・給与・AI自動仕訳", color: "#15b788" },
];

const SITE = { slug: "assets", name: "STAGEN", tagline: "人が活躍できる場は１つではない", color: "#15b788" };

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

function writeOg(dir, app) {
  let markup;
  if (app.slug === "phraseflow") {
    markup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15b788"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1395ba"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#15b788" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#15b788" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  
  <!-- Sleek Top Accent Line -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#greenGrad)"/>

  <!-- Brand Symbol on the Right -->
  <g transform="translate(860, 315)" filter="url(#shadow)">
    <circle cx="-55" cy="0" r="130" fill="url(#greenGrad)" opacity="0.88"/>
    <circle cx="55" cy="0" r="130" fill="url(#blueGrad)" opacity="0.88"/>
    <text x="-75" y="40" font-family="Georgia, serif" font-size="140" font-weight="bold" fill="#ffffff" text-anchor="middle">“</text>
    <text x="65" y="40" font-family="Georgia, serif" font-size="140" font-weight="bold" fill="#ffffff" text-anchor="middle">”</text>
    <path d="M -100, 170 C -50, 190 -20, 150 15, 170 C 50, 190 70, 150 100, 170" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
  </g>

  <!-- Brand Info on the Left -->
  <g transform="translate(100, 0)">
    <!-- Eyebrow tag -->
    <rect x="0" y="160" width="280" height="32" rx="16" fill="rgba(21,183,136,0.1)" stroke="rgba(21,183,136,0.2)" stroke-width="1"/>
    <text x="140" y="181" fill="#15b788" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" text-anchor="middle">STAGEN LINEUP</text>

    <!-- Main Title -->
    <text x="0" y="270" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" letter-spacing="-1">Phrase Flow</text>

    <!-- Subtitle / English Tagline -->
    <text x="0" y="340" fill="#15b788" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="700">Daily Wisdom &amp; Dual Perspectives</text>

    <!-- Slogans (from PRD) -->
    <text x="0" y="415" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" opacity="0.9">"Daily wisdom, two perspectives on the flow of our time."</text>

    <!-- Footer branding -->
    <text x="0" y="505" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" letter-spacing="0.5">STAGEN — sta3e-n.com</text>
  </g>
</svg>`;
  } else if (app.slug === "zeiro") {
    markup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="emGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="tlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="zGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#10b981" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#emGrad)"/>

  <!-- Brand Symbol on the Right -->
  <g transform="translate(850, 315)" filter="url(#shadow)">
    <!-- Container -->
    <rect x="-170" y="-170" width="340" height="340" rx="76" fill="#182234" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
    <g transform="translate(-170, -170) scale(0.664)">
      <!-- Top Bar -->
      <path d="M 120 160 C 120 144.5 132.5 132 148 132 L 364 132 C 379.5 132 392 144.5 392 160 C 392 175.5 379.5 188 364 188 L 148 188 C 132.5 188 120 175.5 120 160 Z" fill="url(#emGrad)"/>
      <!-- Z Diagonal -->
      <path d="M 364 160 L 168 356 C 158 366 158 382 168 392 C 178 402 194 402 204 392 L 400 196 C 410 186 410 170 400 160 C 390 150 374 150 364 160 Z" fill="url(#zGrad)"/>
      <!-- Bottom Bar -->
      <path d="M 148 324 C 132.5 324 120 336.5 120 352 C 120 367.5 132.5 380 148 380 L 364 380 C 379.5 380 392 367.5 392 352 C 392 336.5 379.5 324 364 324 L 148 324 Z" fill="url(#tlGrad)"/>
      <!-- Center Dot -->
      <circle cx="256" cy="256" r="28" fill="#ffffff"/>
      <circle cx="256" cy="256" r="14" fill="#0f766e"/>
    </g>
  </g>

  <!-- Left Info -->
  <g transform="translate(100, 0)">
    <rect x="0" y="140" width="300" height="32" rx="16" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
    <text x="150" y="161" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" text-anchor="middle">1人法人特化 統合経理・給与SaaS</text>

    <text x="0" y="250" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" letter-spacing="-1.5">Zeiro <tspan fill="#10b981" font-size="52" font-weight="700">税路</tspan></text>

    <text x="0" y="320" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700">Money Forward完全代替 · 年額¥9,360</text>

    <text x="0" y="390" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">取引メール無人自動連携 · Gemini AI自動仕訳 · 役員給与・社保計算</text>
    <text x="0" y="425" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500">源泉所得税「納期の特例」自動集計 · STAGEN 9大決算健全性監査</text>

    <text x="0" y="520" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" letter-spacing="0.5">STAGEN — sta3e-n.com/zeiro/</text>
  </g>
</svg>`;
  } else {
    markup = svg(app);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "og-image.svg"), markup);
  const png = new Resvg(markup, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  fs.writeFileSync(path.join(dir, "og-image.png"), png);
  const urlPath = app.slug === "assets" ? "/assets/og-image.png" : `/${app.slug}/og-image.png`;
  console.log(`${BASE}${urlPath}`);
}

for (const app of APPS) {
  writeOg(path.join(ROOT, "..", app.slug), app);
}
writeOg(path.join(ROOT, "..", "assets"), SITE);

console.log(`done: ${APPS.length + 1} OG PNG files`);
