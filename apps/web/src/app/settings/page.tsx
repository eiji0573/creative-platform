import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/settings/ProfileForm'
import type { UserProfileData } from '@/components/user/UserProfile'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getUserProfile(
  userId: string,
  accessToken: string,
): Promise<UserProfileData | null> {
  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // 未ログインならリダイレクト（middleware でも保護しているが念のため）
  if (authError || !user) {
    redirect('/login')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const profile = await getUserProfile(user.id, session?.access_token ?? '')

  if (!profile) {
    // プロフィールが見つからない場合はトップへ
    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
        アカウント設定
      </h1>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-5">
          プロフィール編集
        </h2>
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
