import { notFound } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Article {
  id: string
  title: string
  created_at: string
  user_id: string
}

interface SeriesArticle {
  position: number
  articles: Article
}

interface Series {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  articles: SeriesArticle[]
}

async function getSeries(id: string): Promise<Series | null> {
  try {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function SeriesDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const series = await getSeries(id)

  if (!series) notFound()

  const formattedDate = new Date(series.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            CreativePlatform
          </Link>
          <Link href={`/users/${series.user_id}`} className="text-sm text-gray-500 hover:text-gray-700">
            作成者のプロフィール
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-2">Series</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{series.title}</h1>
          {series.description && (
            <p className="text-gray-600 leading-relaxed mb-3">{series.description}</p>
          )}
          <time className="text-sm text-gray-400">{formattedDate}</time>
        </div>

        <div className="space-y-3">
          {series.articles.length === 0 ? (
            <p className="text-gray-500 text-sm">まだ記事が追加されていません。</p>
          ) : (
            series.articles.map(({ position, articles: article }) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                  {position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(article.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <span className="text-gray-300 flex-shrink-0">&#8594;</span>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
