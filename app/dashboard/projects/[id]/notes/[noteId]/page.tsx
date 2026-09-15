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
    <main className="min-h-screen px-[var(--content-gutter)] py-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link href={`/dashboard/projects/${id}`} className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          ← Back to {project.name}
        </Link>

        <header className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Project note</p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em]">Edit note</h1>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">Last updated {new Date(note.updated_at).toLocaleString('en-ID')}</p>
        </header>

        <section className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7" aria-label="Edit note form">
          <NoteForm
            action={updateNote}
            projectId={id}
            noteId={note.id}
            initialTitle={note.title}
            initialContent={note.content as JsonValue}
            submitLabel="Save note"
          />
        </section>

        <section className="mt-6 border-t border-[var(--border)] pt-6" aria-labelledby="danger-zone-title">
          <h2 id="danger-zone-title" className="text-sm font-medium">Delete note</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Permanently remove this note from the project.</p>
          <form action={deleteNote} className="mt-4">
            <input type="hidden" name="id" value={note.id} />
            <input type="hidden" name="project_id" value={id} />
            <button type="submit" className="min-h-10 rounded-[var(--radius-lg)] border border-[#fecaca] px-3.5 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error-surface)]">
              Delete note
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
