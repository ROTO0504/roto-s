# roto-s

`s.roto.work` を提供する自前 URL 短縮サービス。Cloudflare Workers + D1 + Hono の API と、Vite + React + Panda CSS + GSAP の SPA 管理画面を **1つの Worker に同梱**して配信する。認証は WebAuthn / Passkey。

## 目的

- 保有ドメイン `roto.work` をプロダクトとして資産化する
- Workers / D1 / Analytics Engine / WebAuthn といった「実運用に必要な要素」を一通り束ねた、語れるポートフォリオを作る

## 機能

- `s.roto.work/<slug>` → 元 URL に 301 リダイレクト（クリックは Analytics Engine に非同期記録）
- カスタム slug + ランダム slug（nanoid 6文字）
- UTM パラメータの **事前設定** + **クエリパススルー**（後者が上書き）
- クリックごとに国 / 地域 / 都市 / デバイス / ブラウザ / OS / Referer / 言語 / UTM を記録
- 管理画面：リンク一覧 / 作成 / 編集 / 削除 / 詳細ダッシュボード（日別・国別・デバイス別など）
- **Passkey 認証**（自前 WebAuthn 実装、`@simplewebauthn/server`）

## 技術選定

| レイヤ         | 採用                                            | 理由                                                    |
| -------------- | ----------------------------------------------- | ------------------------------------------------------- |
| ランタイム     | Cloudflare Workers                              | エッジで完結。リダイレクトを ~30ms で返す               |
| API            | Hono                                            | Workers ネイティブ・型安全・学習コスト最小              |
| DB             | D1                                              | エッジから読める SQLite。「キー1つ引き」と相性が良い    |
| クリック解析   | Analytics Engine                                | D1 書き込み枠を圧迫しない。SQL で集計可能               |
| 管理画面       | Vite + React + React Router v7（Data Mode SPA） | 内部ツールで SEO 不要 → Next.js は過剰                  |
| スタイリング   | Panda CSS                                       | Type-safe / zero-runtime / recipes でデザインシステム化 |
| アニメーション | GSAP（`@gsap/react`）                           | 一覧の stagger / コピー時の演出など限定的に             |
| 配置           | Workers Assets で同 Worker に同梱               | デプロイ1つで完結。CORS 不要                            |
| 認証           | WebAuthn / Passkey（自前）                      | パスワードレス。1人運用で UX 最強                       |

### なぜ Next.js ではなく Vite SPA か

- 管理画面は内部ツールで SEO・SSR の利点なし
- Bearer トークン的な秘匿値は **Worker 内部に閉じ、admin にはセッション Cookie のみ**渡す設計が取れる → Server Actions のメリットも消える
- Vite はビルドが軽く、思考も軽い

### なぜ Vercel ではなく Workers + D1 か

- 短縮 URL は「DB を1回引いて 301 を返すだけ」の用途。エッジで DB アクセスまで完結する Workers + D1 がレイテンシ的に最適
- 月間トラフィックが少なくても無料枠で十分回る

### なぜ Passkey か

- 1人運用ならパスワード管理コストすらゼロにできる（Touch ID / Face ID / Windows Hello）
- WebAuthn を自前で実装している学生は少なく、ポートフォリオの差別化になる

## ディレクトリ

```
roto-s/
├── apps/
│   ├── api/          # Hono on Workers (短縮URL + 認証 + アナリティクス)
│   └── admin/        # Vite + React SPA (Workers Assets 経由で同梱)
├── package.json      # workspaces
└── README.md
```

## セットアップ

### 前提

- Bun（npm でも動くが Bun 推奨）
- Cloudflare アカウント、`roto.work` ゾーンを Cloudflare 管理下に置く
- `wrangler login` 済み

### 初回構築

```bash
bun install

# D1 を作成し、出力された database_id を apps/api/wrangler.toml に貼る
cd apps/api
bunx wrangler d1 create roto-s-db

# マイグレーション
bunx wrangler d1 migrations apply roto-s-db --local
bunx wrangler d1 migrations apply roto-s-db --remote

# シークレット投入
bunx wrangler secret put SESSION_SECRET   # 32バイト相当のランダム文字列
bunx wrangler secret put INVITE_TOKEN     # 初回パスキー登録用、終わったら削除
bunx wrangler secret put CF_ACCOUNT_ID    # アナリティクス集計クエリ用
bunx wrangler secret put CF_API_TOKEN     # Analytics Engine 読み取り権限のみ

# 管理画面ビルド + デプロイ
cd ../..
bun run build:admin
cd apps/api && bunx wrangler deploy
```

