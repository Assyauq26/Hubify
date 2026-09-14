import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createNote } from '../actions'
import { NoteForm } from '../NoteForm'

const emptyContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export default async function NewNotePage({ params }: { params: Promise<{ id: string }> }) {
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
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-neutral-500 hover:text-neutral-950">← Back to {project.name}</Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-medium text-neutral-500">New note</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Create a project note</h1>
          </div>
          <div className="mt-8">
            <NoteForm
              action={createNote}
              projectId={id}
              initialTitle=""
              initialContent={emptyContent}
              submitLabel="Create note"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
