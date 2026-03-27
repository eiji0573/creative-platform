'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function NewSeriesPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/login')
      return
    }

    const res = await fetch(`${API_BASE}/series`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
      }),
    })

    if (!res.ok) {
      setError('シリーズの作成に失敗しました')
      setIsSubmitting(false)
      return
    }

    const series = await res.json()
    router.push(`/series/${series.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            CreativePlatform
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">シリーズを作成</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="シリーズのタイトル"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="シリーズの説明（任意）"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '作成中...' : 'シリーズを作成'}
          </button>
        </form>
      </main>
    </div>
  )
}
