import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ShowcaseWork {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string
  created_at: string
  updated_at: string
}

async function getShowcaseWork(id: string): Promise<ShowcaseWork | null> {
  try {
    const res = await fetch(`${API_BASE}/showcase/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ShowcaseDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const work = await getShowcaseWork(id)

  if (!work) {
    notFound()
  }

  const author = await getUserProfile(work.user_id)

  const authorName = author?.display_name ?? author?.username ?? '不明'
  const isOwner = session?.user?.id === work.user_id
  const formattedDate = new Date(work.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            CreativePlatform
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/showcase" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              作品一覧
            </Link>
            {isOwner && (
              <Link
                href={`/showcase/new`}
                className="px-4 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                新規投稿
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Work Detail */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={work.image_url}
          alt={work.title}
          className="w-full aspect-video object-cover rounded-xl mb-8 shadow-sm"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-4">{work.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          {/* Author */}
          <Link
            href={`/users/${work.user_id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatar_url}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-sm font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{authorName}</span>
          </Link>

          <span className="text-gray-300">&#8226;</span>

          {/* Date */}
          <time className="text-sm text-gray-500">{formattedDate}</time>
        </div>

        {/* Description */}
        {work.description && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{work.description}</p>
          </div>
        )}

        {/* Portfolio Link */}
        {author && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link
              href={`/users/${work.user_id}/portfolio`}
              className="inline-flex items-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
            >
              {authorName} の他の作品を見る
              <span aria-hidden="true">&#8594;</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
