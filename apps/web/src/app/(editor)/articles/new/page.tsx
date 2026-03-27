import { createClient } from '@/lib/supabase/server'
import MarkdownEditor from '@/components/editor/MarkdownEditor'

export default async function NewArticlePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <MarkdownEditor accessToken={session?.access_token} />
  )
}
