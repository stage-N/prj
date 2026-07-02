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

const LOCALES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
];

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BODIES_DIR = path.join(ROOT, "src/_includes/bodies");

function localePrefix(locale) {
  return locale === "ja" ? "" : `/${locale}`;
}

function resolveBodyPath(baseName, locale) {
  const localized = path.join(BODIES_DIR, `${baseName}.${locale}.html`);
  const fallback = path.join(BODIES_DIR, `${baseName}.html`);
  if (locale !== "ja" && fs.existsSync(localized)) return localized;
  return fallback;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  for (const app of APPS) {
    // ponytail: preserve subdirs (e.g. forest-school/screenshots/*.png)
    eleventyConfig.addPassthroughCopy(`${app}/**/*.{png,jpg,jpeg,webp,svg}`);
  }

  eleventyConfig.addGlobalData("site", {
    baseUrl: "https://stage-n.github.io/prj",
    locales: LOCALES,
    defaultLocale: "ja",
    apps: APPS,
  });

  eleventyConfig.addFilter("localePrefix", localePrefix);
  eleventyConfig.addFilter("localePath", (path, locale) => `${localePrefix(locale)}${path}`);
  eleventyConfig.addFilter("absoluteUrl", (path) => `https://stage-n.github.io/prj${path}`);

  eleventyConfig.addFilter("t", (translations, locale) => {
    if (!translations) return {};
    return translations[locale] || translations.ja || {};
  });

  eleventyConfig.addCollection("localeList", () => LOCALES.map((l) => l.code));

  eleventyConfig.addNunjucksAsyncShortcode("bodyContent", async (baseName, locale) => {
    return fs.readFileSync(resolveBodyPath(baseName, locale), "utf8");
  });

  // ponytail: site index at /en/ or /ko/ needs ../assets/ — only those two outputs
  eleventyConfig.addTransform("fixLocalizedAssetPaths", (content, outputPath) => {
    if (outputPath.endsWith("/en/index.html") || outputPath.endsWith("/ko/index.html")) {
      return content
        .replace(/src="assets\//g, 'src="../assets/')
        .replace(/href="assets\//g, 'href="../assets/');
    }
  // ponytail: /en|ko/{app}/index.html — ja body fallback uses same-dir asset paths
    const appIndex = outputPath.match(/\/(en|ko)\/([^/]+)\/index\.html$/);
    if (appIndex && APPS.includes(appIndex[2])) {
      const prefix = `../../${appIndex[2]}/`;
      content = content
        .replace(/src="(?!\\.\\.\/)(icon\.png|screenshot-)/g, `src="${prefix}$1`)
        .replace(/src="(?!\\.\\.\/)(screenshots\/)/g, `src="${prefix}$1`);
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
