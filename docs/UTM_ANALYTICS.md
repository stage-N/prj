# UTM Analytics Engine — セットアップ

sta3e-n.com の UTM クリックを `utm_clicks` データセットに記録する。

## 前提

- Worker: `src/worker.js` — UTM query → AE write → 静的 HTML
- 設定: `wrangler.jsonc` — `analytics_engine_datasets` バインディング **必須**

## 手動作業 (初回デプロイ前)

Cloudflare アカウントで Analytics Engine が **未有効** の場合、deploy は失敗する:

```
[code: 10089] You need to enable Analytics Engine
```

### 1. データセット作成 (Create Blank Dataset)

1. [Cloudflare Dashboard → Analytics Engine](https://dash.cloudflare.com/b42c688e14d92d5ca33c92d375bb30e1/workers/analytics-engine)
2. **Create Blank Dataset** を開く
3. 以下を **`wrangler.jsonc` と完全一致** で入力:

| フィールド | 入力値 |
|-----------|--------|
| **Dataset Name** | `utm_clicks` |
| **Dataset Binding** | `UTM_ANALYTICS` |

4. **Create Dataset** をクリック

> Binding 名は Worker 内の `env.UTM_ANALYTICS` と一致必須。Dataset 名は `wrangler.jsonc` の `"dataset"` と一致必須。

```jsonc
// wrangler.jsonc (参照)
"analytics_engine_datasets": [{
  "binding": "UTM_ANALYTICS",
  "dataset": "utm_clicks"
}]
```

### 2. デプロイ

```bash
cd prj-githubpage
npm ci && npm run build
npx wrangler deploy
```

成功ログ例:

```
env.UTM_ANALYTICS (utm_clicks)  Analytics Engine Dataset
env.ASSETS                        Assets
```

### 3. 動作確認

```bash
curl -sI "https://sta3e-n.com/zaitap/?utm_source=x&utm_medium=social&utm_campaign=test"
```

数分後、Dashboard → Analytics Engine → `utm_clicks` でイベント確認。

または:

```bash
npx wrangler analytics-engine sql \
  "SELECT index1, blob1, COUNT(*) AS n FROM utm_clicks GROUP BY index1, blob1 LIMIT 10"
```

## データスキーマ

| フィールド | 内容 |
|-----------|------|
| index1 | utm_source |
| index2 | utm_medium |
| index3 | utm_campaign |
| blob1 | pathname (例 `/zaitap/`) |
| blob2 | utm_content |
| double1 | timestamp (ms) |

## 週次レポート

stagen-ops:

```bash
cd /Users/doongle/works/stagen/stagen-ops
bash scripts/marketing/weekly-utm-report.sh
```

## トラブル

| エラー | 対処 |
|--------|------|
| 10089 | 上記 Step 1 — AE 有効化してから再 deploy |
| binding なし | `wrangler.jsonc` に `analytics_engine_datasets` があるか確認 |
| イベント 0 | UTM 付き URL でアクセスしたか、数分待つ |
