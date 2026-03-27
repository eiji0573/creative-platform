'use client'

import { useState, useTransition } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface CommentAuthor {
  display_name: string | null
  avatar_url: string | null
}

interface Comment {
  id: string
  body: string
  created_at: string
  user_id: string
  users: CommentAuthor | null
}

interface CommentsSectionProps {
  articleId: string
  initialComments: Comment[]
  currentUserId?: string
  accessToken?: string
}

export default function CommentsSection({
  articleId,
  initialComments,
  currentUserId,
  accessToken,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !accessToken) return

    setError(null)
    startTransition(async () => {
      const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ body: body.trim() }),
      })

      if (!res.ok) {
        setError('コメントの投稿に失敗しました')
        return
      }

      const newComment: Comment = await res.json()
      setComments((prev) => [...prev, newComment])
      setBody('')
    })
  }

  async function handleDelete(commentId: string) {
    if (!accessToken) return

    const res = await fetch(
      `${API_BASE}/articles/${articleId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        コメント ({comments.length})
      </h2>

      {/* Comment list */}
      <div className="space-y-4 mb-8">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">まだコメントはありません</p>
        )}
        {comments.map((comment) => {
          const authorName = comment.users?.display_name ?? '不明'
          const isOwner = currentUserId === comment.user_id
          return (
            <div
              key={comment.id}
              className="flex gap-3 p-4 rounded-lg bg-gray-50"
            >
              {comment.users?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.users.avatar_url}
                  alt={authorName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {authorName}
                  </span>
                  <div className="flex items-center gap-2">
                    <time className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                    </time>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Post form */}
      {accessToken ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="コメントを書く..."
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? '投稿中...' : 'コメントする'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          コメントするには
          <a href="/auth/login" className="text-indigo-600 hover:underline mx-1">
            ログイン
          </a>
          してください
        </p>
      )}
    </section>
  )
}
