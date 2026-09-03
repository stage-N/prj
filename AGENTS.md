# AGENTS.md — STAGEN `prj-githubpage` 인수인계

> **다른 AI는 이 파일만 읽고 작업을 이어가라.** 스킬·규칙 원문은 경로를 따르고, 여기서는 이 저장소에 필요한 지식만 복제한다.  
> 작성: 2026-09-03. 브랜치 `main` @ `b40b185`. 오래가는 결정을 새로 알면 **이 파일을 갱신**한다.

로컬 경로: `/Users/doongle/works/stagen/prj-githubpage`  
원격: `git@github.com:stage-N/prj.git` (`origin`)  
프로덕션: **https://sta3e-n.com** (Cloudflare Worker `prj`)  
레거시: https://stage-n.github.io/prj/ (더 이상 배포 소스 아님)

사용자 응답은 **한국어**. 이 저장소의 HTML/카피/코멘트는 **일본어가 기본**이며, 대상 파일에 일본어가 있으면 문자열·주석도 일본어로 둔다. en/ko는 locale override만.

커밋·푸시는 사용자가 명시할 때만.

---

## 0. 이 저장소가 하는 일

STAGEN(1인 법인 스튜디오)의 **회사 사이트 + 앱 LP/Privacy/Support + 블로그**.  
앱 바이너리·Worker 제품 앱은 **여기 없다**. 여기는 정적 페이지와 얇은 Worker(UTM + contact)만.

| 이 저장소 (`sta3e-n.com`) | 제품 웹앱 (`*.sta3e-n.online`) |
|---|---|
| 회사 홈, `/message/`, `/blog/`, `/contact/` | 실제 서비스 UI |
| `/{slug}/` LP · `privacy.html` · `support.html` | flavor별 서브도메인 |
| Apple 3.1.2 페이월이 가리키는 Privacy URL | Stripe/RC/앱 API |

슬로건: 「人が活躍できる場は１つではない。」 / 「We deliver on time, on budget, and on spec.」  
브랜드 컬러: `#333` `#15b788` `#1395ba` `#feffff`. 로고: `assets/branding/` (`logo-symbol`, `logo-wordmark`, `logo-inverted`, `logo-main`). 원본은 `~/sync/Branding`.

---

## 1. 바로 쓰는 명령

```bash
npm install
npm run dev     # Eleventy watch + local server
npm run build   # → _site/  (커밋 금지)
npm run og      # scripts/generate-og-images.mjs (1200×630 SVG+PNG)
npx wrangler deploy   # 사용자 지시 시에만. 먼저 npm run build
npx wrangler secret put SLACK_BOT_TOKEN
npx wrangler secret put SLACK_CHANNEL_ID
```

Cloudflare Builds(대시보드): `npm ci && npm run build` 후 `npx wrangler deploy`.  
`main` push = 프로덕션. 비-`main` = preview URL.

로컬 Worker(contact/UTM): `npm run build && npx wrangler dev`. `.dev.vars`는 git 무시.

**패키지 설치:** `apt`/`brew install` 금지. nixpkgs → home-manager / nix-darwin Homebrew 선언 → `sudo -S nix run nix-darwin -- switch --flake ~/.config/nix-darwin < ~/.pwd-pipe`. 비밀번호를 출력·커밋하지 말 것.

---

## 2. 아키텍처 (건드릴 파일)

```
Eleventy 3 (`eleventy.config.js`)
  src/pages/{slug}/{index,privacy,support}.njk  → locale pagination (ja/en/ko)
  src/_includes/bodies/{slug}-{page}[.{en|ko}].html  → 실제 본문
  src/_data/pages/{slug}.json  → title/og/styles (ja 기본)
  src/_data/i18n.json          → en/ko 메타·카피
  {slug}/**.{png,svg}          → passthrough (아이콘·OG·스크린샷)
  assets/                      → 공통 브랜딩·product-*.png
Worker (`src/worker.js` + wrangler.jsonc)
  UTM query → Analytics Engine `utm_clicks` (binding `UTM_ANALYTICS`)
  POST /api/contact → src/contact.js → Slack chat.postMessage
```

