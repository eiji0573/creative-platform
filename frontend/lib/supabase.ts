/**
 * Supabase クライアント設定
 *
 * NOTE: このファイルはプロジェクトルート直下の frontend/ ディレクトリ用のテンプレートです。
 * 実際の Next.js アプリは apps/web/ にあります。
 * 本番コードは以下を参照してください：
 *   - ブラウザ用: apps/web/src/lib/supabase/client.ts
 *   - サーバー用: apps/web/src/lib/supabase/server.ts
 *   - ミドルウェア用: apps/web/src/middleware.ts
 *
 * 必要な環境変数（apps/web/.env.local に設定）：
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here（サーバーサイド専用）
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * ブラウザ（クライアントコンポーネント）用 Supabase クライアント
 *
 * 使用例：
 *   'use client'
 *   import { createBrowserSupabaseClient } from '@/lib/supabase'
 *   const supabase = createBrowserSupabaseClient()
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/**
 * サーバー（Server Components / Route Handlers / Server Actions）用 Supabase クライアント
 *
 * 使用例：
 *   import { createServerSupabaseClient } from '@/lib/supabase'
 *   const supabase = await createServerSupabaseClient()
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component から呼ばれた場合は無視
            // （セッション更新はミドルウェアが担当）
          }
        },
      },
    },
  )
}
