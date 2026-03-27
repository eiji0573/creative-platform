# 進捗管理（マルチエージェント協調）

> このファイルは複数のClaudeCodeインスタンスが共有する進捗管理ファイルです。
> 作業開始時にチケットをクレームし、完了時にステータスを更新してください。

## インスタンス一覧

| 識別子    | 役割                              |
| -------- | --------------------------------- |
| Claude-L | **リーダー**：全体進捗・コスト・品質統制。不明点はここへ |
| Claude-A | 開発：SETUP-01担当                    |
| Claude-B | 開発：SETUP-02担当                    |
| Claude-C | 開発：Stream C担当（予定）                |
| Claude-D | 開発：SETUP-03・Phase 2担当（予定）        |

## ステータス凡例
- `[ ]` 未着手
- `[WIP:A]` Claude-A が作業中
- `[WIP:B]` Claude-B が作業中
- `[WIP:C]` Claude-C が作業中
- `[WIP:D]` Claude-D が作業中
- `[WIP:L]` Claude-L（リーダー）が対応中
- `[DONE]` 完了

---

## ステップ0：基盤

| ID         | 内容                          | ステータス   | 担当        |
| ---------- | --------------------------- | ------- | --------- |
| SETUP-01   | プロジェクト初期化（Next.js + NestJS） | [DONE]  | Claude-A  |
| SETUP-02   | Supabase設定（DB・Auth・Storage） | [DONE]  | Claude-B  |
| SETUP-03   | DBマイグレーション                  | [DONE]  | Claude-A  |

---

## ステップ1：Phase 1 MVP

### Stream A｜認証
| ID    | 内容                           | ステータス | 担当       |
| ----- | ---------------------------- | ----- | -------- |
| BE-01 | 認証API（Supabase Auth連携・JWT検証） | [WIP:A] | Claude-A |
| FE-01 | 認証UI（ログインページ・Google OAuth）   | [DONE]  | ClaudeCode-1 |

### Stream B｜記事
| ID    | 内容                            | ステータス | 担当 |
| ----- | ----------------------------- | ----- | -- |
| BE-03 | 記事API（CRUD・下書き/公開切り替え）        | [DONE] | Claude-B |
| BE-04 | タグAPI（一覧・記事へのタグ付け）            | [DONE] | Claude-C |
| BE-05 | 画像アップロードAPI（Supabase Storage） | [DONE] | Claude-C |
| FE-02 | Markdownエディタ（ライブプレビュー・タグ入力）  | [DONE] | ClaudeCode-2 |
| FE-03 | 記事一覧ページ（カードレイアウト）             | [DONE] | ClaudeCode-2 |
| FE-04 | 記事詳細ページ（Markdownレンダリング）       | [DONE] | ClaudeCode-2 |

### Stream C｜ユーザー
| ID    | 内容                   | ステータス | 担当 |
| ----- | -------------------- | ----- | -- |
| BE-02 | ユーザーAPI（プロフィール取得・更新） | [DONE] | Claude-D |
| FE-05 | ユーザープロフィールページ・マイページ  | [DONE] | ClaudeCode-4 |
| FE-06 | アカウント設定ページ           | [DONE] | ClaudeCode-4 |

---

## ステップ2：Phase 2

| ID    | 内容                    | ステータス | 担当 |
| ----- | --------------------- | ----- | -- |
| P2-01 | いいね機能（BE + FE）        | [ ]   | -  |
| P2-02 | コメント機能（BE + FE）       | [ ]   | -  |
| P2-03 | フォロー/フォロワー機能（BE + FE） | [ ]   | -  |
| P2-04 | フォローフィード（BE + FE）     | [ ]   | -  |

---

## ステップ3：Phase 3

| ID    | 内容                  | ステータス | 担当 |
| ----- | ------------------- | ----- | -- |
| P3-01 | 作品投稿・ショーケースAPI（BE）  | [ ]   | -  |
| P3-02 | ポートフォリオページ（FE）      | [ ]   | -  |
| P3-03 | 画像直接コメント機能（BE + FE） | [ ]   | -  |

---

## ステップ4：Phase 4

| ID    | 内容       | ステータス | 担当 |
| ----- | -------- | ----- | -- |
| P4-01 | シリーズ・本機能 | [ ]   | -  |
| P4-02 | 組織・チーム機能 | [ ]   | -  |

---

## ログ

| 日時                  | インスタンス | アクション                    |
| ------------------- | ------ | ------------------------ |
| 2026-03-26 (start)  | Claude-A | SETUP-01 作業開始             |
| 2026-03-26          | Claude-A | リーダー（Claude-L）追加を progress.md に反映 |
| 2026-03-26          | Claude-B | SETUP-02 作業開始（Supabase設定） |
| 2026-03-26          | Claude-B | SETUP-02 完了：supabase client/server/middleware + .env.example 作成 |
| 2026-03-26          | Claude-A | SETUP-01 完了：Next.js(apps/web) + NestJS(apps/api) + Docker + npm workspaces |
| 2026-03-26          | Claude-A | SETUP-03 作業開始（DBマイグレーション） |
| 2026-03-26          | Claude-A | SETUP-03 完了：Phase1全テーブル + RLS + トリガー + supabase/config.toml |
| 2026-03-26          | Claude-A | BE-01 作業開始（認証API） |
| 2026-03-26          | Claude-2 | BE-03/BE-04/BE-02/BE-05 不足ファイル補完完了：articles.module.ts, tags.module.ts, users.module.ts, users.controller.ts, upload/{module,controller,service}.ts 作成、app.module.ts に全モジュール登録 |
| 2026-03-26          | ClaudeCode-1 | FE-01 完了：(auth)/login/page.tsx, (auth)/signup/page.tsx, auth/callback/route.ts, actions/auth.ts, (auth)/layout.tsx 作成 |
| 2026-03-26          | ClaudeCode-4 | FE-05 作業開始（ユーザープロフィールページ） |
| 2026-03-26          | ClaudeCode-4 | FE-06 作業開始（アカウント設定ページ） |
| 2026-03-26          | ClaudeCode-4 | FE-05 完了：app/users/[id]/page.tsx, components/user/UserProfile.tsx 作成 |
| 2026-03-26          | ClaudeCode-4 | FE-06 完了：app/settings/page.tsx, components/settings/ProfileForm.tsx 作成 |
| 2026-03-26          | ClaudeCode-2 | FE-02 完了：MarkdownEditor（スプリットペイン・リアルタイムプレビュー・タグ・サムネイルアップロード） |
| 2026-03-26          | ClaudeCode-2 | FE-03 完了：トップページ記事一覧（Pinterestライク columns レイアウト）+ ArticleCard |
| 2026-03-26          | ClaudeCode-2 | FE-04 完了：記事詳細ページ（react-markdown + remark-gfm・オーナー編集ボタン）+ ArticleContent |
| 2026-03-27 | Claude-A | git初期化・Phase1コミット・feature/phase2-social ブランチ作成 |
