# SEO & AI Citation (GEO/AEO) Strategy & Operations Runbook

## 1. Architecture Summary (`sta3e-n.com`)

- **Single Source of Truth:** [`src/_data/seo.json`](../src/_data/seo.json) stores organization entity attributes, 4 product clusters, and all 19 active products' localized `ja` / `en` / `ko` metadata, Answer Capsules, pricing, compliance notes, FAQs, and cross-links.
- **Discovery & AI Endpoints:**
  - `/robots.txt` — Explicitly welcomes `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `ClaudeBot`, `Google-Extended`, `Googlebot`, `Bingbot`, `Applebot-Extended`, etc.
  - `/sitemap.xml` — Full multilingual sitemap (`xhtml:link hreflang`) covering active products, corporate pages, and blog posts while excluding deprecated/hidden apps (`shower-guard`, `cool-walk`, `briefforge`, `solo-life`).
  - `/llms.txt` & `/llms-full.txt` — Spec-compliant AI directory and complete Markdown compendium.
  - `/index.md` & `/{slug}/index.md` — Clean Markdown product specs served directly and via `Accept: text/markdown` content negotiation in [`src/worker.js`](../src/worker.js).
  - `/blog/feed.xml` — Atom 1.0 feed for technical & legal blog updates.
- **Entity Knowledge Graph (`JSON-LD` via [`src/_lib/jsonld.js`](../src/_lib/jsonld.js)):**
  - Links `Organization` (`https://sta3e-n.com/#organization`), `WebSite`, `ItemList`, `SoftwareApplication` / `WebApplication`, `FAQPage`, `BreadcrumbList`, `AboutPage`, `ContactPage`, `Blog`, and `BlogPosting`.
- **On-Page AI Citation Blocks:**
  - Every active product LP injects an Answer Capsule, structured specification `<table>`, visible `<dl>` FAQ, and cluster/blog cross-links inside `<main>` (`src/_includes/partials/product-ai-blocks.njk`).
- **AI Referrer & Bot Telemetry (`src/worker.js`):**
  - Logs `ai_referral` (`chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, etc.) and `ai_bot` crawls into Cloudflare Analytics Engine (`utm_clicks` binding `UTM_ANALYTICS`) without storing IP addresses.

---

## 2. Search Engine & Webmaster Submission Checklist

1. **Google Search Console** (`https://sta3e-n.com`):
   - Submit `https://sta3e-n.com/sitemap.xml` and `https://sta3e-n.com/blog/feed.xml`.
   - Inspect `/`, `/zeiro/`, `/rakubill/`, `/zeical/`, `/touten/`, `/en/`, `/ko/` for valid Rich Results (`SoftwareApplication`, `FAQPage`, `Organization`, `BreadcrumbList`).
2. **Bing Webmaster Tools** (critical for ChatGPT Search & Copilot citation):
   - Verify `sta3e-n.com` (via GSC import or DNS TXT) and submit `https://sta3e-n.com/sitemap.xml`.
   - Enable IndexNow if deploying automated blog updates.

---

## 3. Monthly 18-Prompt AI Citation Audit

Run monthly across **ChatGPT Search, Perplexity, Gemini, and Claude** (record: Mentioned? Cited URL? Accurate price/facts?):

### Corporate & Brand (JA / EN)
1. `株式会社stageN（STAGEN）とはどんな会社？主なプロダクトは？`
2. `What is STAGEN Inc. (sta3e-n.com) and what apps does it build?`

### Business & Tax Cluster
3. `1人法人・マイクロ法人におすすめの安いクラウド会計ソフトは？`
4. `Money Forwardやfreeeの代替になる1人法人向け経理SaaSは？`
5. `インボイス対応で買い切り（サブスクなし）の請求書作成アプリは？`
6. `決算月から法人税・消費税・源泉税の納付期限を自動計算できるアプリは？`
7. `Best lightweight accounting software for a Japanese 1-person corporation (micro-corp)`

### Safety & Immigration Cluster
8. `労働安全衛生法対応で作業現場のWBGTを記録・CSV出力できるアプリは？`
9. `個人向けの無料WBGT・熱中症アラートアプリ（iOS/Android）は？`
10. `スマホNFCでマイナンバーカード署名して在留申請できるアプリは？`

### Media & Wisdom Cluster
11. `読売・朝日・毎日・産経・日経の5大紙の報道スタンスを比較できるサービスは？`
12. `한국 주요 언론 5개 사 논조를 비교해 주는 앱이나 웹 서비스는?`
13. `Compare US news coverage across conservative and progressive outlets side by side`
14. `歴史的背景と対照的な視点つきで名言を毎朝読めるアプリは？`
15. `声で内省するとAIがソクラテス式の深い質問を返してくれる瞑想アプリは？`

### Learning & Investing Cluster
16. `スマホでオフラインでLisp風REPLを動かして関数型思考を学べるプログラミングアプリは？`
17. `3歳〜5歳向けの買い切り・広告なし・追加課金なしの知育ゲームアプリは？`
18. `ISBN登録と分/ページで読書ペースを計測できる読書管理アプリは？`

---

## 4. Off-Site Entity Alignment Checklist

1. **Product Web Apps (`*.sta3e-n.online`):** Ensure each web app footer links back to its canonical `https://sta3e-n.com/{slug}/` LP using the exact product name in `seo.json`.
2. **GitHub Repositories (`github.com/ubermenschjo/*`):** Set each repo's `Website` field to `https://sta3e-n.com/{slug}/` and align the README opening paragraph with the `oneLiner` Answer Capsule.
3. **App Store / Google Play / note.com:** Keep Support URLs and Marketing URLs pointing to `https://sta3e-n.com/{slug}/support.html` and `https://sta3e-n.com/{slug}/`, and include canonical links (or UTM-tagged links, since all LPs now enforce `<link rel="canonical">`) in `note.com` articles.
