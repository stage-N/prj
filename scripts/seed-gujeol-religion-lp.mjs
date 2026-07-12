#!/usr/bin/env node
/** One-shot: bodies, pages JSON, og-image.svg & PNGs for gujeol religion LPs and apps */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GUJEOL_ASSETS = join(ROOT, '../gujeol/app/assets');
const PHRASE_STYLES = JSON.parse(readFileSync(join(ROOT, 'src/_data/pages/phraseflow.json'), 'utf8'));

const APPS = [
  {
    slug: 'phraseflow-christianity',
    nameJa: '今日のみことば',
    nameKo: '오늘의 말씀',
    nameEn: 'Daily Verse',
    taglineJa: 'キリスト教の聖句を、歴史と対話とともに毎朝',
    traditionJa: 'キリスト教',
    compareJa: '仏教・イスラム教',
    domain: 'christianity.phraseflow.sta3e-n.online',
    heroBg: '#2a2218',
    accent: '#8B6914',
    accentLight: '#D4AF37',
    gradientTo: '#8B6914',
    eyebrow: '#聖句 #キリスト教 #比較読書',
    assetDir: 'christianity',
  },
  {
    slug: 'phraseflow-buddhism',
    nameJa: '今日の仏経',
    nameKo: '오늘의 불경',
    nameEn: 'Daily Sutra',
    taglineJa: '仏教の経典を、歴史と対話とともに毎朝',
    traditionJa: '仏教',
    compareJa: 'キリスト教・イスラム教',
    domain: 'buddhism.phraseflow.sta3e-n.online',
    heroBg: '#2a2418',
    accent: '#C4A035',
    accentLight: '#E8D48B',
    gradientTo: '#8B7355',
    eyebrow: '#仏経 #仏教 #比較読書',
    assetDir: 'buddhism',
  },
  {
    slug: 'phraseflow-islam',
    nameJa: '今日のクルアーン',
    nameKo: '오늘의 꾸란',
    nameEn: 'Daily Quran',
    taglineJa: 'イスラムの聖句を、歴史と対話とともに毎朝',
    traditionJa: 'イスラム教',
    compareJa: 'キリスト教・仏教',
    domain: 'islam.phraseflow.sta3e-n.online',
    heroBg: '#142820',
    accent: '#1B6B4A',
    accentLight: '#2E8B57',
    gradientTo: '#1B4D3E',
    eyebrow: '#クルアーン #イスラム #比較読書',
    assetDir: 'islam',
  },
  {
    slug: 'phraseflow-religion',
    nameJa: '今日の宗教のことば',
    nameKo: '오늘의 종교 구절',
    nameEn: 'Daily Sacred Verse',
    taglineJa: '世界の宗教の知恵を、比較しながら毎朝',
    traditionJa: '世界の宗教',
    compareJa: 'キリスト教・仏教・イスラム教',
    domain: 'religion.phraseflow.sta3e-n.online',
    heroBg: '#221e2e',
    accent: '#6B5B95',
    accentLight: '#9B8BB4',
    gradientTo: '#4A4063',
    eyebrow: '#宗教 #比較読書 #리테러시',
    assetDir: 'religion_general',
  },
];

function tintStyles(styles, accent, light) {
  return styles
    .replaceAll('#15b788', accent)
    .replaceAll('#eefaf5', light + '22')
    .replaceAll('#e0f2ec', light + '44')
    .replaceAll('#c8ebe0', light + '66')
    .replaceAll('#e8fff8', light + '33')
    .replaceAll('#e8f4f8', light + '22');
}

