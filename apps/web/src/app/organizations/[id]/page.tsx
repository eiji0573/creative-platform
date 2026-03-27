import { notFound } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Member {
  user_id: string
  role: string
  joined_at: string
}

interface Organization {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  created_at: string
  members: Member[]
}

async function getOrganization(id: string): Promise<Organization | null> {
  try {
    const res = await fetch(`${API_BASE}/organizations/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function OrganizationDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const org = await getOrganization(id)

  if (!org) notFound()

  const owner = org.members.find((m) => m.role === 'owner')
  const members = org.members.filter((m) => m.role === 'member')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            CreativePlatform
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* 組織ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          {org.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.avatar_url}
              alt={org.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
              {org.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            {org.description && (
              <p className="text-gray-500 text-sm mt-1">{org.description}</p>
            )}
          </div>
        </div>

        {/* メンバー一覧 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            メンバー ({org.members.length}人)
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {owner && (
              <div className="flex items-center justify-between px-4 py-3">
                <Link
                  href={`/users/${owner.user_id}`}
                  className="text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors"
                >
                  {owner.user_id}
                </Link>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  オーナー
                </span>
              </div>
            )}
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between px-4 py-3">
                <Link
                  href={`/users/${m.user_id}`}
                  className="text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {m.user_id}
                </Link>
                <span className="text-xs text-gray-400">
                  {new Date(m.joined_at).toLocaleDateString('ja-JP')}参加
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
