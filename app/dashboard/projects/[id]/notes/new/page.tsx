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
    <main className="min-h-screen px-[var(--content-gutter)] py-8 sm:px-[var(--content-gutter)] lg:py-10">
      <div className="mx-auto max-w-4xl">
        <Link href={`/dashboard/projects/${id}`} className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          ← Back to {project.name}
        </Link>

        <header className="mt-8 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">New note</p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em]">Create a project note</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Capture documentation, decisions, and useful context for this project.</p>
        </header>

        <section className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7" aria-label="Create note form">
          <NoteForm
            action={createNote}
            projectId={id}
            initialTitle=""
            initialContent={emptyContent}
            submitLabel="Create note"
          />
        </section>
      </div>
    </main>
  )
}
