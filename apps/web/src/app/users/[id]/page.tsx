import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserProfile, { UserProfileData, ArticleCard } from '@/components/user/UserProfile'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getUser(id: string): Promise<UserProfileData | null> {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getUserArticles(id: string): Promise<ArticleCard[]> {
  try {
    const res = await fetch(`${API_URL}/users/${id}/articles`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profile, articles] = await Promise.all([
    getUser(id),
    getUserArticles(id),
  ])

  if (!profile) {
    notFound()
  }

  // ログインユーザーを確認して isOwner を判定
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === profile.id

  return <UserProfile profile={profile} articles={articles} isOwner={isOwner} />
}