**locale URL**

| | 예 |
|---|---|
| ja (기본, prefix 없음) | `/zaitap/privacy.html` |
| en | `/en/zaitap/privacy.html` |
| ko | `/ko/zaitap/privacy.html` |

페이지 엔진: `{slug}/*.njk`는 거의 빈 stub. `layout: app.njk` → `base.njk`가 `bodyContent` shortcode로 bodies HTML을 끼운다. 회사 홈은 `layout: site.njk` → `site-index` body.

**본문 해석 순서:** `{slug}-{page}.{locale}.html` 있으면 사용, 없으면 일본어 `{slug}-{page}.html`. en/ko 전문 번역은 선택. 타이틀/OG는 `i18n.json`이 덮어씀.

**OG:** X 크롤러는 SVG를 잘 못 읽는다 → **PNG를 메타에 쓰는 것이 정본** (`og-image.png`, 1200×630). `fe9780a`. JSON의 `ogImage`는 `https://sta3e-n.com/{slug}/og-image.png` 형태.

**히어로 가독성:** `src/_includes/css/app-hero.css`가 앱 LP `section.hero`를 어두운 배경+흰 글자로 덮는다. 연한 hero + 흰 글자 조합을 다시 만들지 말 것 (`2557816`).

**locale 에셋 경로:** `eleventy.config.js`의 `fixLocalizedAssetPaths` transform이 `/en|ko/{app}/index.html`에서 상대 `icon.png`·`screenshot-`·`screenshots/`를 `../../{app}/`로 고친다. 새 이미지 경로를 body에 넣을 때 이 규칙을 깨지 말 것. `forest-school/screenshots/`는 passthrough glob에 서브디렉터리가 필요해서 `addPassthroughCopy(\`${app}/**/*.{png,...}\`)`로 바꿨다 (`b2c6f59`).

`_site/` · `node_modules/` · `.wrangler` · `.dev.vars*` · `.env*` 는 git 무시.

---

## 3. 새 앱 추가 (가장 흔한 작업)

체크리스트 원본: `/Users/doongle/works/stagen/.cursor/skills/prj-githubpage-product/SKILL.md`  
트리거: 「프로덕트 추가」「LP」「sta3e-n.com에 등록」「GitHub Pages」.

slug는 kebab-case. 각 앱은 **index / privacy / support** 세트.

1. `APPS`에 slug — `eleventy.config.js` **와** `scripts/bootstrap-pages.mjs` (둘 다).
2. 에셋: `{slug}/icon.png`, `assets/images/product-{slug}.png`, `{slug}/og-image.svg` + PNG (`npm run og` 또는 수동).
3. 본문: `src/_includes/bodies/{slug}-{index,privacy,support}.html` (ja). 템플플: 교육=`fuzen`, 비즈니스=`rakubill`, 투자=`stock-pulse`.
4. `src/_data/pages/{slug}.json` — 필수: `index.title`, `index.desc`, `index.ogImage`, styles.
5. `src/pages/{slug}/{index,privacy,support}.njk` — 기존 앱 복사 후 `app`·`permalink`만 치환.
6. `src/_data/i18n.json`에 `"{slug}": { "en": {index,privacy,support}, "ko": {...} }`.
7. `site-index.html` **및** `.en.html` `.ko.html`에 product-card + 푸터 프로덕트 링크. 카드 3언어를 같이 맞출 것.
8. `README.md` Apps 표.
9. `src/contact.js`의 `PRODUCTS` Set **과** `i18n.json` contact `products` / `productSlugs` (폼 드롭다운). 빠져 있으면 해당 제품 문의가 `invalid product`.
10. `scripts/generate-og-images.mjs`의 `APPS` (선택).
11. `npm run build`로 `_site/{slug}/` 확인.

