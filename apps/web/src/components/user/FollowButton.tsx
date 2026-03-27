'use client'

import { useState, useTransition } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type Props = {
  targetUserId: string
  initialIsFollowing: boolean
  initialFollowersCount: number
  accessToken: string
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
  accessToken,
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`${API_URL}/users/${targetUserId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.is_following)
        setFollowersCount(data.followers_count)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        フォロワー {followersCount}
      </span>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={
          isFollowing
            ? 'inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50'
            : 'inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50'
        }
      >
        {isPending ? '...' : isFollowing ? 'フォロー中' : 'フォロー'}
      </button>
    </div>
  )
}
