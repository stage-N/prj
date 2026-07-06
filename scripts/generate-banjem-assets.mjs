#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GREEN = "#15b788";
const DARK = "#333333";

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="220" fill="${DARK}"/>
  <rect x="4" y="4" width="1016" height="1016" rx="216" fill="none" stroke="${GREEN}" stroke-width="8" opacity="0.35"/>
  <text x="512" y="680" font-family="Georgia, serif" font-size="560" font-weight="700" fill="${GREEN}" text-anchor="middle">,</text>
</svg>`;

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1a1a1a"/>
  <rect x="0" y="0" width="1200" height="8" fill="${GREEN}"/>
  <text x="80" y="280" fill="#ffffff" font-family="system-ui,sans-serif" font-size="72" font-weight="800">Banjem</text>
  <text x="80" y="360" fill="${GREEN}" font-family="system-ui,sans-serif" font-size="36" font-weight="600">반점 — 한국 5개 언론 스탠스 비교</text>
  <text x="80" y="420" fill="#aaaaaa" font-family="system-ui,sans-serif" font-size="28">한 뉴스, 다섯 시각.</text>
  <text x="80" y="520" fill="#888888" font-family="system-ui,sans-serif" font-size="28">STAGEN — sta3e-n.com</text>
</svg>`;

function png(svg, out) {
  fs.writeFileSync(out.replace(/\.png$/, ".svg"), svg);
  const buf = new Resvg(svg, { fitTo: { mode: "width", value: out.includes("icon") ? 1024 : 1200 } }).render().asPng();
  fs.writeFileSync(out, buf);
}

const banjemDir = path.join(ROOT, "banjem");
fs.mkdirSync(banjemDir, { recursive: true });
png(iconSvg, path.join(banjemDir, "icon.png"));
png(ogSvg, path.join(banjemDir, "og-image.png"));
fs.copyFileSync(path.join(banjemDir, "icon.png"), path.join(ROOT, "assets/images/product-banjem.png"));
console.log("banjem assets ok");
