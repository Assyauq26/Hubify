import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteProject, updateProject } from '../actions'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) notFound()

  const [{ data: notes }, { data: links }] = await Promise.all([
    supabase.from('notes').select('id, title, updated_at').eq('project_id', id).eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('links').select('id, title, url, description, updated_at').eq('project_id', id).eq('user_id', user.id).order('updated_at', { ascending: false }),
  ])

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          ← Back to projects
        </Link>

        <header className="mt-5 border-b border-[var(--border)] pb-7">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Project</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-[26px] font-semibold tracking-[-0.02em]">{project.name}</h1>
              {project.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{project.description}</p> : null}
            </div>
            <span className="shrink-0 text-xs text-[var(--muted-foreground)]">Workspace</span>
          </div>
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <h2 className="text-[19px] font-semibold tracking-[-0.01em]">Project settings</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Update the project name and description.</p>
            <form action={updateProject} className="mt-6 space-y-5">
              <input type="hidden" name="id" value={project.id} />
              <label className="block text-sm font-medium">
                Project name
                <input name="name" required defaultValue={project.name} className="ui-input mt-2 w-full" />
              </label>
              <label className="block text-sm font-medium">
                Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
                <textarea name="description" rows={5} defaultValue={project.description ?? ''} className="ui-input mt-2 w-full resize-y" />
              </label>
              <button type="submit" className="ui-button-primary w-full sm:w-auto">Save changes</button>
            </form>
          </div>

          <aside className="border-t border-[var(--border)] pt-6 lg:border-l lg:border-t-0 lg:pl-8">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]">Danger zone</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Delete this project and its associated content.</p>
            <form action={deleteProject} className="mt-4">
              <input type="hidden" name="id" value={project.id} />
              <button type="submit" className="ui-button-ghost min-h-10 text-[var(--error)] hover:bg-red-50">Delete project</button>
            </form>
          </aside>
        </section>

        <section className="border-t border-[var(--border)] py-8" aria-labelledby="notes-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="notes-heading" className="text-[19px] font-semibold tracking-[-0.01em]">Notes</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Rich-text documentation and project context.</p>
            </div>
            <Link href={`/dashboard/projects/${id}/notes/new`} className="ui-button-primary inline-flex shrink-0 items-center justify-center">New note</Link>
          </div>
          {notes && notes.length > 0 ? (
            <div className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
              {notes.map((note) => (
                <Link key={note.id} href={`/dashboard/projects/${id}/notes/${note.id}`} className="flex min-h-14 items-center justify-between gap-4 px-3 py-4 transition-colors hover:bg-[var(--surface-secondary)] sm:px-4">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{note.title}</span>
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">Updated {new Date(note.updated_at).toLocaleString('en-ID')}</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-[var(--muted)]">→</span>
                </Link>
              ))}
            </div>
          ) : <div className="mt-6 border border-dashed border-[var(--border-strong)] p-6 text-sm text-[var(--muted-foreground)]">No notes yet. Create your first project note.</div>}
        </section>

        <section className="border-t border-[var(--border)] py-8" aria-labelledby="links-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="links-heading" className="text-[19px] font-semibold tracking-[-0.01em]">Links</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Useful project resources in one place.</p>
            </div>
            <Link href={`/dashboard/projects/${id}/links/new`} className="ui-button-secondary inline-flex shrink-0 items-center justify-center">Add link</Link>
          </div>
          {links && links.length > 0 ? (
            <div className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
              {links.map((link) => (
                <div key={link.id} className="flex items-start justify-between gap-4 px-3 py-4 sm:px-4">
                  <div className="min-w-0">
                    <Link href={`/dashboard/projects/${id}/links/${link.id}`} className="block truncate text-sm font-medium hover:underline">{link.title}</Link>
                    {link.description ? <p className="mt-1 break-words text-xs text-[var(--muted-foreground)]">{link.description}</p> : null}
                    <a href={link.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-[var(--muted)] hover:text-[var(--foreground)]">{link.url}</a>
                  </div>
                  <Link href={`/dashboard/projects/${id}/links/${link.id}`} className="min-h-10 shrink-0 inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Edit</Link>
                </div>
              ))}
            </div>
          ) : <div className="mt-6 border border-dashed border-[var(--border-strong)] p-6 text-sm text-[var(--muted-foreground)]">No links yet. Add a repository, document, website, or other resource.</div>}
        </section>
      </div>
    </div>
  )
}
