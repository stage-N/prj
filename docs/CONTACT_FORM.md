# Contact form — Slack App setup

sta3e-n.com のお問い合わせフォーム (`/contact/`, `/en/contact/`, `/ko/contact/`) は Cloudflare Worker の `POST /api/contact` 経由で Slack に通知します。

## アーキテクチャ

- **フロント**: Eleventy 静的 HTML + `fetch("/api/contact")`
- **API**: [src/worker.js](../src/worker.js) → [src/contact.js](../src/contact.js)
- **通知**: Slack App `chat.postMessage`（Incoming Webhook は使用しない）

## 1. Slack App を manifest から作成

1. [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From an app manifest**
2. ワークスペースを選択
3. [slack-app/manifest.json](../slack-app/manifest.json) の内容を貼り付け → **Create**
4. **Install to Workspace**
5. **OAuth & Permissions** で **Bot User OAuth Token** (`xoxb-...`) をコピー
6. 通知先チャンネル（例: `#contact`）で `/invite @STAGEN Contact`
7. チャンネル ID を取得（チャンネル詳細 → リンク末尾の `C...`）

## 2. Worker secrets

```bash
cd prj-githubpage
npx wrangler secret put SLACK_BOT_TOKEN    # xoxb-...
npx wrangler secret put SLACK_CHANNEL_ID   # C0123456789
```

ローカル開発:

```bash
npm run build
npx wrangler dev
# .dev.vars に SLACK_BOT_TOKEN / SLACK_CHANNEL_ID を書いても可（git 管理外）
```

## 3. デプロイ

`main` へ push → Cloudflare が `npm ci && npm run build` + `wrangler deploy` を実行。

## 4. テスト

| URL | 言語 |
|-----|------|
| https://sta3e-n.com/contact/ | 日本語 |
| https://sta3e-n.com/en/contact/ | English |
| https://sta3e-n.com/ko/contact/ | 한국어 |

1. 各ページでフォーム送信
2. Slack チャンネルに Block Kit メッセージが届くこと
3. secrets 未設定時は `503 service unavailable`

## カテゴリ

| slug | 用途 |
|------|------|
| `product` | 製品について |
| `business` | ビジネス・提携 |
| `other` | その他 |

不具合報告は各製品の Support（GitHub Issues）へ誘導。contact フォームに bug カテゴリはありません。

## トラブルシュート

| 症状 | 対処 |
|------|------|
| `not_in_channel` | チャンネルに Bot を `/invite` |
| `channel_not_found` | `SLACK_CHANNEL_ID` を確認 |
| `invalid_auth` | `SLACK_BOT_TOKEN` を再発行・再設定 |
| `403 forbidden` | Origin が sta3e-n.com / workers.dev 以外 |
