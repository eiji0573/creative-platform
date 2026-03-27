import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MarkdownEditor from '@/components/editor/MarkdownEditor'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default async function EditArticlePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers: HeadersInit = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const res = await fetch(`${API_BASE}/articles/${id}`, { headers })
  if (!res.ok) {
    notFound()
  }

  const article = await res.json()

  return (
    <MarkdownEditor
      articleId={id}
      accessToken={session?.access_token}
      initialData={{
        title: article.title,
        content: article.content,
        tags: article.tags?.map((t: { name: string }) => t.name) ?? [],
        thumbnailUrl: article.thumbnail_url ?? null,
        status: article.status,
      }}
    />
  )
}
