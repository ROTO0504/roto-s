# CLAUDE.md — roto-s

このファイルは Claude / AI 開発支援ツール向けのプロジェクト固有ガイド。
ユーザー向けの解説は [README.md](README.md) を参照。

## プロジェクト概要

- Cloudflare Workers + D1 + Hono の URL 短縮サービス + Vite/React/Panda CSS の管理画面 SPA
- モノレポ: [apps/api](apps/api) (Worker) と [apps/admin](apps/admin) (SPA)
- 1 Worker に SPA を Workers Assets として同梱配信
- 認証: WebAuthn / Passkey (`@simplewebauthn/server`)

## 開発コマンド

```bash
bun install
bun run dev              # api (8787) + admin (5173) を並列起動
bun run typecheck        # 全 workspace の tsc
bun run lint             # eslint
bun run format           # prettier --write
bun run format:check     # prettier --check
bun run test             # vitest (api + admin)
bun run build:admin      # admin SPA を panda codegen + vite build
bun run deploy           # build:admin → wrangler deploy
```

## コード規約

- TypeScript 厳格 (`strict: true`)。`any` 禁止
- arrow function + named export（default export 禁止）
- `type` を `interface` より優先
- コメントは原則書かない（自明でない処理のみ）
- 文字列は double quote、セミコロンなし、trailingComma all（Prettier 設定）

## API (apps/api)

- 入力検証は **必ず Zod**（[apps/api/src/lib/validate.ts](apps/api/src/lib/validate.ts)）
- エラー応答は `{ error: { code, message_ja, message_en } }` 形式（[apps/api/src/lib/errors.ts](apps/api/src/lib/errors.ts)）
- AE の `writeDataPoint` は try/catch で囲み、失敗してもリダイレクトを止めない
- セッション Cookie は `SameSite=Strict; HttpOnly; Secure`
- 期限切れリンクは `410 Gone`（404 ではない）

## 管理画面 (apps/admin)

- 文言は日本語
- スタイリングは **Panda CSS の recipe を優先**。`css()` 直書きは細かい配置調整のみ
- 削除確認は **必ず ConfirmDialog**（[apps/admin/src/components/ConfirmDialog.tsx](apps/admin/src/components/ConfirmDialog.tsx)）。`window.confirm` 禁止
- トーストは **必ず useToast()**（[apps/admin/src/components/ToastProvider.tsx](apps/admin/src/components/ToastProvider.tsx)）
- ローダーで Promise が reject したら React Router の `errorElement` で表示。各 loader 内で try/catch しない（401 は `lib/api.ts` がグローバルに redirect）

## テスト

- API: [apps/api/test/](apps/api/test/) に `*.test.ts`。`@cloudflare/vitest-pool-workers` で Workers 環境
- Admin: [apps/admin/test/](apps/admin/test/) に `*.test.tsx`。`@testing-library/react` + jsdom

## 触らない

- `.env`（root） — Phase 3 以降で対応
- D1 スキーマ ([apps/api/migrations/](apps/api/migrations/)) — Phase 3 以降
- パスワード保護リンク機能（`password_hash` カラム） — Phase 3 以降
