import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createLink } from '../actions'
import { LinkForm } from '../LinkForm'

export default async function NewLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!project) notFound()

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-neutral-500 hover:text-neutral-950">← Back to {project.name}</Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-neutral-500">Link Manager</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Add project link</h1>
          <div className="mt-8">
            <LinkForm action={createLink} projectId={id} submitLabel="Add link" />
          </div>
        </div>
      </div>
    </main>
  )
}
