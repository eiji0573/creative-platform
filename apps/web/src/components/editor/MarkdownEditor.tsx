'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface ArticleFormData {
  title: string
  content: string
  tags: string[]
  thumbnailUrl: string | null
  status: 'draft' | 'published'
}

interface MarkdownEditorProps {
  initialData?: Partial<ArticleFormData>
  articleId?: string
  /** Supabase JWT for Authorization header */
  accessToken?: string
}

export default function MarkdownEditor({
  initialData,
  articleId,
  accessToken,
}: MarkdownEditorProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    initialData?.thumbnailUrl ?? null
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---- Tag handling ----
  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.length >= 5) {
      setError('タグは最大5件まで追加できます')
      return
    }
    if (tags.includes(trimmed)) {
      setTagInput('')
      return
    }
    setTags((prev) => [...prev, trimmed])
    setTagInput('')
    setError(null)
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // ---- Thumbnail upload ----
  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const headers: HeadersInit = {}
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!res.ok) {
        throw new Error('画像のアップロードに失敗しました')
      }

      const data = await res.json()
      setThumbnailUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  // ---- Save / Publish ----
  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const body = JSON.stringify({
        title: title.trim(),
        content,
        tags,
        thumbnail_url: thumbnailUrl,
        status,
      })

      const url = articleId
        ? `${API_BASE}/articles/${articleId}`
        : `${API_BASE}/articles`
      const method = articleId ? 'PATCH' : 'POST'

      const res = await fetch(url, { method, headers, body })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message ?? '保存に失敗しました')
      }

      const saved = await res.json()
      router.push(`/articles/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header toolbar */}
      <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          &larr; 戻る
        </button>
        <span className="flex-1" />
        {error && (
          <p className="text-red-500 text-sm truncate max-w-xs">{error}</p>
        )}
        <button
          disabled={saving || uploading}
          onClick={() => handleSave('draft')}
          className="px-4 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          下書き保存
        </button>
        <button
          disabled={saving || uploading}
          onClick={() => handleSave('published')}
          className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          公開する
        </button>
      </header>

      {/* Title */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事タイトルを入力..."
          className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none"
        />
      </div>

      {/* Meta: tags + thumbnail */}
      <div className="flex items-start gap-6 px-6 py-3 bg-white border-b border-gray-100 shrink-0">
        {/* Tags */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            タグ（最大5件、Enterで追加）
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-indigo-900 leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder="タグを追加..."
                className="text-sm outline-none placeholder-gray-400 min-w-[120px]"
              />
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="shrink-0">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            サムネイル
          </label>
          <div className="flex items-center gap-3">
            {thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt="サムネイル"
                className="w-16 h-10 object-cover rounded border border-gray-200"
              />
            )}
            <button
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? 'アップロード中...' : '画像を選択'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>
        </div>
      </div>

      {/* Split pane: editor | preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: editor */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-400 border-b border-gray-200">
            Markdown
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="本文をMarkdownで入力..."
            className="flex-1 p-4 resize-none outline-none font-mono text-sm text-gray-800 bg-white"
            spellCheck={false}
          />
        </div>

        {/* Right: preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-400 border-b border-gray-200">
            プレビュー
          </div>
          <div className="flex-1 p-6 overflow-y-auto markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*本文を入力するとプレビューが表示されます*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
