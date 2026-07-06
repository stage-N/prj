# STAGEN Pages

Privacy policy and support pages for STAGEN applications (ja / en / ko).

## Published at

- Production: Cloudflare Workers (`prj`) — GitHub `stage-N/prj` 연동
- Legacy URL: https://stage-n.github.io/prj/

## Local development

```bash
npm install
npm run dev    # watch + local server
npm run build  # output → _site/
```

## Project structure

```
src/
  pages/           # locale pagination entry (ja/en/ko × 25 pages)
  blog/posts/      # blog markdown (from stagen-ops queue or manual)
  _includes/
    bodies/        # page body HTML (extracted from legacy files)
    layouts/       # base shell + lang switcher + hreflang
  _data/pages/     # per-page title, og, styles meta
assets/            # shared branding & images
{zaitap,...}/      # app-specific images (png, og-image)
```

## URL scheme

| Locale | Example |
|--------|---------|
| ja (default) | `/zaitap/privacy.html` |
| en | `/en/zaitap/privacy.html` |
| ko | `/ko/zaitap/privacy.html` |

## Adding a new app

1. Add app images under `app-name/`
2. Create legacy HTML (`app-name/index.html`, `privacy.html`, `support.html`) or edit `src/_includes/bodies/` directly
3. Run `node scripts/bootstrap-pages.mjs` to regenerate stubs/meta (if using legacy HTML)
4. Add passthrough app name to `APPS` in `eleventy.config.js`
5. Add product card in `src/_includes/bodies/site-index.html`

## Translating content

- Default body (Japanese): `src/_includes/bodies/{app}-{page}.html`
- Locale override: `src/_includes/bodies/{app}-{page}.{en|ko}.html` — auto-selected by `bodyContent` shortcode
- Page titles/descriptions: `src/_data/i18n.json`

Example: edit `zaitap-privacy.en.html` for English privacy policy text.

## Blog (STAGEN サイト公開)

マーケ記事は `src/blog/posts/*.md` に直接配置。Eleventy が `_site/blog/` にビルド。

| URL | 内容 |
|-----|------|
| `/blog/` | 記事一覧 |
| `/blog/{slug}/` | 個別記事 |

### 記事の追加

1. `/marketing` スキルまたは agy で `src/blog/posts/YYYY-MM-DD-{product}.md` を生成
2. `bash stagen-ops/scripts/marketing/blog-content-check.sh` で検証
3. `npm run build` — `_site/blog/` に静的 HTML 出力

記事は日本語のみ（locale ページなし）。Cloudflare Worker は変更不要 — 既存の `ASSETS.fetch` で静的配信。

front matter 必須: `title`, `description`, `date`, `permalink`, `layout: blog-post.njk`, `tags`（`posts.json` 経由で `blogPosts` コレクション）

## Contact form

| URL | 言語 |
|-----|------|
| `/contact/` | 日本語 |
| `/en/contact/` | English |
| `/ko/contact/` | 한국어 |

Slack App 連携・secrets 設定: [docs/CONTACT_FORM.md](./docs/CONTACT_FORM.md)

## Deployment (Cloudflare)

Build command (dashboard): `npm ci && npm run build`

Deploy command: `npx wrangler deploy` (serves `_site/` per `wrangler.jsonc`)

Preview: push to a non-`main` branch → Cloudflare branch preview URL (Builds for non-production branches: Enabled).

Merge to `main` after preview verification.

### UTM Analytics Engine (必須 — 初回 deploy 前)

Worker は UTM パラメータを Analytics Engine データセット `utm_clicks` に記録する。
**deploy 前に Cloudflare ダッシュボードで Analytics Engine を有効化すること。**

未有効時の deploy エラー: `[code: 10089] You need to enable Analytics Engine`

1. Dashboard → **Workers & Pages** → **Analytics Engine** → **Enable**  
   https://dash.cloudflare.com/b42c688e14d92d5ca33c92d375bb30e1/workers/analytics-engine
2. `main` へ push（または `npx wrangler deploy`）
3. UTM 付き URL でアクセス → Dashboard で `utm_clicks` 確認

詳細: [docs/UTM_ANALYTICS.md](./docs/UTM_ANALYTICS.md)

## Apps

| App | Description |
|-----|-------------|
| [ZaiTap](./zaitap/) | 在留手続をスマホで |
| [ZeiCal](./zeical/) | Tax calendar |
| [熱中症レコーダー Pro](./wbgt-recorder/) | WBGT recorder for worksites |
| [熱中症アラート](./wbgt-alert/) | Free heat stroke alert |
| [ラクビル](./rakubill/) | Invoicing |
| [Forest School](./forest-school/) | Educational game ages 3-5 |
| [Fuzen](./fuzen/) | Functional thinking — Think in Fuzen |
| [StockPulse](./stock-pulse/) | Japanese stock portfolio analysis |
| [Touten](./touten/) | Japanese news stance comparison across five national dailies |
| [Phrase Flow](./phraseflow/) | Daily wisdom quotes with dual perspectives |
| [Banjem](./banjem/) | Korean news stance comparison across five major outlets |
| [Shower Guard](./shower-guard/) | Hyperlocal rain alert |
| [Cool Walk](./cool-walk/) | WBGT outdoor guidance |
