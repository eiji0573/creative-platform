# 要件定義書

## プロジェクト概要

**プロダクト名**: （未定）
**種別**: デザイナー・クリエイター向け記事投稿プラットフォーム
**目的**: デザインやクリエイティブな知見を共有・発信できる場を提供する
**ビジネスモデル**: スモールスタート、将来的な商用化を想定

---

## ターゲットユーザー

- デザイナー（UI/UX、グラフィック、プロダクトなど）
- イラストレーター・クリエイター
- デザインに関心のあるエンジニア・ディレクター

---

## 差別化ポイント


| 特徴         | 概要                            |
| ---------- | ----------------------------- |
| ビジュアルファースト | サムネイル必須、Pinterestライクなカードレイアウト |
| 作品ショーケース   | 記事とは別にポートフォリオとして作品を掲載できる      |
| 画像への直接コメント | デザイン批評・フィードバックを画像上に直接付けられる    |


---

## 機能一覧

### Phase 1（MVP）

- 記事投稿・編集（Markdownエディタ、ライブプレビュー）
- 画像アップロード（記事内埋め込み）
- タグ・カテゴリ分類
- ユーザー登録・ログイン（Google OAuth）

### Phase 2

- いいね機能
- コメント機能
- ユーザーフォロー
- サムネイル必須のカードレイアウト（トップページ）

### Phase 3

- 作品ショーケース（ポートフォリオページ）
- 画像への直接コメント（デザイン批評機能）

### Phase 4

- シリーズ・本機能（複数記事をまとめる）
- 組織・チーム機能

---

## 機能要件

### 認証・ユーザー管理

| # | 機能 | 詳細 |
|---|------|------|
| U-1 | ユーザー登録 | Google OAuthまたはメールアドレスで登録できる |
| U-2 | ログイン・ログアウト | セッション管理はSupabase Authに委譲する |
| U-3 | プロフィール編集 | 表示名、アイコン画像、自己紹介文を設定できる |
| U-4 | マイページ | 自分の投稿記事・作品一覧を確認できる |

### 記事

| # | 機能 | 詳細 |
|---|------|------|
| A-1 | 記事作成 | Markdownエディタでリアルタイムプレビューしながら執筆できる |
| A-2 | 記事編集 | 投稿済み記事を後から編集できる |
| A-3 | 記事削除 | 自分の記事を削除できる |
| A-4 | 下書き保存 | 公開前に下書きとして保存できる |
| A-5 | 画像アップロード | 記事内に画像を埋め込める（Supabase Storage使用） |
| A-6 | サムネイル設定 | 記事一覧に表示するサムネイル画像を設定できる（必須） |
| A-7 | タグ付け | 記事に複数のタグを付けられる（最大5件） |
| A-8 | 記事詳細表示 | MarkdownをHTMLにレンダリングして表示する |
| A-9 | 記事一覧表示 | カードレイアウトで全記事を表示する |

### ソーシャル（Phase 2以降）

| # | 機能 | 詳細 |
|---|------|------|
| S-1 | いいね | 記事にいいねができる（1ユーザー1回） |
| S-2 | コメント | 記事にテキストコメントを投稿できる |
| S-3 | フォロー | 他のユーザーをフォローできる |
| S-4 | フォローフィード | フォローしたユーザーの記事を一覧表示できる |

### ショーケース（Phase 3以降）

| # | 機能 | 詳細 |
|---|------|------|
| SC-1 | 作品投稿 | 画像・タイトル・説明文で作品を投稿できる |
| SC-2 | ポートフォリオページ | ユーザーごとの作品一覧ページを持てる |
| SC-3 | 画像への直接コメント | 作品画像上の任意の座標にコメントを付けられる |

---

## 画面構成

```
/                        トップページ（記事カード一覧）
/articles/[id]           記事詳細
/articles/new            記事作成
/articles/[id]/edit      記事編集
/tags/[tag]              タグ別記事一覧
/users/[id]              ユーザープロフィール・投稿一覧
/users/[id]/portfolio    ポートフォリオ（Phase 3）
/showcase/[id]           作品詳細（Phase 3）
/settings                アカウント設定
/login                   ログインページ
```

---

## データベース設計

### users（Supabase Authと連携）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK（Supabase Auth UIDと同値） |
| display_name | text | 表示名 |
| avatar_url | text | アイコン画像URL |
| bio | text | 自己紹介文 |
| created_at | timestamp | 登録日時 |

### articles

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| title | text | 記事タイトル |
| body | text | 本文（Markdown） |
| thumbnail_url | text | サムネイル画像URL |
| status | enum | `draft` / `published` |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### tags

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| name | text | タグ名（ユニーク） |

### article_tags

| カラム | 型 | 説明 |
|--------|-----|------|
| article_id | uuid | FK → articles.id |
| tag_id | uuid | FK → tags.id |

### likes（Phase 2）

| カラム | 型 | 説明 |
|--------|-----|------|
| user_id | uuid | FK → users.id |
| article_id | uuid | FK → articles.id |
| created_at | timestamp | いいね日時 |

### comments（Phase 2）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| article_id | uuid | FK → articles.id |
| body | text | コメント本文 |
| created_at | timestamp | 投稿日時 |

### follows（Phase 2）

| カラム | 型 | 説明 |
|--------|-----|------|
| follower_id | uuid | FK → users.id（フォローする側） |
| followee_id | uuid | FK → users.id（フォローされる側） |
| created_at | timestamp | フォロー日時 |

### showcase_works（Phase 3）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| title | text | 作品タイトル |
| description | text | 説明文 |
| image_url | text | 作品画像URL |
| created_at | timestamp | 投稿日時 |

### image_comments（Phase 3）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| work_id | uuid | FK → showcase_works.id |
| user_id | uuid | FK → users.id |
| body | text | コメント本文 |
| pos_x | float | 画像上のX座標（%） |
| pos_y | float | 画像上のY座標（%） |
| created_at | timestamp | 投稿日時 |

---

## スコープ対象外

以下はこのプロジェクトのスコープ外とする。

| 項目 | 理由 |
|------|------|
| 決済・有料コンテンツ | Phase 4以降で別途検討 |
| 通知機能（メール・プッシュ） | MVP後に優先度を判断 |
| 検索機能（全文検索） | 初期は全件表示・タグ絞り込みで対応 |
| モバイルアプリ（iOS/Android） | Webのみで展開 |
| 多言語対応 | 日本語のみ |
| Figma・Canva埋め込み | 技術調査後に判断 |
| DM・メッセージ機能 | コミュニティ規模が大きくなってから検討 |
| アナリティクス・PVカウント | Phase 2以降で検討 |

---

## 技術スタック


| 役割      | 技術                                |
| ------- | --------------------------------- |
| フロントエンド | Next.js (TypeScript)              |
| バックエンド  | NestJS (TypeScript)               |
| データベース  | PostgreSQL（Supabase）              |
| 認証      | Supabase Auth（Google OAuth、メール認証） |
| 画像ストレージ | Supabase Storage                  |
| ホスティング  | セルフホスト（Docker、OSS）                |


---

## 非機能要件


| 項目      | 内容                |
| ------- | ----------------- |
| スケール    | 個人〜数百人規模          |
| 決済      | MVP段階では不要（将来的に検討） |
| 有料コンテンツ | Phase 4以降で検討      |


---

## 開発フロー

- **AIロール**: コード生成はGemini、レビュー・最終判断はClaude
- **ブランチ戦略**: `feature/phase{番号}-{内容}` 単位で開発、mainへPRマージ
- **MVP**: 記事投稿・編集が動く状態を最初のリリース目標とする