Privacy는 STAGEN 표준(단말 내 저장·제3자 취득을 명시). Support는 `https://github.com/ubermenschjo/{repo}/issues`. 투자계는 투자조언 아님 면책을 index+support에. 스토어 미공개면 CTA를 「準備中」. `_site/` 커밋 금지.

스토어 페이월 Privacy 링크는 항상 `https://sta3e-n.com/<lpSlug>/privacy.html`. EULA 커스텀 없으면 Apple 표준 EULA. 구독 UI는 앱 바이너리 쪽 (`expo-subscription-legal` 규칙) — 여기 LP URL만 맞추면 된다.

---

## 4. 도메인·제품 맵

**도메인 규칙:** 회사/LP = `sta3e-n.com`. 웹앱 = `{host}.sta3e-n.online` (구 `*.sta3e-n.com` 웹앱 URL은 폐기).  
예외: Touten 웹 CTA는 `https://sta3e-n.online` (서브도메인 없음). Phrase Flow flavor는 `{flavor}.phraseflow.sta3e-n.online`.

GitHub 이슈/코드: 제품은 대개 `github.com/ubermenschjo/{repo}`. **이 사이트 저장소만** `stage-N/prj`.

| slug | 표시명 | 웹앱 | GitHub | 비고 |
|---|---|---|---|---|
| zaitap | ZaiTap | — | zaitap | 스토어 링크 의도적 제외 이력 있음 |
| zeical | ZeiCal | — | zeical | AS `id6780321349` / Play `com.stagen.zeical` |
| wbgt-recorder | 熱中症レコーダー Pro | — | wbgt-monitor | AS `id6780710276` / Play `com.stagen.wbgt.biz` |
| wbgt-alert | 熱中症アラート | — | wbgt-monitor | AS `id6780366425` / Play `com.stagen.wbgt.consumer` |
| rakubill | ラクビル | — | rakubill | AS `id6780785397` / Play `com.stagen.rakubill` |
| forest-school | Forest School | — | forest-school | AS `id6783620641` / Play **`jp.stagen.forestschool`** (com.stagen 아님) |
| shower-guard | Shower Guard | showerguard.sta3e-n.online | shower-guard | 웹 CTA 있음. 모바일 스토어 과거 404 |
| cool-walk | Cool Walk | coolwalk.sta3e-n.online | cool-walk | 同上 |
| fuzen | Fuzen | — | fuzen | AS `id6794620986` / Play `com.stagen.fuzen` |
| stock-pulse | StockPulse | stockpulse.sta3e-n.online | stock-pulse | AS `id6794628277` / Play `com.stagen.stockpulse`. 투자 면책 필수 |
| touten | Touten | sta3e-n.online | touten | AS `id6800949057` / Play `com.stagen.touten`. 뉴스 3형제 |
| banjem | Banjem | banjem.sta3e-n.online | touten | AS `id6800948602` / Play `com.stagen.banjem` |
| newsprism | NewsPrism | newsprism.sta3e-n.online | touten | AS `id6800949069` / Play `com.stagen.newsprism` |
| phraseflow | Phrase Flow | phraseflow.sta3e-n.online | gujeol | AS `id6792987031` / Play `com.stagen.gujeol` |
| phraseflow-christianity | 今日のみことば | christianity.phraseflow.sta3e-n.online | gujeol | AS `id6792987918` / `com.stagen.gujeol.christianity` |
| phraseflow-buddhism | 今日の仏経 | buddhism.phraseflow.sta3e-n.online | gujeol | AS `id6792987802` / `…buddhism` |
| phraseflow-islam | 今日のクルアーン | islam.phraseflow.sta3e-n.online | gujeol | AS `id6792987807` / `…islam` |
| phraseflow-religion | 今日の宗教のことば | religion.phraseflow.sta3e-n.online | gujeol | AS `id6792988036` / `…religion` |
| stillpoint | Stillpoint | stillpoint.sta3e-n.online | stillpoint | AS `id6794211386` / `com.stagen.stillpoint`. 의료·심리치료 대체 금지 |
| pagepace | PagePace | pagepace.sta3e-n.online | pagepace | AS `id6794424608` / `com.stagen.pagepace` |
| briefforge | BriefForge | briefforge.sta3e-n.online | (site-index는 App 링크) | |
| solo-life | Solo Life | solo-life.sta3e-n.online | — | **페이지는 있으나 홈 카드·README Apps 표에 없음** |

