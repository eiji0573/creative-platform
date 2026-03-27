'use client'

import { useState, useTransition } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Props {
  articleId: string
  initialCount: number
  initialLiked: boolean
  /** 未ログインの場合は undefined */
  accessToken?: string
}

export default function LikeButton({ articleId, initialCount, initialLiked, accessToken }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    if (!accessToken) {
      window.location.href = '/login'
      return
    }

    startTransition(async () => {
      const method = liked ? 'DELETE' : 'POST'
      const res = await fetch(`${API_BASE}/articles/${articleId}/likes`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (res.ok) {
        const data: { count: number; liked: boolean } = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={liked ? 'いいねを解除' : 'いいねする'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
        liked
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      <span className="text-base">{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
