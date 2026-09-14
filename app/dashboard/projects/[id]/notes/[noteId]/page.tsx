import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteNote, updateNote } from '../actions'
import { NoteForm } from '../NoteForm'

type JsonValue = Record<string, unknown>

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>
}) {
  const { id, noteId } = await params
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

  const { data: note } = await supabase
    .from('notes')
    .select('id, project_id, title, content, updated_at')
    .eq('id', noteId)
    .eq('project_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!note) notFound()

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/projects/${id}`} className="text-sm text-neutral-500 hover:text-neutral-950">← Back to {project.name}</Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-medium text-neutral-500">Project note</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Edit note</h1>
          </div>
          <div className="mt-8">
            <NoteForm
              action={updateNote}
              projectId={id}
              noteId={note.id}
              initialTitle={note.title}
              initialContent={note.content as JsonValue}
              submitLabel="Save note"
            />
          </div>
          <div className="mt-8 border-t border-neutral-100 pt-6">
            <form action={deleteNote}>
              <input type="hidden" name="id" value={note.id} />
              <input type="hidden" name="project_id" value={id} />
              <button type="submit" className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                Delete note
              </button>
            </form>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            Last updated {new Date(note.updated_at).toLocaleString('en-ID')}
          </p>
        </div>
      </div>
    </main>
  )
}