뉴스 3형제(Touten/Banjem/NewsPrism) 공통: support에 `support@sta3e-n.com` (Play News 정책), Premium 카피는 **90일 아카이브** 정책에 맞출 것 (`b40b185`, `4d05f3e`). 특정 정당 추천 문구 금지.

`src/contact.js` `PRODUCTS`(2026-09-03): zeical, rakubill, zaitap, wbgt-*, forest-school, shower-guard, cool-walk, fuzen, stock-pulse, touten, phraseflow(+4 flavor), banjem, newsprism. **빠짐:** stillpoint, pagepace, solo-life, briefforge — i18n contact 쪽은 stillpoint/pagepace만 있음. 문의 폼 손볼 때 세 곳을 같이 맞출 것.

---

## 5. Worker · 문의 · UTM

**`src/worker.js`:** `/api/contact`만 분기, 그다음 UTM 있으면 AE write, 아니면 `env.ASSETS.fetch`. IP를 앱이 저장하지 않음.

**Contact** (`docs/CONTACT_FORM.md`)

- 페이지: `/contact/` `/en/contact/` `/ko/contact/`
- 카테고리: `product` | `business` | `other` (버그 카테고리 없음 → 각 앱 Support/GitHub)
- honeypot 필드 `website` → 200 `{ok:true}` (봇)
- Origin/Referer 허용: `sta3e-n.com`, `*.sta3e-n.com`, `*.workers.dev`, `localhost` — **`sta3e-n.online`은 현재 미허용**
- secrets 없으면 503. Slack 오류 시 500
- Slack App manifest: `slack-app/manifest.json`. Incoming Webhook 쓰지 않음

**UTM** (`docs/UTM_ANALYTICS.md`)

- 데이터셋 `utm_clicks`, binding `UTM_ANALYTICS`. 미활성 시 deploy `[code: 10089]`
- index1–3 = source/medium/campaign, blob1 = pathname, blob2 = utm_content, double1 = timestamp ms
- Cloudflare 계정(대시보드): `b42c688e14d92d5ca33c92d375bb30e1`
- 주간 리포트: `stagen-ops/scripts/marketing/weekly-utm-report.sh`
- wrangler에 AE 바인딩이 **필수**. 끄고 배포하던 옛 브랜치 `feature/i18n-eleventy`는 참고만

`package.json`에 wrangler 없음 → `npx wrangler`. Eleventy·`@resvg/resvg-js`만 devDep. 새 의존성 추가 금지에 가깝게 (Ponytail).

---

## 6. 블로그 · 마케팅

블로그는 **일본어만**, locale 페이지 없음. Worker 변경 불필요(정적 ASSETS).

| URL | |
|---|---|
| `/blog/` | 목록 (`src/pages/blog/index.njk`) |
| `/blog/{slug}/` | 글 |

글: `src/blog/posts/YYYY-MM-DD-{product}.md`. `posts.json`이 전 글에 `layout: blog-post.njk`, `tags: blogPosts`.

front matter 필수: `title`, `description`(120자 이내), `date`, `permalink: /blog/YYYY-MM-DD-PRODUCT/index.html`, `layout: blog-post.njk`, `tags`.

마케팅 생성은 **이 저장소가 아니라** `stagen-ops` + 스킬:

