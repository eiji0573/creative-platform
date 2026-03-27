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

async function getFollowStatus(
  userId: string,
  accessToken?: string,
): Promise<{ followers_count: number; following_count: number; is_following: boolean }> {
  try {
    const headers: Record<string, string> = {}
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    const res = await fetch(`${API_URL}/users/${userId}/follow-status`, {
      cache: 'no-store',
      headers,
    })
    if (!res.ok) return { followers_count: 0, following_count: 0, is_following: false }
    return res.json()
  } catch {
    return { followers_count: 0, following_count: 0, is_following: false }
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const [profile, articles, followStatus] = await Promise.all([
    getUser(id),
    getUserArticles(id),
    getFollowStatus(id, session?.access_token),
  ])

  if (!profile) {
    notFound()
  }

  const isOwner = session?.user?.id === profile.id

  return (
    <UserProfile
      profile={profile}
      articles={articles}
      isOwner={isOwner}
      followStatus={followStatus}
      currentUserId={session?.user?.id}
      accessToken={session?.access_token}
    />
  )
}