### 初回パスキー登録

1. `https://s.roto.work/admin/login` を開く
2. 「Register passkey」モードに切り替え
3. INVITE_TOKEN（`wrangler secret put` した値）と Device label を入力
4. ブラウザの認証ダイアログで Touch ID / Face ID を承認
5. 自動で一覧画面に遷移
6. `bunx wrangler secret delete INVITE_TOKEN` で初回登録口を閉じる
   - 追加デバイスは一度ログイン後、`/admin/settings` から既存セッション認証で追加可能

### ローカル開発

```bash
# Worker（API）
cd apps/api
cp .dev.vars.example .dev.vars   # 値を編集
bunx wrangler d1 migrations apply roto-s-db --local
bunx wrangler dev                 # http://localhost:8787

# 管理画面（別ターミナル）
cd apps/admin
bun run dev                       # http://localhost:5173/admin/
```

ローカルでは `RP_ID=localhost` `ORIGIN=http://localhost:8787` で WebAuthn が動く（Vite proxy 経由で `/api/*` が Worker に飛ぶ）。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│ Cloudflare edge (s.roto.work)                            │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Worker: roto-s                                       │ │
│  │                                                      │ │
│  │  GET /:slug         ──► D1 SELECT ──► 301           │ │
│  │                          waitUntil:                  │ │
│  │                          ├ D1 UPDATE clicks++        │ │
│  │                          └ AE writeDataPoint         │ │
│  │                                                      │ │
│  │  POST /api/auth/*   ──► WebAuthn (passkey)          │ │
│  │  /api/links/*       ──► CRUD on D1 + AE 集計        │ │
│  │  /admin/*           ──► Workers Assets (SPA)         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────┐ ┌──────────────────┐ ┌──────────────────┐     │
│  │ D1   │ │ Analytics Engine │ │ Workers Assets   │     │
│  │ keys │ │ click events     │ │ admin SPA bundle │     │
│  │ 解析 │ │                  │ │                  │     │
│  └──────┘ └──────────────────┘ └──────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## API

| Method   | Path                              | 認証                    | 説明                                                 |
| -------- | --------------------------------- | ----------------------- | ---------------------------------------------------- |
| `GET`    | `/health`                         | –                       | ヘルスチェック                                       |
| `GET`    | `/:slug`                          | –                       | 元 URL へ 301、UTM 自動マージ、AE にイベント書き込み |
| `POST`   | `/api/auth/login/options`         | –                       | パスキー認証用 challenge                             |
| `POST`   | `/api/auth/login/verify`          | –                       | 検証 → セッション Cookie                             |
| `POST`   | `/api/auth/register/options`      | session or INVITE_TOKEN | 登録用 challenge                                     |
| `POST`   | `/api/auth/register/verify`       | session or INVITE_TOKEN | 検証 → D1 保存                                       |
| `GET`    | `/api/auth/me`                    | session                 | 認証状態確認                                         |
| `GET`    | `/api/auth/passkeys`              | session                 | 登録済みパスキー一覧                                 |
| `DELETE` | `/api/auth/passkeys/:id`          | session                 | パスキー削除（最後の1個は不可）                      |
| `POST`   | `/api/links`                      | session                 | リンク作成                                           |
| `GET`    | `/api/links`                      | session                 | 一覧                                                 |
| `PATCH`  | `/api/links/:slug`                | session                 | URL / UTM 編集                                       |
| `DELETE` | `/api/links/:slug`                | session                 | 削除                                                 |
| `GET`    | `/api/links/:slug/stats?range=7d` | session                 | AE から集計取得                                      |

## D1 スキーマ

`apps/api/migrations/0001_init.sql` 参照。

- `links`：slug, url, created*at, clicks, utm*\*, expires_at, password_hash
- `passkeys`：credential_id, public_key, counter, transports, label, created_at, last_used_at

## ライセンス

MIT