- `/Users/doongle/works/stagen/.cursor/skills/marketing-publish/SKILL.md` — `/marketing`, X+블로그
- `/Users/doongle/works/stagen/.cursor/skills/story-bank/SKILL.md` — `STORY_BANK.yaml`만

규칙 요약: 평일 X 전 제품, 월수금 블로그 1편을 **여기** `src/blog/posts/`에 직접 씀. 가치 先行, 제품 CTA는 끝. NG: `税理士不要` `税理士の代わり` `申請代行` `確実に許可`. TRENDS.yaml은 JST 당일 갱신 후 생성. Phrase Flow 계열 X는 media-daily(GHA) 담당이라 `calendar.yaml` `x_products`에 넣지 않음.

검증:

```bash
cd /Users/doongle/works/stagen/stagen-ops
bash scripts/marketing/blog-content-check.sh ../prj-githubpage/src/blog/posts/YYYY-MM-DD-PRODUCT.md
```

이미지 URL은 `https://sta3e-n.com/...` (로컬 경로 금지). 기존 글: zeical, rakubill, zaitap, gsign, forest_school, wbgt, media-literacy-vision, stillpoint.

---

## 7. 코드 스타일 (Ponytail)

원문: `/Users/doongle/works/stagen/.cursor/rules/imported/ponytail/ponytail.mdc`

최소 diff. 이미 있는 bodies/JSON/njk 패턴을 복사. 새 추상화·새 의존성·요청 없는 리팩터 금지. 의도적 지름길은 `ponytail:` 주석 + 천장·업그레이드 경로. 비트리비얼 로직은 깨지면 실패하는 작은 체크 하나.

이 저장소 기존 `ponytail:` 예: passthrough 서브디렉터리 유지, locale 에셋 경로 transform, 블로그는 절대 `/assets/`라 transform 불필요, UTM은 query만.

프론트: 기존 LP 시각 언어 유지 (회사 홈은 이미 카드·히어로 캔버스가 디자인 시스템). 새 마케팅 랜딩을 처음부터 그릴 때만 사용자 frontend-design 규칙 적용.

---

## 8. 스킬 · 규칙 · MCP (이 워크스페이스)

이 저장소에는 `.cursor/`가 없다. 부모 `/Users/doongle/works/stagen/.cursor/`와 사용자 Cursor 설정이 실제 소스다. 이 레포만 클론한 환경에서는 **이 AGENTS.md가 SSOT**.

### 스킬 (작업 시 Read)

| 스킬 | 경로 | 언제 |
|---|---|---|
| prj-githubpage-product | `stagen/.cursor/skills/prj-githubpage-product/SKILL.md` | 앱 LP 추가 |
| marketing-publish | `stagen/.cursor/skills/marketing-publish/SKILL.md` | `/marketing`, X/블로그 |
| story-bank | `stagen/.cursor/skills/story-bank/SKILL.md` | STORY_BANK 수정 |
| expo-store-register | `stagen/.cursor/skills/expo-store-register/SKILL.md` | 스토어 등록 (앱 레포+store-tools). **앱 코드는 여기 두지 않음** |
| wrangler / cloudflare | Cursor Cloudflare 플러그인 스킬 | Worker·AE·deploy 문서. wrangler 플래그는 문서 재조회 |
| create-rule / create-skill | `~/.cursor/skills-cursor/` | 규칙/스킬 파일 작성 요청 시 |

### 규칙 (always)

| 규칙 | 이 레포 함의 |
|---|---|
| Ponytail | 위 §7 |
| expo-subscription-legal | Privacy URL이 이 사이트의 `/{slug}/privacy.html` |
| parallel-ios-android | 여기선 거의 무관 (Maestro는 앱 레포) |
| package-install-nix-darwin | CLI 설치 방법 |
| 사용자: 한국어 답변 / 명시 없는 commit 금지 / 시크릿 읽지 않기 | |

