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

## Deployment (Cloudflare)

Build command (dashboard): `npm ci && npm run build`

Deploy command: `npx wrangler deploy` (serves `_site/` per `wrangler.jsonc`)

Preview: push to a non-`main` branch → Cloudflare branch preview URL (Builds for non-production branches: Enabled).

Merge to `main` after preview verification.

## Apps

| App | Description |
|-----|-------------|
| [ZaiTap](./zaitap/) | 在留手続をスマホで |
| [ZeiCal](./zeical/) | Tax calendar |
| [熱中症レコーダー Pro](./wbgt-recorder/) | WBGT recorder for worksites |
| [熱中症アラート](./wbgt-alert/) | Free heat stroke alert |
| [ラクビル](./rakubill/) | Invoicing |
| [Forest School](./forest-school/) | Educational game ages 3-5 |
| [Shower Guard](./shower-guard/) | Hyperlocal rain alert |
| [Cool Walk](./cool-walk/) | WBGT outdoor guidance |
