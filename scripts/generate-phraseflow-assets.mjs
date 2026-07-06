#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

// 1. Define the Beautiful Vector Icon (1024x1024 SVG)
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15b788"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1395ba"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#15b788" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#15b788" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Rounded Rect -->
  <rect width="1024" height="1024" rx="220" fill="#121214"/>
  
  <!-- Subtle Background Glow -->
  <rect width="1024" height="1024" rx="220" fill="url(#bgGlow)"/>

  <!-- Glowing Outer Border -->
  <rect x="4" y="4" width="1016" height="1016" rx="216" fill="none" stroke="rgba(21,183,136,0.15)" stroke-width="8"/>

  <!-- Brand Symbol Group -->
  <g filter="url(#shadow)" transform="translate(0, 0)">
    <!-- Overlapping Circles (Dual Perspectives) -->
    <circle cx="432" cy="512" r="230" fill="url(#greenGrad)" opacity="0.88"/>
    <circle cx="592" cy="512" r="230" fill="url(#blueGrad)" opacity="0.88"/>

    <!-- Left Quote (Georgia Bold, White) -->
    <text x="390" y="580" font-family="Georgia, serif" font-size="240" font-weight="bold" fill="#ffffff" text-anchor="middle">“</text>
    
    <!-- Right Quote (Georgia Bold, White) -->
    <text x="634" y="580" font-family="Georgia, serif" font-size="240" font-weight="bold" fill="#ffffff" text-anchor="middle">”</text>
  </g>

  <!-- Flowing Wave below (Flow) -->
  <path d="M 320, 810 C 410, 840 450, 780 512, 810 C 574, 840 614, 780 704, 810" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.25"/>
</svg>`;

// 2. Define the Beautiful OG Image (1200x630 SVG)
const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
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

// Helper function to render SVG markup to PNG using resvg-js and save it
function renderPng(svgContent, outputPath, width) {
  console.log(`Rendering PNG to ${outputPath} (${width}x${width || ''})...`);
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: "width",
      value: width
    }
  });
  const pngBuffer = resvg.render().asPng();
  fs.writeFileSync(outputPath, pngBuffer);
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 1. Output destinations
const ghPagePhraseflowDir = path.join(ROOT, "prj-githubpage", "phraseflow");
const expoAssetsDir = path.join(ROOT, "gujeol", "app", "assets");
const nextAppDir = path.join(ROOT, "gujeol", "web", "src", "app");

ensureDir(ghPagePhraseflowDir);
ensureDir(expoAssetsDir);
ensureDir(nextAppDir);

// 2. Write SVGs
fs.writeFileSync(path.join(ghPagePhraseflowDir, "og-image.svg"), ogSvg);
console.log(`Saved: ${path.join(ghPagePhraseflowDir, "og-image.svg")}`);

// 3. Render PNGs for GitHub Page (Landing Page)
renderPng(ogSvg, path.join(ghPagePhraseflowDir, "og-image.png"), 1200);
renderPng(iconSvg, path.join(ghPagePhraseflowDir, "icon.png"), 512);

// 4. Render PNGs for Expo App (gujeol/app/assets/)
renderPng(iconSvg, path.join(expoAssetsDir, "icon.png"), 1024);
renderPng(iconSvg, path.join(expoAssetsDir, "adaptive-icon.png"), 1024);
renderPng(iconSvg, path.join(expoAssetsDir, "splash-icon.png"), 1024);
renderPng(iconSvg, path.join(expoAssetsDir, "favicon.png"), 128); // Expo default favicon is 48 or 128

// 5. Render PNGs for Next.js Web (gujeol/web/src/app/)
renderPng(iconSvg, path.join(nextAppDir, "icon.png"), 512);
renderPng(iconSvg, path.join(nextAppDir, "apple-icon.png"), 180);
renderPng(ogSvg, path.join(nextAppDir, "opengraph-image.png"), 1200);
renderPng(ogSvg, path.join(nextAppDir, "twitter-image.png"), 1200);

console.log("\nAsset Generation Complete!");