Karpathy: 가정 드러내기, 최소 코드, 요청한 줄만, 검증 가능한 성공 조건.

### MCP (세션에 붙어 있는 것)

`stagen/.cursor/mcp.json`은 `"mcpServers": {}`. 실제 MCP는 Cursor 플러그인/사용자 설정.

이 레포에서 **쓰면 좋은 것:**

- `plugin-cloudflare-cloudflare-docs` — `search_cloudflare_documentation` (Workers, AE, Assets)
- `plugin-cloudflare-cloudflare-bindings` — Worker `prj` 조회, KV/R2/D1 목록 (이 사이트는 D1 없음)
- `plugin-cloudflare-cloudflare-builds` / `observability` — 배포·로그. **needsAuth면 `mcp_auth` 후 재시도**
- `user-context7` — Eleventy 3 / wrangler 최신 API (`resolve-library-id` → `query-docs`)

**이 레포 작업에 보통 불필요:** Figma, Atlassian, Expo, Maestro, AdMob, sequential-thinking.  
시크릿(`.p8`, Slack `xoxb-`, Stripe `sk_` 등)을 Read·채팅·커밋하지 말 것. 경로는 물어보고 스크립트가 파일을 읽게 한다.

Cloudflare 작업 시: Worker 이름 **`prj`**, assets directory **`_site`**, compatibility_date `2026-06-26`, `nodejs_compat`. Pages가 아니라 **Workers + Assets**.

---

## 9. 알려진 구멍 (고치라는 뜻이 아니라, 밟지 말라는 뜻)

다음에 손을 대면 같이 맞출 것. 범위 밖이면 메모만 (Ponytail).

- 홈 `site-index.{html,en,ko}`에 **solo-life 카드 없음**. README Apps 표에도 없음. `APPS`와 페이지는 있음.
- contact `PRODUCTS` vs i18n contact products vs 실제 앱 목록 불일치 (§4).
- `generate-og-images.mjs` APPS에 shower-guard, cool-walk, phraseflow flavors, solo-life 없음.
- contact Origin 허용에 `sta3e-n.online` 없음 (웹앱에서 회사 폼을 치면 403).
- `app-ads.txt`는 이 레포에 없음. `sta3e-n.com/app-ads.txt`가 필요하면 루트 passthrough로 따로. GitHub Pages `/prj/` 아래로는 AdMob 루트 요구를 충족 못 함 (과거 대화).

---

## 10. 형제 저장소 (건드리기 전 확인)

모두 `/Users/doongle/works/stagen/`.

| 레포 | 역할 |
|---|---|
| `stagen-ops` | 마케팅 큐, TRENDS, 블로그 검증, UTM 주간 리포트 |
| `store-tools` | 스토어 메타·IAP·EAS 포인터. 앱 레포에 마켓 스크립트 두지 않음 |
| `wbgt-monitor` | Alert + Recorder Pro (flavor) |
| `gujeol` | Phrase Flow 5 flavor Expo+웹 |
| `touten` | Touten/Banjem/NewsPrism. 네이티브는 `feat/native-app` 계획 (WebView 금지, gujeol 패턴, Privacy는 이 사이트) |
| `pagepace` / `stillpoint` / `fuzen` / `stock-pulse` / … | 각 앱. `legalUrls` → `https://sta3e-n.com/<slug>/privacy.html` |

회사 전략 장문: `docs/BUSINESS_STRATEGY.md` (5 클러스터, 2026–2028). LP 카피와 모순되면 **제품 PRD/현재 bodies가 우선**, 전략서는 배경.

---

## 11. 결정 로그 (다른 세션에서 이미 끝난 것)

시간순이 아니라 **되풀이되는 실수 방지** 위주. 대화 인용: `[제목](uuid)`.

**사이트 골격**

