'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfileData } from '@/components/user/UserProfile'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type Props = {
  profile: UserProfileData
}

export default function ProfileForm({ profile }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsUploading(true)

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('認証情報が取得できません。再ログインしてください。')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? '画像のアップロードに失敗しました。')
        return
      }

      const data = await res.json()
      const uploadedUrl: string = data.url ?? data.publicUrl ?? data.path ?? ''
      setAvatarUrl(uploadedUrl)
      setAvatarPreview(uploadedUrl)
    } catch {
      setError('画像のアップロード中にエラーが発生しました。')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          setError('認証情報が取得できません。再ログインしてください。')
          return
        }

        const body: Record<string, string> = {}
        if (displayName !== (profile.display_name ?? '')) body.display_name = displayName
        if (bio !== (profile.bio ?? '')) body.bio = bio
        if (avatarUrl !== (profile.avatar_url ?? '')) body.avatar_url = avatarUrl

        const res = await fetch(`${API_URL}/users/${profile.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.message ?? 'プロフィールの更新に失敗しました。')
          return
        }

        setSuccess(true)
        router.refresh()
      } catch {
        setError('プロフィールの更新中にエラーが発生しました。')
      }
    })
  }

  const isBusy = isPending || isUploading

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* アバター */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          アバター画像
        </label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="アバタープレビュー"
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-500 dark:text-zinc-400">
                {(displayName || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'アップロード中...' : '画像を変更'}
            </button>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              JPG, PNG, GIF, WebP / 最大5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 表示名 */}
      <div>
        <label
          htmlFor="display_name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          表示名
        </label>
        <input
          id="display_name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          placeholder="表示名を入力"
          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* 自己紹介 */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          自己紹介
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="自己紹介を入力（最大500文字）"
          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
        />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-right mt-1">
          {bio.length}/500
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
          プロフィールを更新しました。
        </p>
      )}

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isBusy}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '保存中...' : '変更を保存'}
        </button>
      </div>
    </form>
  )
}