function indexHtml(a) {
  const url = `https://${a.domain}`;
  return `<section class="hero" style="background:${a.heroBg};">
    <div class="hero-inner">
      <img src="icon.png" alt="${a.nameJa}" class="hero-icon" width="120" height="120">
      <div class="eyebrow">${a.eyebrow}</div>
      <h1>${a.nameJa}<small>${a.nameKo} — ${a.nameEn}</small></h1>
      <p class="desc">${a.taglineJa}。<strong>Phrase Flow Religion</strong> シリーズの一環として、AIが<strong>歴史的背景・現代的解説</strong>と<strong>他宗教との比較視点</strong>を添えて届けます。</p>
      <div class="badge-row">
        <span class="badge">${a.traditionJa}</span>
        <span class="badge">歴史的背景</span>
        <span class="badge">比較ビュー</span>
        <span class="badge">KO / EN / JA</span>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <h2 class="section-title">Phrase Flow の宗教版</h2>
      <p class="section-subtitle">名言アプリ Phrase Flow と同じ思想 — 一節を深く、多角的に読む</p>
      <div class="solution-banner">
        <p>断片引用ではなく、<strong>出典・時代背景・現代への示唆</strong>と、<strong>${a.compareJa}</strong>との対話を毎日の習慣に。</p>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <h2 class="section-title">主な機能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">🌅</div>
          <h3>毎日の聖句</h3>
          <p>${a.traditionJa}の経典から厳選した一節を、朝のルーティンに。Webブラウザですぐ読めます。</p>
        </div>
        <div class="feature-card">
          <div class="icon">🏛️</div>
          <h3>背景と解説</h3>
          <p>著書・時代・文脈を踏まえたエッセイ形式の背景説明と現代的解説。</p>
        </div>
        <div class="feature-card">
          <div class="icon">↔️</div>
          <h3>比較ビュー</h3>
          <p>他の宗教伝統の類似・対照の一節を並べて表示。一つの教えに固執しない読み方を支援。</p>
        </div>
        <div class="feature-card">
          <div class="icon">🌐</div>
          <h3>3言語対応</h3>
          <p>韓国語・英語・日本語で背景・解説を表示。</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <h2 class="section-title">料金</h2>
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>無料</h3>
          <p class="price">¥0</p>
          <ul>
            <li>毎日の聖句と基本解説</li>
            <li>比較ビュー（宗教版は無料で開放）</li>
            <li>アカウント不要で閲覧可</li>
          </ul>
        </div>
        <div class="pricing-card featured">
          <h3>Premium</h3>
          <p class="price">$4.99/月</p>
          <ul>
            <li>アーカイブ・通知（予定）</li>
            <li>Stripe 安全決済（Web）</li>
            <li>モバイルアプリ（準備中）</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="container">
      <h2 class="section-title">いますぐ読む</h2>
      <p class="section-subtitle">Webブラウザで利用できます</p>
      <a href="${url}" class="btn" target="_blank" rel="noopener">${a.nameJa}を開く →</a>
      <p class="micro">
        <a href="privacy.html">プライバシーポリシー</a> ·
        <a href="support.html">サポート</a> ·
        <a href="https://github.com/ubermenschjo/gujeol" target="_blank" rel="noopener">GitHub</a>
      </p>
      <p class="micro" style="margin-top:1rem;color:#888;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.6;">
        本サービスは特定の宗教・宗派を推奨するものではありません。AIによる解説・比較は参考情報であり、信仰や重要な判断は原典・指導者・複数の情報源でご確認ください。
      </p>
    </div>
  </section>

  <footer>
    <div class="links">
      <a href="https://sta3e-n.com">STAGEN</a>
      <a href="phraseflow/">Phrase Flow</a>
      <a href="privacy.html">プライバシーポリシー</a>
      <a href="support.html">サポート</a>
    </div>
    <p>© 2026 STAGEN</p>
  </footer>`;
}

function privacyHtml(a) {
  return `<h1>プライバシーポリシー</h1>
  <p>株式会社 STAGEN（以下「当社」）は、${a.nameJa}（${a.nameEn}、以下「本サービス」）におけるユーザーのプライバシーを尊重し、個人情報の保護に努めます。</p>
  <div class="highlight"><strong>無料閲覧はアカウント不要です。Premium 購読時のみ Stripe 経由で決済情報を処理します。</strong></div>
  <h2>1. 収集する情報</h2>
  <ul>
    <li><strong>無料利用時:</strong> 聖句의 閲覧に氏名・メール等は不要です</li>
    <li><strong>アカウント登録時:</strong> メールアドレスとパスワード（ハッシュ化）を Cloudflare D1 に保存</li>
    <li><strong>Premium:</strong> Stripe が決済に必要な情報を処理。当社は購読状態の管理に必要な識別子を保存</li>
    <li><strong>アクセスログ:</strong> Cloudflare インフラログが技術的に記録される場合があります</li>
  </ul>
  <h2>2. AI処理・コンテンツ</h2>
  <p>聖句の背景・解説・比較テキストは Google Gemini API で生成し、Cloudflare D1 に保存します。端末から Gemini へ個人を特定できるデータが直接送信されることはありません。</p>
  <h2>3. 第三者サービス</h2>
  <ul>
    <li><strong>Stripe:</strong> 有料プランの決済</li>
    <li><strong>Google Gemini API:</strong> 背景・解説・比較の生成</li>
    <li><strong>Cloudflare:</strong> ホスティング・D1・KV</li>
  </ul>
  <h2>4. お問い合わせ</h2>
  <p><a href="support.html">サポートページ</a>よりご連絡ください。</p>
  <div class="footer"><p>制定日: 2026年7月12日</p><p>株式会社 STAGEN</p></div>`;
}

