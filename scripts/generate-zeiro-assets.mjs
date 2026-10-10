import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB_PUBLIC = path.join(ROOT, '../zeiro/web/public');
const PRJ_ZEIRO = path.join(ROOT, 'zeiro');
const PRJ_ASSETS = path.join(ROOT, 'assets/images');

fs.mkdirSync(WEB_PUBLIC, { recursive: true });
fs.mkdirSync(PRJ_ZEIRO, { recursive: true });

// 1. App Icon SVG (512x512 Squircle with rich background)
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>

    <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <linearGradient id="teal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <linearGradient id="zDiagonal" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#10b981" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="116" fill="url(#bg)"/>
  <rect x="4" y="4" width="504" height="504" rx="112" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="3"/>

  <!-- Ledger Balance Divider Line -->
  <line x1="96" y1="256" x2="416" y2="256" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="8 8"/>

  <g filter="url(#softGlow)">
    <!-- Top Horizontal Bar (Debit Wing) -->
    <path d="M 120 160 C 120 144.5 132.5 132 148 132 L 364 132 C 379.5 132 392 144.5 392 160 C 392 175.5 379.5 188 364 188 L 148 188 C 132.5 188 120 175.5 120 160 Z" fill="url(#emerald)"/>

    <!-- Dynamic Z Diagonal Stream (The Path / 税路) -->
    <path d="M 364 160 L 168 356 C 158 366 158 382 168 392 C 178 402 194 402 204 392 L 400 196 C 410 186 410 170 400 160 C 390 150 374 150 364 160 Z" fill="url(#zDiagonal)"/>

    <!-- Bottom Horizontal Bar (Credit Wing) -->
    <path d="M 148 324 C 132.5 324 120 336.5 120 352 C 120 367.5 132.5 380 148 380 L 364 380 C 379.5 380 392 367.5 392 352 C 392 336.5 379.5 324 364 324 L 148 324 Z" fill="url(#teal)"/>

    <!-- Balance / AI Center Reconciled Node -->
    <circle cx="256" cy="256" r="28" fill="#ffffff" filter="drop-shadow(0 0 10px rgba(52,211,153,0.9))"/>
    <circle cx="256" cy="256" r="14" fill="#0f766e"/>
  </g>
</svg>`;

// 2. Favicon SVG (High visibility on any browser tab)
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="favEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="favTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="favDiag" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>

  <!-- Background disc for strong visibility -->
  <rect width="512" height="512" rx="128" fill="#0f172a"/>

  <!-- Top Bar -->
  <path d="M 100 156 C 100 138 114 124 132 124 L 380 124 C 398 124 412 138 412 156 C 412 174 398 188 380 188 L 132 188 C 114 188 100 174 100 156 Z" fill="url(#favEmerald)"/>

  <!-- Z Diagonal -->
  <path d="M 380 156 L 152 384 C 140 396 140 416 152 428 C 164 440 184 440 196 428 L 424 200 C 436 188 436 168 424 156 C 412 144 392 144 380 156 Z" fill="url(#favDiag)"/>

  <!-- Bottom Bar -->
  <path d="M 132 324 C 114 324 100 338 100 356 C 100 374 114 388 132 388 L 380 388 C 398 388 412 374 412 356 C 412 338 398 324 380 324 L 132 324 Z" fill="url(#favTeal)"/>

  <!-- Core Dot -->
  <circle cx="256" cy="256" r="32" fill="#ffffff"/>
  <circle cx="256" cy="256" r="16" fill="#0d9488"/>
</svg>`;

// 3. Horizontal Logo SVG
const logoWordmarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" width="280" height="64">
  <defs>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="lgEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="lgTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="lgDiag" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>

  <g transform="translate(0, 0)">
    <rect width="64" height="64" rx="16" fill="url(#logoBg)"/>
    <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <g transform="translate(10, 10) scale(0.086)">
      <path d="M 120 160 C 120 144.5 132.5 132 148 132 L 364 132 C 379.5 132 392 144.5 392 160 C 392 175.5 379.5 188 364 188 L 148 188 C 132.5 188 120 175.5 120 160 Z" fill="url(#lgEmerald)"/>
      <path d="M 364 160 L 168 356 C 158 366 158 382 168 392 C 178 402 194 402 204 392 L 400 196 C 410 186 410 170 400 160 C 390 150 374 150 364 160 Z" fill="url(#lgDiag)"/>
      <path d="M 148 324 C 132.5 324 120 336.5 120 352 C 120 367.5 132.5 380 148 380 L 364 380 C 379.5 380 392 367.5 392 352 C 392 336.5 379.5 324 364 324 L 148 324 Z" fill="url(#lgTeal)"/>
      <circle cx="256" cy="256" r="30" fill="#ffffff"/>
      <circle cx="256" cy="256" r="16" fill="#0f766e"/>
    </g>
  </g>

  <text x="78" y="38" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">Zeiro</text>
  <text x="156" y="38" fill="#10b981" font-family="'Hiragino Kaku Gothic ProN', sans-serif" font-size="16" font-weight="700">税路</text>
  <text x="78" y="54" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="500">統合経理・給与管理 SaaS</text>