- 정적 파일을 수동 복제하지 않고 Eleventy+locale pagination으로 관리 ([Multilingual GitHub Pages management](332b4295-0fa2-4a5b-97fe-d1930745ca30)).
- 회사 홈은 `~/sync/Branding` 로고 + 포트폴리오 카드 동선 ([브랜딩 index 재구성](19b4551d-81b6-4e3b-b845-ff77dd38a31c)). 로고를 섹션 아이콘으로 반복하지 말 것 — `assets/images/about.png`, `service-*.png`, `product-*.png`.
- 프로덕션은 GitHub Pages가 아니라 Cloudflare Workers (`prj`) + 커스텀 도메인.
- 히어로 카피 3줄 stagger + canvas: `assets/js/hero-stage.js`. 창립 연도 **2022** (`dd48662`).

**LP / 스토어**

- 새 앱은 스킬 체크리스트 10항. Fuzen이 교육 LP 레퍼런스.
- 마켓 배지는 **라이브 URL만**. 404면 準備中. 스토어 ID는 itunes lookup / Play 패키지로 검증한 뒤 넣을 것 ([제품 상세 마켓 링크](eefe86a8-1ab1-4d48-bdf3-9964335775bf)).
- 웹앱 링크는 `*.sta3e-n.online`. `workers.dev`나 옛 `*.sta3e-n.com` 앱 URL로 되돌리지 말 것.
- X 카드: PNG OG + twitter:image (`fe9780a`).
- StockPulse privacy는 계정·IAP·기기 데이터 반영 (`98ace17`). Play 콘솔 PP URL = `https://sta3e-n.com/stock-pulse/privacy.html`.
- Touten 패밀리 support 메일 + 90일 아카이브 카피 (`4d05f3e`, `b40b185`).

**마케팅**

- 블로그는 queue가 아니라 이 레포에 직접. 제목에 장 번호 넣지 않음 (`bb7c20f`).
- stillpoint/pagepace/fuzen을 스토어 링크 넣은 뒤 stagen-ops `x_products`/`blog_sequence`에 추가한 이력 있음. phraseflow X는 별도 파이프.

**하지 말 것**

- 앱 기능/네이티브를 이 레포에서 구현하지 말 것. LP·법무 URL만.
- WebView로 스토어 앱 포장 (stagen 표준 아님; gujeol/touten은 RN UI + Worker API).
- 시크릿 값 출력. Slack 토큰은 wrangler secret.
- `agy --dangerously-skip-permissions`로 이미지 대량 생성은 타임아웃 난 적 있음. Cursor `GenerateImage` 또는 앱 아이콘 복사가 더 안정.

**최근 이 워크스페이스 대화**

- [제품 상세 마켓 링크](eefe86a8-1ab1-4d48-bdf3-9964335775bf) — 스토어 배지 실링크 + 마케팅 대상 추가.
- [브랜딩 회사 홈](19b4551d-81b6-4e3b-b845-ff77dd38a31c) — index를 회사 사이트로, 섹션별 이미지.
- [Touten 네이티브 MVP](7967e210-3b6a-48b7-9764-a1cfed28d370) — 이 레포가 아니라 `touten/`. LP slug `touten|banjem|newsprism` 이미 존재.

---

## 12. 작업 시작 체크리스트

1. 요청이 LP/privacy/support/홈/블로그/contact/UTM 중 어디인지 정한다.
2. 같은 slug의 bodies + pages JSON + i18n + site-index 3언어 + APPS 배열을 같이 연다.
3. 웹앱 URL을 넣을 때 `sta3e-n.online`인지 확인한다.
4. Privacy를 바꾸면 스토어·페이월이 이 URL을 그대로 쓰는지 기억한다 (바이너리 수정은 앱 레포).
5. `npm run build`로 해당 경로가 `_site/`에 나오는지 확인한다.
6. 커밋은 요청받을 때만. 푸시도 마찬가지.

막히면 이 파일 §9 구멍과 §11 결정 로그를 먼저 본다.
