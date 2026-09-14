import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteLink, updateLink } from '../actions'
import { LinkForm } from '../LinkForm'

export default async function LinkPage({ params }: { params: Promise<{ id: string; linkId: string }> }) {
  const { id, linkId } = await params
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

  const { data: link } = await supabase
    .from('links')
    .select('id, title, url, description, updated_at')
    .eq('id', linkId)
    .eq('project_id', id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!link) notFound()

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-neutral-500 hover:text-neutral-950">← Back to {project.name}</Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-neutral-500">Link Manager</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Edit project link</h1>
          <div className="mt-8">
            <LinkForm
              action={updateLink}
              projectId={id}
              linkId={link.id}
              initialTitle={link.title}
              initialUrl={link.url}
              initialDescription={link.description ?? ''}
              submitLabel="Save link"
            />
          </div>
          <div className="mt-8 border-t border-neutral-100 pt-6">
            <form action={deleteLink}>
              <input type="hidden" name="id" value={link.id} />
              <input type="hidden" name="project_id" value={id} />
              <button type="submit" className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete link</button>
            </form>
          </div>
          <p className="mt-3 text-xs text-neutral-400">Last updated {new Date(link.updated_at).toLocaleString('en-ID')}</p>
        </div>
      </div>
    </main>
  )
}
