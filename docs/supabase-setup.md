# Supabase セットアップガイド

このドキュメントでは、Creative Platform で使用する Supabase プロジェクトのセットアップ手順を説明します。

---

## 1. Supabase プロジェクト作成

1. [https://supabase.com](https://supabase.com) にアクセスし、アカウントを作成またはログインする
2. ダッシュボードで **New project** をクリック
3. 以下を入力して **Create new project** をクリック：
   - **Name**: `creative-platform`（任意）
   - **Database Password**: 強力なパスワードを設定（後で `DATABASE_URL` に使用）
   - **Region**: `Northeast Asia (Tokyo)` 推奨
4. プロジェクト作成が完了するまで待機（約2分）

### 環境変数の取得

プロジェクト作成後、以下の画面から値を取得する：

- **Settings > API** を開く
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
  - `anon` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`（絶対にクライアントに露出させないこと）
- **Settings > API > JWT Settings** を開く
  - `JWT Secret` → `SUPABASE_JWT_SECRET` / `JWT_SECRET`
- **Settings > Database > Connection string > URI** を開く
  - URI をコピーして `DATABASE_URL` に設定（パスワード部分を置換）

取得した値を以下のファイルに設定する：

- `apps/web/.env.local`（Next.js フロントエンド用）
- `apps/api/.env`（NestJS バックエンド用）

---

## 2. Google OAuth 設定

### Google Cloud Console での設定

1. [https://console.cloud.google.com](https://console.cloud.google.com) を開く
2. プロジェクトを作成または選択する
3. **APIs & Services > Credentials** を開く
4. **Create Credentials > OAuth client ID** をクリック
5. 以下を設定：
   - **Application type**: `Web application`
   - **Authorized redirect URIs** に以下を追加：
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     （`your-project-ref` は Supabase の Project URL から取得）
6. **Client ID** と **Client Secret** をコピーしておく

### Supabase Dashboard での設定

1. Supabase ダッシュボード > **Authentication > Providers** を開く
2. **Google** を有効化（Enable をオン）
3. 以下を入力して保存：
   - **Client ID**: Google Cloud Console で取得した Client ID
   - **Client Secret**: Google Cloud Console で取得した Client Secret
4. **Redirect URL** に表示されている URL を Google Cloud Console の Authorized redirect URIs に設定済みであることを確認

### ローカル開発での追加設定

ローカル開発では、Google Cloud Console の Authorized redirect URIs に以下も追加する：

```
http://localhost:54321/auth/v1/callback
```

（Supabase CLI でローカル起動する場合）

---

## 3. Storage バケット設定

### `article-images` バケットの作成

1. Supabase ダッシュボード > **Storage** を開く
2. **New bucket** をクリック
3. 以下を設定：
   - **Name**: `article-images`
   - **Public bucket**: **オン**（記事画像は公開アクセス可能にする）
4. **Create bucket** をクリック

### Storage ポリシーの設定

バケット作成後、**Policies** タブでアクセス制御を設定する：

**SELECT（読み取り）ポリシー**

```sql
-- 公開バケットのため全員が読み取り可能
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');
```

**INSERT（アップロード）ポリシー**

```sql
-- 認証済みユーザーのみアップロード可能
-- フォルダ名はユーザーIDと一致すること（e.g., {user_id}/filename.jpg）
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**UPDATE / DELETE ポリシー**

```sql
-- 自分がアップロードしたファイルのみ更新・削除可能
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 4. RLS（Row Level Security）基本方針

すべてのテーブルで RLS を有効化する。以下の原則に従う：

### 基本原則

| 操作 | 方針 |
|------|------|
| SELECT | 公開記事は誰でも読める。下書きは本人のみ |
| INSERT | 認証済みユーザーのみ。`user_id = auth.uid()` を強制 |
| UPDATE | 本人（`user_id = auth.uid()`）のみ |
| DELETE | 本人（`user_id = auth.uid()`）のみ |

### RLS 有効化（全テーブル共通）

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 代表的なポリシーパターン

```sql
-- 公開記事の読み取り（誰でも可）
CREATE POLICY "Public read published articles"
ON articles FOR SELECT
USING (status = 'published');

-- 自分の記事は下書き含めて読める
CREATE POLICY "Authors can read own articles"
ON articles FOR SELECT
USING (user_id = auth.uid());

-- 認証済みユーザーが自分の記事を作成
CREATE POLICY "Authors can insert own articles"
ON articles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 自分の記事のみ更新・削除
CREATE POLICY "Authors can update own articles"
ON articles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Authors can delete own articles"
ON articles FOR DELETE
USING (user_id = auth.uid());
```

詳細なマイグレーション SQL は `apps/api/src/database/migrations/` を参照。

---

## 5. バックエンド（NestJS）での Supabase 設定

NestJS (`apps/api/`) では `@supabase/supabase-js` を直接使用する。

### 環境変数（`apps/api/.env`）

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret-here
```

### Supabase クライアント（Service Role）

バックエンドでは `service_role` キーを使用し、RLS をバイパスしてフル権限で操作する。
クライアントサイドに `service_role` キーを露出させてはいけない。

```typescript
// apps/api/src/supabase/supabase.service.ts（参考実装）
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private client: SupabaseClient

  constructor(private configService: ConfigService) {
    this.client = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  getClient(): SupabaseClient {
    return this.client
  }
}
```
