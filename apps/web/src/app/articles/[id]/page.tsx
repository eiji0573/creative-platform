import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ArticleContent from '@/components/article/ArticleContent'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Tag {
  id: string
  name: string
}

interface Author {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface Article {
  id: string
  title: string
  content: string
  thumbnail_url: string | null
  status: 'draft' | 'published'
  tags: Tag[]
  author: Author
  author_id: string
  created_at: string
  updated_at: string
}

async function getArticle(id: string, accessToken?: string): Promise<Article | null> {
  try {
    const headers: HeadersInit = {}
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      headers,
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ArticleDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const article = await getArticle(id, session?.access_token)

  if (!article) {
    notFound()
  }

  const authorName = article.author?.display_name ?? article.author?.username ?? '不明'
  const isOwner = session?.user?.id === article.author_id
  const formattedDate = new Date(article.created_at).toLocaleDateString('ja-JP', {
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
          {isOwner && (
            <Link
              href={`/articles/${article.id}/edit`}
              className="px-4 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              編集する
            </Link>
          )}
        </div>
      </header>

      {/* Article */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Thumbnail */}
        {article.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail_url}
            alt={article.title}
            className="w-full aspect-video object-cover rounded-xl mb-8 shadow-sm"
          />
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          {/* Author */}
          <div className="flex items-center gap-2">
            {article.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.author.avatar_url}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-sm font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{authorName}</span>
          </div>

          <span className="text-gray-300">&#8226;</span>

          {/* Date */}
          <time className="text-sm text-gray-500">{formattedDate}</time>

          {/* Draft badge */}
          {article.status === 'draft' && (
            <>
              <span className="text-gray-300">&#8226;</span>
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                下書き
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <ArticleContent content={article.content} />
      </main>
    </div>
  )
}
