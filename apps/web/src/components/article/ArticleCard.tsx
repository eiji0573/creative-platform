import Link from 'next/link'

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

export interface ArticleSummary {
  id: string
  title: string
  thumbnail_url: string | null
  status: 'draft' | 'published'
  tags: Tag[]
  author: Author
  created_at: string
}

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  const authorName = article.author?.display_name ?? article.author?.username ?? '不明'

  return (
    <Link href={`/articles/${article.id}`} className="group block">
      <article className="rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
          {article.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl select-none">
              &#128196;
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
            {article.title}
          </h2>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium"
                >
                  {tag.name}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{article.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-2 mt-auto">
            {article.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.author.avatar_url}
                alt={authorName}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-gray-500 truncate">{authorName}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
