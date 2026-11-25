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
  "touten",
  "phraseflow",
  "phraseflow-christianity",
  "phraseflow-buddhism",
  "phraseflow-islam",
  "phraseflow-religion",
  "banjem",
  "newsprism",
  "solo-life",
  "stillpoint",
  "pagepace",
  "briefforge",
  "zeiro",
];

const LOCALES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
];

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildJsonLd, serializeJsonLd, matchingAppsForPost } from "./src/_lib/jsonld.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BODIES_DIR = path.join(ROOT, "src/_includes/bodies");
const SEO_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "src/_data/seo.json"), "utf8"));
const DEPRECATED_SET = new Set(SEO_DATA.deprecatedApps || []);

function localePrefix(locale) {
  return locale === "ja" ? "" : `/${locale}`;
}

function resolveBodyPath(baseName, locale) {
  const localized = path.join(BODIES_DIR, `${baseName}.${locale}.html`);
  const fallback = path.join(BODIES_DIR, `${baseName}.html`);
  if (locale !== "ja" && fs.existsSync(localized)) return localized;
  return fallback;
}

function hasLocalizedBody(baseName, locale) {
  if (locale === "ja") return true;
  return fs.existsSync(path.join(BODIES_DIR, `${baseName}.${locale}.html`));
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  for (const app of APPS) {
    // ponytail: preserve subdirs (e.g. forest-school/screenshots/*.png)
    eleventyConfig.addPassthroughCopy(`${app}/**/*.{png,jpg,jpeg,webp,svg}`);
  }

  eleventyConfig.addGlobalData("site", {
    baseUrl: "https://sta3e-n.com",
    locales: LOCALES,
    defaultLocale: "ja",
    apps: APPS,
    activeApps: SEO_DATA.activeApps || [],
    deprecatedApps: SEO_DATA.deprecatedApps || [],
  });

  eleventyConfig.addFilter("localePrefix", localePrefix);
  eleventyConfig.addFilter("localePath", (p, locale) => `${localePrefix(locale)}${p}`);
  eleventyConfig.addFilter("absoluteUrl", (p) => `https://sta3e-n.com${p}`);

  eleventyConfig.addFilter("t", (translations, locale) => {
    if (!translations) return {};
    return translations[locale] || translations.ja || {};
  });

  eleventyConfig.addFilter("ogLocale", (code) => {
    if (code === "en") return "en_US";
    if (code === "ko") return "ko_KR";
    return "ja_JP";
  });

  eleventyConfig.addFilter("isDeprecatedApp", (slug) => DEPRECATED_SET.has(slug));
  eleventyConfig.addFilter("hasLocalizedBody", (baseName, locale) => hasLocalizedBody(baseName, locale));

  eleventyConfig.addFilter("fallbackDesc", (app, pageName, locale, seo) => {
    const appLoc = seo?.apps?.[app]?.locales?.[locale] || seo?.apps?.[app]?.locales?.ja;
    const appName = appLoc?.name || app;
    if (locale === "en") {
      if (pageName === "privacy") return `Privacy Policy for ${appName}. Learn how data is handled, stored, and protected.`;
      if (pageName === "support") return `Support, FAQ, and contact information for ${appName}.`;
      if (pageName === "pro") return `Partner and professional overview for ${appName}.`;
      return appLoc?.oneLiner || `${appName} official overview.`;
    }
    if (locale === "ko") {
      if (pageName === "privacy") return `${appName} 개인정보 처리방침. 데이터 처리, 보관 및 보안 정책을 안내합니다.`;
      if (pageName === "support") return `${appName} 지원, 자주 묻는 질문(FAQ) 및 문의 안내입니다.`;
      if (pageName === "pro") return `${appName} 전문가 및 파트너 안내 페이지입니다.`;
      return appLoc?.oneLiner || `${appName} 공식 소개 페이지입니다.`;
    }
    if (pageName === "privacy") return `${appName}のプライバシーポリシー。個人情報・データの取り扱い、暗号化、保存方針について説明します。`;
    if (pageName === "support") return `${appName}のサポート・よくある質問（FAQ）・お問い合わせ窓口をご案内します。`;
    if (pageName === "pro") return `${appName}の専門家・パートナー向け案内ページです。`;
    return appLoc?.oneLiner || `${appName}の公式紹介ページです。`;
  });

  eleventyConfig.addFilter("jsonLd", (ctx) => serializeJsonLd(buildJsonLd(ctx)));
  eleventyConfig.addFilter("matchingAppsForPost", (tags, seo) => matchingAppsForPost(tags, seo || SEO_DATA));

  eleventyConfig.addFilter("isoDate", (value) => new Date(value).toISOString().slice(0, 10));
  eleventyConfig.addFilter("rfc3339Date", (value) => new Date(value).toISOString());
  eleventyConfig.addFilter("blogDateJa", (value) => {
    const d = new Date(value);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}年${m}月${day}日`;
  });
  eleventyConfig.addFilter("xmlEscape", (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  );

  eleventyConfig.addCollection("localeList", () => LOCALES.map((l) => l.code));

  eleventyConfig.addCollection("blogPosts", (collection) =>
    collection.getFilteredByTag("blogPosts").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addNunjucksAsyncShortcode("bodyContent", async (baseName, locale) => {
    return fs.readFileSync(resolveBodyPath(baseName, locale), "utf8");
  });

  // ponytail: wrap app body in <main id="main-content"> before <footer>, injecting optional AI/SEO sections inside <main>
  eleventyConfig.addNunjucksAsyncShortcode("renderAppBody", async (baseName, locale, injectBeforeFooter = "") => {
    const raw = fs.readFileSync(resolveBodyPath(baseName, locale), "utf8");
    const footerMatch = raw.match(/(?:<!--[\s\S]*?-->\s*)?<footer\b/i);
    if (footerMatch && typeof footerMatch.index === "number") {
      const idx = raw.toLowerCase().lastIndexOf("<footer");
      const before = raw.slice(0, idx);
      const after = raw.slice(idx);
      return `<main id="main-content">\n${before}\n${injectBeforeFooter}\n</main>\n${after}`;
    }
    return `<main id="main-content">\n${raw}\n${injectBeforeFooter}\n</main>`;
  });

  // ponytail: blog list + posts use absolute /assets/ in templates; no transform needed
  eleventyConfig.addTransform("fixLocalizedAssetPaths", (content, outputPath) => {
    if (!outputPath) return content;
    if (outputPath.endsWith("/en/index.html") || outputPath.endsWith("/ko/index.html")) {
      return content
        .replace(/src="assets\//g, 'src="../assets/')
        .replace(/href="assets\//g, 'href="../assets/');
    }
    // ponytail: /en|ko/{app}/{index|pro}.html — fix relative asset paths for localized pages
    const appPage = outputPath.match(/\/(en|ko)\/([^/]+)\/(index|pro)\.html$/);
    if (appPage && APPS.includes(appPage[2])) {
      const prefix = `../../${appPage[2]}/`;
      content = content
        .replace(/src="\.\.\/assets\//g, 'src="../../assets/')
        .replace(/src="(?!\.\.\/|\/|https?:\/\/)(icon[^"]*\.png|screenshot-[^"]*|screenshots\/[^"]*)"/g, `src="${prefix}$1"`);
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
