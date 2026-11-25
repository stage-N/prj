const BASE_URL = "https://sta3e-n.com";

function localizedPath(pagePath, locale) {
  return locale === "ja" ? pagePath : `/${locale}${pagePath}`;
}

function localizedUrl(pagePath, locale) {
  return `${BASE_URL}${localizedPath(pagePath, locale)}`;
}

function homeLabel(locale) {
  if (locale === "en") return "Home";
  if (locale === "ko") return "홈";
  return "ホーム";
}

function blogLabel(locale) {
  if (locale === "en") return "Blog";
  if (locale === "ko") return "블로그";
  return "ブログ";
}

export function buildOrganization(seo) {
  const org = seo.organization;
  return {
    "@type": "Organization",
    "@id": org.id,
    name: org.name,
    alternateName: org.alternateName,
    url: org.url,
    logo: {
      "@type": "ImageObject",
      url: org.logo,
      width: 1200,
      height: 630,
    },
    foundingDate: org.foundingDate,
    taxID: org.taxID,
    email: org.email,
    founder: {
      "@type": "Person",
      name: org.founder,
    },
    address: {
      "@type": "PostalAddress",
      ...org.address,
    },
    award: org.awards,
    sameAs: org.sameAs,
  };
}

export function matchingAppsForPost(tags, seo) {
  if (!Array.isArray(tags) || !seo?.apps) return [];
  const normalized = tags.map((t) => String(t).trim().toLowerCase());
  const matched = new Set();

  for (const slug of seo.activeApps || []) {
    const appData = seo.apps[slug];
    if (!appData) continue;
    const jaName = (appData.locales?.ja?.name || "").toLowerCase();
    const enName = (appData.locales?.en?.name || "").toLowerCase();
    if (
      normalized.includes(slug.toLowerCase()) ||
      normalized.some((t) => t === enName || t === jaName || (t.length >= 4 && jaName.includes(t)))
    ) {
      matched.add(slug);
    }
  }

  if (normalized.includes("wbgt") || normalized.includes("熱中症対策")) {
    matched.add("wbgt-recorder");
    matched.add("wbgt-alert");
  }
  if (normalized.includes("rakubill") || normalized.includes("ラクビル")) {
    matched.add("rakubill");
  }
  if (normalized.includes("zeical") || normalized.includes("税カル")) {
    matched.add("zeical");
  }
  if (normalized.includes("touten") || normalized.includes("読点")) {
    matched.add("touten");
  }
  if (normalized.includes("phrase flow")) {
    matched.add("phraseflow");
  }
  if (normalized.includes("stillpoint")) {
    matched.add("stillpoint");
  }

  return Array.from(matched);
}

function buildBreadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function buildFaqSchema(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

function buildSoftwareApp(appData, locale, seo) {
  const locData = appData.locales?.[locale] || appData.locales?.ja || {};
  const lpUrl = localizedUrl(`/${appData.slug}/`, locale);
  const sameAs = [appData.webUrl, appData.appStoreUrl, appData.playStoreUrl, appData.githubUrl].filter(Boolean);

  const offers = (appData.offers || []).map((o) => {
    const offer = {
      "@type": "Offer",
      name: o.name,
      price: String(o.price),
      priceCurrency: o.priceCurrency || "JPY",
      availability: "https://schema.org/InStock",
    };
    if (o.billing === "P1M" || o.billing === "P1Y") {
      offer.priceSpecification = {
        "@type": "UnitPriceSpecification",
        price: String(o.price),
        priceCurrency: o.priceCurrency || "JPY",
        billingDuration: o.billing,
      };
    }
    return offer;
  });

  const node = {
    "@type": appData.isWebApp ? ["SoftwareApplication", "WebApplication"] : "SoftwareApplication",
    "@id": `${BASE_URL}/${appData.slug}/#app`,
    name: locData.name || appData.slug,
    alternateName: appData.slug,
    description: locData.oneLiner || "",
    url: lpUrl,
    image: appData.ogImage,
    applicationCategory: appData.applicationCategory || "UtilitiesApplication",
    operatingSystem: appData.operatingSystem || "Web",
    inLanguage: ["ja", "en", "ko"],
    dateModified: appData.dateModified || seo.lastUpdated,
    featureList: locData.features || [],
    publisher: { "@id": seo.organization.id },
    author: { "@id": seo.organization.id },
  };

  if (appData.webUrl) {
    node.browserRequirements = "Requires modern web browser";
  }
  if (offers.length === 1) {
    node.offers = offers[0];
  } else if (offers.length > 1) {
    node.offers = offers;
  }
  if (sameAs.length > 0) {
    node.sameAs = sameAs;
  }
  return node;
}

export function buildJsonLd(ctx) {
  const {
    pageType,
    locale = "ja",
    app,
    pageName,
    pageUrl,
    title,
    description,
    ogImage,
    date,
    tags,
    seo,
  } = ctx;

  if (!seo || !seo.organization) return null;

  const orgId = seo.organization.id;
  const websiteId = `${BASE_URL}/#website`;
  const graph = [];

  if (pageType === "site-index") {
    graph.push(buildOrganization(seo));
    graph.push({
      "@type": "WebSite",
      "@id": websiteId,
      name: "STAGEN",
      url: `${BASE_URL}/`,
      description: seo.organization.summary?.[locale] || seo.organization.summary?.ja,
      inLanguage: ["ja", "en", "ko"],
      publisher: { "@id": orgId },
    });
    graph.push({
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: locale,
      isPartOf: { "@id": websiteId },
      about: { "@id": orgId },
    });
    graph.push({
      "@type": "ItemList",
      name: locale === "en" ? "STAGEN Products" : locale === "ko" ? "STAGEN 프로덕트" : "STAGEN プロダクト一覧",
      numberOfItems: (seo.activeApps || []).length,
      itemListElement: (seo.activeApps || []).map((slug, idx) => {
        const appData = seo.apps[slug];
        const loc = appData?.locales?.[locale] || appData?.locales?.ja || {};
        return {
          "@type": "ListItem",
          position: idx + 1,
          name: loc.name || slug,
          description: loc.oneLiner || "",
          url: localizedUrl(`/${slug}/`, locale),
        };
      }),
    });
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (pageType === "app" && app) {
    const isDeprecated = (seo.deprecatedApps || []).includes(app);
    const appData = seo.apps?.[app];
    const homeUrl = localizedUrl("/", locale);
    const appLpUrl = localizedUrl(`/${app}/`, locale);

    if (isDeprecated || !appData) {
      graph.push({
        "@type": "WebPage",
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
        publisher: { "@id": orgId },
      });
      return { "@context": "https://schema.org", "@graph": graph };
    }

    const locData = appData.locales?.[locale] || appData.locales?.ja || {};
    const appName = locData.name || app;

    if (pageName === "index") {
      graph.push(buildOrganization(seo));
      graph.push(buildSoftwareApp(appData, locale, seo));
      graph.push({
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
        mainEntity: { "@id": `${BASE_URL}/${app}/#app` },
        isPartOf: { "@id": websiteId },
      });
      graph.push(
        buildBreadcrumb([
          { name: `STAGEN ${homeLabel(locale)}`, url: homeUrl },
          { name: appName, url: appLpUrl },
        ])
      );
      const faqNode = buildFaqSchema(locData.faqs);
      if (faqNode) graph.push(faqNode);
    } else if (pageName === "support") {
      graph.push({
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
        about: { "@id": `${BASE_URL}/${app}/#app` },
        publisher: { "@id": orgId },
      });
      graph.push(
        buildBreadcrumb([
          { name: `STAGEN ${homeLabel(locale)}`, url: homeUrl },
          { name: appName, url: appLpUrl },
          { name: title, url: pageUrl },
        ])
      );
      const faqNode = buildFaqSchema(locData.faqs);
      if (faqNode) graph.push(faqNode);
    } else {
      graph.push({
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
        about: { "@id": `${BASE_URL}/${app}/#app` },
        publisher: { "@id": orgId },
      });
      graph.push(
        buildBreadcrumb([
          { name: `STAGEN ${homeLabel(locale)}`, url: homeUrl },
          { name: appName, url: appLpUrl },
          { name: title, url: pageUrl },
        ])
      );
    }
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (pageType === "contact") {
    const homeUrl = localizedUrl("/", locale);
    graph.push(buildOrganization(seo));
    graph.push({
      "@type": "ContactPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: locale,
      mainEntity: { "@id": orgId },
    });
    graph.push(
      buildBreadcrumb([
        { name: `STAGEN ${homeLabel(locale)}`, url: homeUrl },
        { name: title, url: pageUrl },
      ])
    );
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (pageType === "message" || pageType === "security-policy") {
    const homeUrl = localizedUrl("/", locale);
    graph.push(buildOrganization(seo));
    graph.push({
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: locale,
      mainEntity: { "@id": orgId },
    });
    graph.push(
      buildBreadcrumb([
        { name: `STAGEN ${homeLabel(locale)}`, url: homeUrl },
        { name: title, url: pageUrl },
      ])
    );
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (pageType === "blog-list") {
    graph.push(buildOrganization(seo));
    graph.push({
      "@type": "Blog",
      "@id": `${BASE_URL}/blog/#blog`,
      url: `${BASE_URL}/blog/`,
      name: title,
      description,
      inLanguage: "ja",
      publisher: { "@id": orgId },
    });
    graph.push(
      buildBreadcrumb([
        { name: "STAGEN ホーム", url: `${BASE_URL}/` },
        { name: "ブログ", url: `${BASE_URL}/blog/` },
      ])
    );
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (pageType === "blog-post") {
    const relatedSlugs = matchingAppsForPost(tags, seo);
    const iso = date ? new Date(date).toISOString().slice(0, 10) : seo.lastUpdated;
    const cleanTags = Array.isArray(tags) ? tags.filter((t) => t !== "blogPosts") : [];
    graph.push(buildOrganization(seo));
    const posting = {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: title,
      description,
      url: pageUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      datePublished: iso,
      dateModified: iso,
      inLanguage: "ja",
      image: ogImage || `${BASE_URL}/assets/og-image.png`,
      author: { "@id": orgId },
      publisher: { "@id": orgId },
      keywords: cleanTags,
    };
    if (relatedSlugs.length > 0) {
      posting.about = relatedSlugs.map((slug) => ({ "@id": `${BASE_URL}/${slug}/#app` }));
    }
    graph.push(posting);
    graph.push(
      buildBreadcrumb([
        { name: "STAGEN ホーム", url: `${BASE_URL}/` },
        { name: blogLabel("ja"), url: `${BASE_URL}/blog/` },
        { name: title, url: pageUrl },
      ])
    );
    return { "@context": "https://schema.org", "@graph": graph };
  }

  return null;
}

export function serializeJsonLd(obj) {
  if (!obj) return "";
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}
