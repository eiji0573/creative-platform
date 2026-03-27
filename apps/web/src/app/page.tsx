import Link from 'next/link'
import ArticleCard, { type ArticleSummary } from '@/components/article/ArticleCard'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getArticles(): Promise<ArticleSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/articles`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    // API may return { data: [...] } or directly an array
    return Array.isArray(data) ? data : (data.data ?? [])
  } catch {
    return []
  }
}

export default async function HomePage() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            CreativePlatform
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/articles/new"
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              記事を書く
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">最新の記事</h1>

        {articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">&#128196;</p>
            <p className="text-lg font-medium">まだ記事がありません</p>
            <p className="text-sm mt-2">最初の記事を投稿してみましょう</p>
            <Link
              href="/articles/new"
              className="inline-block mt-6 px-6 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              記事を書く
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="break-inside-avoid">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
