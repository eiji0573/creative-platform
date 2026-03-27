'use client'

import Image from 'next/image'
import Link from 'next/link'

export type UserProfileData = {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type ArticleCard = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  author_id: string
}

type Props = {
  profile: UserProfileData
  articles: ArticleCard[]
  isOwner: boolean
}

export default function UserProfile({ profile, articles, isOwner }: Props) {
  const displayName = profile.display_name ?? '名無しユーザー'
  const avatarUrl = profile.avatar_url

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* プロフィールヘッダー */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={96}
              height={96}
              className="rounded-full object-cover w-24 h-24"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-500 dark:text-zinc-400">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {displayName}
            </h1>
            {isOwner && (
              <Link
                href="/settings"
                className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                プロフィール編集
              </Link>
            )}
          </div>
          {profile.bio && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* 記事一覧 */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          投稿記事 ({articles.length})
        </h2>

        {articles.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400 text-center py-12">
            まだ記事がありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {article.cover_image_url ? (
                  <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={article.cover_image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
                )}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-auto">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('ja-JP')
                      : new Date(article.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
