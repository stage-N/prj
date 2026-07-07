#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GREEN = "#15b788";
const BLUE = "#1395ba";
const DARK = "#333333";

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="220" fill="${DARK}"/>
  <rect x="4" y="4" width="1016" height="1016" rx="216" fill="none" stroke="${GREEN}" stroke-width="8" opacity="0.35"/>
  <polygon points="512,220 720,720 304,720" fill="none" stroke="${GREEN}" stroke-width="28" stroke-linejoin="round"/>
  <line x1="512" y1="220" x2="420" y2="720" stroke="${BLUE}" stroke-width="16" opacity="0.85"/>
  <line x1="512" y1="220" x2="604" y2="720" stroke="${GREEN}" stroke-width="16" opacity="0.85"/>
</svg>`;

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1a1a1a"/>
  <rect x="0" y="0" width="1200" height="8" fill="${GREEN}"/>
  <text x="80" y="280" fill="#ffffff" font-family="system-ui,sans-serif" font-size="72" font-weight="800">NewsPrism</text>
  <text x="80" y="360" fill="${GREEN}" font-family="system-ui,sans-serif" font-size="36" font-weight="600">US news stance comparison</text>
  <text x="80" y="420" fill="#aaaaaa" font-family="system-ui,sans-serif" font-size="28">One story. Five lenses.</text>
  <text x="80" y="520" fill="#888888" font-family="system-ui,sans-serif" font-size="28">STAGEN — sta3e-n.com</text>
</svg>`;

function png(svg, out) {
  fs.writeFileSync(out.replace(/\.png$/, ".svg"), svg);
  const buf = new Resvg(svg, { fitTo: { mode: "width", value: out.includes("icon") ? 1024 : 1200 } }).render().asPng();
  fs.writeFileSync(out, buf);
}

const dir = path.join(ROOT, "newsprism");
fs.mkdirSync(dir, { recursive: true });
png(iconSvg, path.join(dir, "icon.png"));
png(ogSvg, path.join(dir, "og-image.png"));
fs.copyFileSync(path.join(dir, "icon.png"), path.join(ROOT, "assets/images/product-newsprism.png"));
console.log("newsprism assets ok");