function supportHtml(a) {
  const url = `https://${a.domain}`;
  return `<h1>サポート</h1>
  <p>${a.nameJa}（${a.nameEn}）をご利用いただきありがとうございます。</p>
  <h2>不具合報告・機能要望</h2>
  <div class="card"><p>🐛 <a href="https://github.com/ubermenschjo/gujeol/issues" target="_blank" rel="noopener">GitHub Issues →</a></p></div>
  <h2>お問い合わせ</h2>
  <p>メール: <a href="mailto:support@sta3e-n.com">support@sta3e-n.com</a></p>
  <p>Webアプリ: <a href="${url}" target="_blank" rel="noopener">${a.domain}</a></p>
  <h2>よくある質問</h2>
  <h3 style="margin-top:1rem;font-size:1rem;">Q. 特定の宗教を推奨しますか？</h3>
  <p>いいえ。歴史的文脈と多宗教比較の<strong>リテラシー支援</strong>が目的です。AI解説は参考情報です。</p>
  <h3 style="margin-top:1rem;font-size:1rem;">Q. Phrase Flow との違いは？</h3>
  <p>Phrase Flow は世俗の名言9分野、本サービスは${a.traditionJa}の聖句に特化した Religion シリーズです。</p>
  <h3 style="margin-top:1rem;font-size:1rem;">Q. 個人情報の取り扱いは？</h3>
  <p><a href="privacy.html">プライバシーポリシー</a>をご確認ください。</p>
  <div class="footer"><p>© 2026 STAGEN</p></div>`;
}

function ogSvg(a) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a.heroBg}"/>
      <stop offset="60%" stop-color="${a.heroBg}"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a.accentLight}"/>
      <stop offset="100%" stop-color="${a.accent}"/>
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a.accent}"/>
      <stop offset="100%" stop-color="${a.gradientTo}"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${a.accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${a.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  
  <!-- Sleek Top Accent Line -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#grad1)"/>

  <!-- Brand Symbol on the Right -->
  <g transform="translate(860, 315)" filter="url(#shadow)">
    <circle cx="-55" cy="0" r="130" fill="url(#grad1)" opacity="0.88"/>
    <circle cx="55" cy="0" r="130" fill="url(#grad2)" opacity="0.88"/>
    <text x="-75" y="40" font-family="Georgia, serif" font-size="140" font-weight="bold" fill="#ffffff" text-anchor="middle">“</text>
    <text x="65" y="40" font-family="Georgia, serif" font-size="140" font-weight="bold" fill="#ffffff" text-anchor="middle">”</text>
    <path d="M -100, 170 C -50, 190 -20, 150 15, 170 C 50, 190 70, 150 100, 170" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
  </g>

  <!-- Brand Info on the Left -->
  <g transform="translate(100, 0)">
    <!-- Eyebrow tag -->
    <rect x="0" y="160" width="280" height="32" rx="16" fill="rgba(255,255,255,0.05)" stroke="${a.accentLight}" stroke-width="1.5" opacity="0.8"/>
    <text x="140" y="181" fill="${a.accentLight}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5" text-anchor="middle">PHRASE FLOW RELIGION</text>

    <!-- Main Title -->
    <text x="0" y="270" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">${a.nameEn}</text>

    <!-- Subtitle / English Tagline -->
    <text x="0" y="335" fill="${a.accentLight}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700">Daily Wisdom &amp; Dual Perspectives</text>

    <!-- Tagline -->
    <text x="0" y="410" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" opacity="0.9">${a.taglineJa}</text>

    <!-- Footer branding -->
    <text x="0" y="505" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" letter-spacing="0.5">STAGEN — sta3e-n.com</text>
  </g>
</svg>`;
}

function makeIconSvg(a) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a.accentLight}"/>
      <stop offset="100%" stop-color="${a.accent}"/>
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a.accent}"/>
      <stop offset="100%" stop-color="${a.gradientTo}"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${a.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${a.accent}" stop-opacity="0"/>
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
  <rect x="4" y="4" width="1016" height="1016" rx="216" fill="none" stroke="${a.accent}" stroke-width="8" opacity="0.2"/>

  <!-- Brand Symbol Group -->
  <g filter="url(#shadow)" transform="translate(0, 0)">
    <!-- Overlapping Circles (Dual Perspectives) -->
    <circle cx="432" cy="512" r="230" fill="url(#grad1)" opacity="0.88"/>
    <circle cx="592" cy="512" r="230" fill="url(#grad2)" opacity="0.88"/>

    <!-- Left Quote (Georgia Bold, White) -->
    <text x="390" y="580" font-family="Georgia, serif" font-size="240" font-weight="bold" fill="#ffffff" text-anchor="middle">“</text>
    
    <!-- Right Quote (Georgia Bold, White) -->
    <text x="634" y="580" font-family="Georgia, serif" font-size="240" font-weight="bold" fill="#ffffff" text-anchor="middle">”</text>
  </g>

  <!-- Flowing Wave below (Flow) -->
  <path d="M 320, 810 C 410, 840 450, 780 512, 810 C 574, 840 614, 780 704, 810" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.25"/>
</svg>`;
}

function renderPng(svgContent, outputPath, width) {
  console.log(`Rendering PNG to: ${outputPath} (${width}px wide)`);
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: width
    }
  });
  const pngBuffer = resvg.render().asPng();
  writeFileSync(outputPath, pngBuffer);
}