</svg>`;

// 4. Product Card SVG (256x170)
const productCardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="170" viewBox="0 0 256 170">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="cEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="cTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="cDiag" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#14b8a6"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>

  <rect width="256" height="170" fill="url(#cardBg)"/>
  <rect x="0" y="0" width="256" height="4" fill="#10b981"/>

  <g transform="translate(32, 28)">
    <rect width="56" height="56" rx="14" fill="#090d16" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <g transform="translate(8, 8) scale(0.078)">
      <path d="M 120 160 C 120 144.5 132.5 132 148 132 L 364 132 C 379.5 132 392 144.5 392 160 C 392 175.5 379.5 188 364 188 L 148 188 C 132.5 188 120 175.5 120 160 Z" fill="url(#cEmerald)"/>
      <path d="M 364 160 L 168 356 C 158 366 158 382 168 392 C 178 402 194 402 204 392 L 400 196 C 410 186 410 170 400 160 C 390 150 374 150 364 160 Z" fill="url(#cDiag)"/>
      <path d="M 148 324 C 132.5 324 120 336.5 120 352 C 120 367.5 132.5 380 148 380 L 364 380 C 379.5 380 392 367.5 392 352 C 392 336.5 379.5 324 364 324 L 148 324 Z" fill="url(#cTeal)"/>
      <circle cx="256" cy="256" r="30" fill="#ffffff"/>
      <circle cx="256" cy="256" r="16" fill="#0f766e"/>
    </g>
  </g>

  <text x="100" y="52" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="20" font-weight="900" letter-spacing="-0.5">Zeiro</text>
  <text x="156" y="52" fill="#10b981" font-family="sans-serif" font-size="13" font-weight="700">税路</text>
  <text x="100" y="72" fill="#14b8a6" font-family="sans-serif" font-size="11" font-weight="600">統合経理・給与SaaS</text>

  <line x1="32" y1="104" x2="224" y2="104" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <text x="32" y="128" fill="#94a3b8" font-family="sans-serif" font-size="10.5">Money Forward完全代替</text>
  <text x="32" y="146" fill="#cbd5e1" font-family="sans-serif" font-size="10.5" font-weight="700">AI自動仕訳 · 納期の特例 · ¥780/月〜</text>
</svg>`;

const renderPng = (svgString, width) => {
  const resvg = new Resvg(svgString, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
};

// Write SVGs
fs.writeFileSync(path.join(WEB_PUBLIC, 'favicon.svg'), faviconSvg);
fs.writeFileSync(path.join(WEB_PUBLIC, 'logo.svg'), logoWordmarkSvg);
fs.writeFileSync(path.join(PRJ_ZEIRO, 'icon.svg'), iconSvg);

// Write PNGs
fs.writeFileSync(path.join(WEB_PUBLIC, 'favicon.png'), renderPng(faviconSvg, 64));
fs.writeFileSync(path.join(WEB_PUBLIC, 'apple-touch-icon.png'), renderPng(iconSvg, 180));
fs.writeFileSync(path.join(WEB_PUBLIC, 'icon-192.png'), renderPng(iconSvg, 192));
fs.writeFileSync(path.join(WEB_PUBLIC, 'icon-512.png'), renderPng(iconSvg, 512));
fs.writeFileSync(path.join(PRJ_ZEIRO, 'icon.png'), renderPng(iconSvg, 512));
fs.writeFileSync(path.join(PRJ_ASSETS, 'product-zeiro.png'), renderPng(productCardSvg, 256));

console.log('All Zeiro logo assets successfully generated!');
