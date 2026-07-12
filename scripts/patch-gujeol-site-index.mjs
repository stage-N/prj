#!/usr/bin/env node
/** Patch i18n.json + site-index for gujeol religion apps */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const i18nPath = join(ROOT, 'src/_data/i18n.json');
const i18n = JSON.parse(readFileSync(i18nPath, 'utf8'));

const APPS = [
  { slug: 'phraseflow-christianity', ja: '今日のみことば', en: 'Daily Verse', ko: '오늘의 말씀', descJa: 'キリスト教の聖句を歴史と比較とともに', descEn: 'Christian sacred verses with context and comparison', descKo: '기독교 성경 구절의 역사적 배경과 비교 성찰' },
  { slug: 'phraseflow-buddhism', ja: '今日の仏経', en: 'Daily Sutra', ko: '오늘의 불경', descJa: '仏教の経典を歴史と比較とともに', descEn: 'Buddhist sutras with context and comparison', descKo: '불교 경전 구절의 배경과 비교 성찰' },
  { slug: 'phraseflow-islam', ja: '今日のクルアーン', en: 'Daily Quran', ko: '오늘의 꾸란', descJa: 'イスラムの聖句を歴史と比較とともに', descEn: 'Islamic verses with context and comparison', descKo: '이슬람 꾸란 구절의 배경과 비교 성찰' },
  { slug: 'phraseflow-religion', ja: '今日の宗教のことば', en: 'Daily Sacred Verse', ko: '오늘의 종교 구절', descJa: '世界宗教の知恵を比較しながら毎朝', descEn: 'World religions compared daily', descKo: '세계 종교 구절을 비교하며 매일' },
];

for (const loc of ['en', 'ko']) {
  const contact = i18n.site[loc].contact;
  for (const a of APPS) {
    contact.products[a.slug] = loc === 'ja' ? a.ja : loc === 'ko' ? a.ko : a.en;
    if (!contact.productSlugs.includes(a.slug)) {
      const idx = contact.productSlugs.indexOf('phraseflow');
      contact.productSlugs.splice(idx + 1, 0, a.slug);
    }
  }
}

for (const a of APPS) {
  i18n[a.slug] = {
    en: {
      index: { title: `${a.en} | Phrase Flow Religion`, desc: a.descEn, ogTitle: a.en, ogDesc: a.descEn },
      privacy: { title: `Privacy Policy | ${a.en}`, desc: '', ogTitle: `Privacy Policy | ${a.en}`, ogDesc: '' },
      support: { title: `Support | ${a.en}`, desc: '', ogTitle: `Support | ${a.en}`, ogDesc: '' },
    },
    ko: {
      index: { title: `${a.ko} | Phrase Flow Religion`, desc: a.descKo, ogTitle: a.ko, ogDesc: a.descKo },
      privacy: { title: `개인정보 처리방침 | ${a.ko}`, desc: '', ogTitle: `개인정보 처리방침 | ${a.ko}`, ogDesc: '' },
      support: { title: `지원 | ${a.ko}`, desc: '', ogTitle: `지원 | ${a.ko}`, ogDesc: '' },
    },
    ja: {
      index: { title: `${a.ja} | Phrase Flow Religion`, desc: a.descJa, ogTitle: a.ja, ogDesc: a.descJa },
      privacy: { title: `プライバシーポリシー | ${a.ja}`, desc: '', ogTitle: `プライバシーポリシー | ${a.ja}`, ogDesc: '' },
      support: { title: `サポート | ${a.ja}`, desc: '', ogTitle: `サポート | ${a.ja}`, ogDesc: '' },
    },
  };
}

writeFileSync(i18nPath, JSON.stringify(i18n, null, 2) + '\n');

function card(a, loc) {
  const name = loc === 'ja' ? a.ja : loc === 'ko' ? a.ko : a.en;
  const desc = loc === 'ja' ? a.descJa : loc === 'ko' ? a.descKo : a.descEn;
  const badge = loc === 'ja' ? '宗教' : loc === 'ko' ? '종교' : 'Religion';
  const about = loc === 'ja' ? `${name}について` : loc === 'ko' ? `${name} 소개` : `About ${name}`;
  const privacy = loc === 'ja' ? 'プライバシーポリシー' : loc === 'ko' ? '개인정보 처리방침' : 'Privacy Policy';
  const support = loc === 'ja' ? 'サポート' : loc === 'ko' ? '지원' : 'Support';
  return `
        <article class="product-card reveal">
          <div class="product-header">
            <div class="product-title-row">
              <img src="assets/images/product-${a.slug}.png" alt="" class="product-thumb" width="56" height="56">
              <h3>${name}</h3>
            </div>
            <span class="product-badge">${badge}</span>
          </div>
          <p class="product-desc">${desc} — Phrase Flow Religion</p>
          <div class="product-links">
            <a href="${a.slug}/" class="link-main">${about}</a>
            <a href="${a.slug}/privacy.html" class="link-privacy">${privacy}</a>
            <a href="${a.slug}/support.html" class="link-support">${support}</a>
          </div>
          <p class="product-github"><a href="https://github.com/ubermenschjo/gujeol">GitHub →</a></p>
        </article>`;
}

function footerLinks(a, loc) {
  const name = loc === 'ja' ? a.ja : loc === 'ko' ? a.ko : a.en;
  return `            <li><a href="${a.slug}/">${name}</a></li>`;
}

for (const [file, loc] of [
  ['site-index.html', 'ja'],
  ['site-index.en.html', 'en'],
  ['site-index.ko.html', 'ko'],
]) {
  const path = join(ROOT, 'src/_includes/bodies', file);
  let html = readFileSync(path, 'utf8');
  const marker = '          <p class="product-github"><a href="https://github.com/ubermenschjo/gujeol">GitHub →</a></p>\n        </article>\n\n        <article class="product-card reveal">\n          <div class="product-header">\n            <div class="product-title-row">\n              <img src="assets/images/product-banjem.png"';
  const cards = APPS.map((a) => card(a, loc)).join('\n');
  if (!html.includes('product-phraseflow-christianity')) {
    html = html.replace(marker, `          <p class="product-github"><a href="https://github.com/ubermenschjo/gujeol">GitHub →</a></p>\n        </article>\n${cards}\n\n        <article class="product-card reveal">\n          <div class="product-header">\n            <div class="product-title-row">\n              <img src="assets/images/product-banjem.png"`);
  }
  const footMarker = '            <li><a href="phraseflow/">Phrase Flow</a></li>\n            <li><a href="banjem/">';
  if (!html.includes('phraseflow-christianity/')) {
    const foot = APPS.map((a) => footerLinks(a, loc)).join('\n');
    html = html.replace(footMarker, `            <li><a href="phraseflow/">Phrase Flow</a></li>\n${foot}            <li><a href="banjem/">`);
  }
  writeFileSync(path, html);
  console.log('patched', file);
}
