import { notFound } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ShowcaseWork {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string
  created_at: string
}

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getUserShowcaseWorks(userId: string): Promise<ShowcaseWork[]> {
  try {
    const res = await fetch(`${API_BASE}/showcase/users/${userId}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default async function UserPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profile, works] = await Promise.all([
    getUserProfile(id),
    getUserShowcaseWorks(id),
  ])

  if (!profile) {
    notFound()
  }

  const displayName = profile.display_name ?? profile.username

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            CreativePlatform
          </Link>
          <Link
            href="/showcase/new"
            className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            作品を投稿
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/users/${id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{displayName} のポートフォリオ</h1>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
          </Link>
        </div>

        {/* Works Count */}
        <p className="text-sm text-gray-500 mb-6">
          {works.length > 0 ? `${works.length} 件の作品` : '作品はまだありません'}
        </p>

        {/* Works Grid */}
        {works.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">&#128444;</p>
            <p className="text-lg font-medium">まだ作品がありません</p>
            <p className="text-sm mt-2">最初の作品を投稿してみましょう</p>
            <Link
              href="/showcase/new"
              className="inline-block mt-6 px-6 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              作品を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {works.map((work) => (
              <Link
                key={work.id}
                href={`/showcase/${work.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Work Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={work.image_url}
                  alt={work.title}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Work Title */}
                <div className="p-3">
                  <h2 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {work.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
