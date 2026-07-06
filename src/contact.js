/** @typedef {{ name: string, email: string, category: string, message: string, product?: string, locale?: string, website?: string }} ContactPayload */

const CATEGORIES = new Set(["product", "business", "other"]);
const LOCALES = new Set(["ja", "en", "ko"]);
const PRODUCTS = new Set([
  "",
  "zeical",
  "rakubill",
  "zaitap",
  "wbgt-recorder",
  "wbgt-alert",
  "forest-school",
  "shower-guard",
  "cool-walk",
  "fuzen",
  "stock-pulse",
  "touten",
  "phraseflow",
  "banjem",
]);

const CATEGORY_LABEL = {
  product: "製品について",
  business: "ビジネス・提携",
  other: "その他",
};

const LOCALE_LABEL = { ja: "日本語", en: "English", ko: "한국어" };

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function allowedOrigin(request) {
  const check = (raw) => {
    if (!raw) return false;
    try {
      const { hostname } = new URL(raw);
      return (
        hostname === "sta3e-n.com" ||
        hostname.endsWith(".sta3e-n.com") ||
        hostname.endsWith(".workers.dev") ||
        hostname === "localhost"
      );
    } catch {
      return false;
    }
  };
  return check(request.headers.get("Origin")) || check(request.headers.get("Referer"));
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** @param {ContactPayload} body */
function validate(body) {
  if (!body || typeof body !== "object") return "invalid body";
  if (body.website) return "honeypot";
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const category = String(body.category || "").trim();
  const message = String(body.message || "").trim();
  const product = String(body.product || "").trim();
  const locale = String(body.locale || "ja").trim();

  if (name.length < 1 || name.length > 100) return "invalid name";
  if (!validEmail(email)) return "invalid email";
  if (!CATEGORIES.has(category)) return "invalid category";
  if (message.length < 10 || message.length > 4000) return "invalid message";
  if (!PRODUCTS.has(product)) return "invalid product";
  if (!LOCALES.has(locale)) return "invalid locale";
  return null;
}

/** @param {ContactPayload} body */
function slackBlocks(body) {
  const name = String(body.name).trim();
  const email = String(body.email).trim();
  const category = String(body.category).trim();
  const message = String(body.message).trim();
  const product = String(body.product || "").trim();
  const locale = String(body.locale || "ja").trim();
  const catLabel = CATEGORY_LABEL[category] || category;
  const locLabel = LOCALE_LABEL[locale] || locale;

  return [
    {
      type: "header",
      text: { type: "plain_text", text: "新しいお問い合わせ", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*名前*\n${name}` },
        { type: "mrkdwn", text: `*メール*\n${email}` },
        { type: "mrkdwn", text: `*種別*\n${catLabel}` },
        { type: "mrkdwn", text: `*言語*\n${locLabel}` },
      ],
    },
    ...(product
      ? [{ type: "section", text: { type: "mrkdwn", text: `*プロダクト*\n${product}` } }]
      : []),
    {
      type: "section",
      text: { type: "mrkdwn", text: `*内容*\n${message}` },
    },
  ];
}

/** @param {ContactPayload} body @param {object} env */
async function notifySlack(body, env) {
  const token = env.SLACK_BOT_TOKEN;
  const channel = env.SLACK_CHANNEL_ID;
  if (!token || !channel) return { ok: false, error: "slack not configured" };

  const name = String(body.name).trim();
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text: `新しいお問い合わせ: ${name}`,
      blocks: slackBlocks(body),
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    console.error("slack error", data.error || res.status);
    return { ok: false, error: data.error || "slack api failed" };
  }
  return { ok: true };
}

/** @param {Request} request @param {object} env */
export async function handleContact(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  if (!allowedOrigin(request)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }

  const err = validate(body);
  if (err === "honeypot") return json({ ok: true });
  if (err) return json({ ok: false, error: err }, 400);

  if (!env.SLACK_BOT_TOKEN || !env.SLACK_CHANNEL_ID) {
    return json({ ok: false, error: "service unavailable" }, 503);
  }

  const result = await notifySlack(body, env);
  if (!result.ok) return json({ ok: false, error: "delivery failed" }, 500);

  return json({ ok: true });
}