function pagesJson(a) {
  const base = JSON.parse(JSON.stringify(PHRASE_STYLES));
  for (const page of ['index', 'privacy', 'support']) {
    base[page].styles = tintStyles(base[page].styles, a.accent, a.accentLight);
    base[page].accent = a.accent;
    if (page === 'index') {
      base[page].title = `${a.nameJa} | ${a.taglineJa}`;
      base[page].desc = `${a.traditionJa}의 성구를 역사적 배경과 비교 시점과 함께 매일 아침 전하는 Phrase Flow Religion 시리즈.`;
      base[page].ogTitle = `${a.nameJa} — ${a.nameEn}`;
      base[page].ogDesc = a.taglineJa;
      base[page].ogImage = `https://sta3e-n.com/${a.slug}/og-image.png`;
      base[page].icon = 'icon.png';
    } else if (page === 'privacy') {
      base[page].title = `プライバシーポリシー | ${a.nameJa}`;
      base[page].ogTitle = base[page].title;
    } else {
      base[page].title = `サポート | ${a.nameJa}`;
      base[page].ogTitle = base[page].title;
    }
  }
  return base;
}

const bodiesDir = join(ROOT, 'src/_includes/bodies');

for (const a of APPS) {
  console.log(`\n--- Processing: ${a.slug} (${a.assetDir}) ---`);

  // Generate SVG contents
  const iconSvgStr = makeIconSvg(a);
  const ogSvgStr = ogSvg(a);

  // 1. Expo App Assets (gujeol/app/assets/<assetDir>)
  const expoDestDir = join(GUJEOL_ASSETS, a.assetDir);
  mkdirSync(expoDestDir, { recursive: true });
  renderPng(iconSvgStr, join(expoDestDir, 'icon.png'), 1024);
  renderPng(iconSvgStr, join(expoDestDir, 'adaptive-icon.png'), 1024);
  renderPng(iconSvgStr, join(expoDestDir, 'splash-icon.png'), 1024);

  // 2. Next.js Web App Assets (gujeol/web-religion/public/assets/<assetDir>)
  const webDestDir = join(ROOT, '../gujeol/web-religion/public/assets', a.assetDir);
  mkdirSync(webDestDir, { recursive: true });
  writeFileSync(join(webDestDir, 'og-image.svg'), ogSvgStr);
  renderPng(iconSvgStr, join(webDestDir, 'icon.png'), 512);
  renderPng(iconSvgStr, join(webDestDir, 'apple-icon.png'), 180);
  renderPng(ogSvgStr, join(webDestDir, 'og-image.png'), 1200);

  // 3. GitHub Pages (prj-githubpage/<slug>)
  const appDir = join(ROOT, a.slug);
  mkdirSync(appDir, { recursive: true });
  writeFileSync(join(appDir, 'og-image.svg'), ogSvgStr);
  renderPng(iconSvgStr, join(appDir, 'icon.png'), 512);
  renderPng(ogSvgStr, join(appDir, 'og-image.png'), 1200);

  // 4. GitHub Pages global images asset
  const imagesDestDir = join(ROOT, 'assets/images');
  mkdirSync(imagesDestDir, { recursive: true });
  renderPng(iconSvgStr, join(imagesDestDir, `product-${a.slug}.png`), 512);

  // 5. HTML templates and Eleventy pages configs
  writeFileSync(join(bodiesDir, `${a.slug}-index.html`), indexHtml(a));
  writeFileSync(join(bodiesDir, `${a.slug}-privacy.html`), privacyHtml(a));
  writeFileSync(join(bodiesDir, `${a.slug}-support.html`), supportHtml(a));
  writeFileSync(join(ROOT, 'src/_data/pages', `${a.slug}.json`), JSON.stringify(pagesJson(a), null, 2) + '\n');

  console.log(`ok: ${a.slug}`);
}

console.log('\nAll assets generated and seed configurations updated!');
