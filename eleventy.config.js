const APPS = [
  "zaitap",
  "zeical",
  "wbgt-recorder",
  "wbgt-alert",
  "rakubill",
  "forest-school",
  "shower-guard",
  "cool-walk",
];

const LOCALES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
];

function localePrefix(locale) {
  return locale === "ja" ? "" : `/${locale}`;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  for (const app of APPS) {
    eleventyConfig.addPassthroughCopy({ [`${app}/**/*.{png,jpg,jpeg,webp,svg}`]: app });
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

  // ponytail: site index at /en/ or /ko/ needs ../assets/ — only those two outputs
  eleventyConfig.addTransform("fixLocalizedAssetPaths", (content, outputPath) => {
    if (outputPath.endsWith("/en/index.html") || outputPath.endsWith("/ko/index.html")) {
      return content
        .replace(/src="assets\//g, 'src="../assets/')
        .replace(/href="assets\//g, 'href="../assets/');
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
