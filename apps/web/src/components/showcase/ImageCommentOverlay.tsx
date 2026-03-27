'use client'

import { useState, useTransition, useRef, useCallback } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ImageCommentAuthor {
  display_name: string | null
  avatar_url: string | null
}

interface ImageComment {
  id: string
  body: string
  pos_x: number
  pos_y: number
  created_at: string
  user_id: string
  users: ImageCommentAuthor | null
}

interface Props {
  workId: string
  imageUrl: string
  imageAlt: string
  initialComments: ImageComment[]
  currentUserId?: string
  accessToken?: string
}

interface PendingPin {
  posX: number
  posY: number
}

export default function ImageCommentOverlay({
  workId,
  imageUrl,
  imageAlt,
  initialComments,
  currentUserId,
  accessToken,
}: Props) {
  const [comments, setComments] = useState<ImageComment[]>(initialComments)
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null)
  const [newBody, setNewBody] = useState('')
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // ピンやポップアップへのクリックは無視
      if ((e.target as HTMLElement).closest('[data-pin]')) return
      if (!accessToken) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const posX = ((e.clientX - rect.left) / rect.width) * 100
      const posY = ((e.clientY - rect.top) / rect.height) * 100

      setPendingPin({ posX, posY })
      setNewBody('')
      setError(null)
      setActiveCommentId(null)
    },
    [accessToken],
  )

  const handleCancelPin = () => {
    setPendingPin(null)
    setNewBody('')
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBody.trim() || !pendingPin || !accessToken) return

    setError(null)
    startTransition(async () => {
      const res = await fetch(`${API_BASE}/showcase/${workId}/image-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          body: newBody.trim(),
          pos_x: pendingPin.posX,
          pos_y: pendingPin.posY,
        }),
      })

      if (!res.ok) {
        setError('コメントの投稿に失敗しました')
        return
      }

      const newComment: ImageComment = await res.json()
      setComments((prev) => [...prev, newComment])
      setPendingPin(null)
      setNewBody('')
    })
  }

  const handleDelete = async (commentId: string) => {
    if (!accessToken) return

    const res = await fetch(
      `${API_BASE}/showcase/${workId}/image-comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      if (activeCommentId === commentId) setActiveCommentId(null)
    }
  }

  const handlePinClick = (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation()
    setActiveCommentId((prev) => (prev === commentId ? null : commentId))
    setPendingPin(null)
  }

  return (
    <div className="mb-8">
      {/* Image container with overlay */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-video rounded-xl overflow-hidden shadow-sm select-none ${
          accessToken ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleImageClick}
        role="img"
        aria-label={imageAlt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Existing comment pins */}
        {comments.map((comment) => {
          const authorName = comment.users?.display_name ?? '不明'
          const isActive = activeCommentId === comment.id
          const isOwner = currentUserId === comment.user_id

          return (
            <div
              key={comment.id}
              data-pin="true"
              className="absolute"
              style={{
                left: `${comment.pos_x}%`,
                top: `${comment.pos_y}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {/* Pin button */}
              <button
                onClick={(e) => handlePinClick(e, comment.id)}
                className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                aria-label="コメントを表示"
              >
                &#x1F4AC;
              </button>

              {/* Tooltip */}
              {isActive && (
                <div
                  className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {authorName}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <time className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                      </time>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors ml-1"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                    {comment.body}
                  </p>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white" />
                </div>
              )}
            </div>
          )
        })}

        {/* Pending pin (new comment position) */}
        {pendingPin && (
          <div
            data-pin="true"
            className="absolute"
            style={{
              left: `${pendingPin.posX}%`,
              top: `${pendingPin.posY}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {/* Pending pin marker */}
            <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
              +
            </div>

            {/* Comment input popup */}
            <div
              className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-medium text-gray-700 mb-2">
                この場所にコメントする
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="コメントを入力..."
                  rows={2}
                  maxLength={500}
                  autoFocus
                  className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelPin}
                    className="px-2.5 py-1 rounded-md text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !newBody.trim()}
                    className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? '投稿中...' : '投稿'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Hint text */}
      <p className="mt-2 text-xs text-gray-400 text-right">
        {accessToken ? (
          <>画像をクリックしてコメントを追加 &bull; コメント: {comments.length}件</>
        ) : (
          <>コメント: {comments.length}件 &bull; ログインすると画像にコメントできます</>
        )}
      </p>
    </div>
  )
}
