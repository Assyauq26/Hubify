import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: workspace, error: workspaceError }, { data: resources, error: resourcesError }] = await Promise.all([
    supabase.from('workspaces').select('id, name, description, created_at, updated_at').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('resources').select('id, title, description, type, is_favorite, updated_at').eq('workspace_id', id).eq('user_id', user.id).order('updated_at', { ascending: false }),
  ])

  if (workspaceError || !workspace) notFound()

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard/workspaces" className="inline-flex min-h-10 items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Workspaces</Link>

        <header className="mt-5 border-b border-[var(--border)] pb-7">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Workspace</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-[28px] font-semibold tracking-[-0.025em]">{workspace.name}</h1>
              {workspace.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{workspace.description}</p> : null}
            </div>
            <button type="button" disabled className="ui-button-secondary min-h-10 shrink-0 opacity-60" title="Resource creation is implemented in the next phase">Add resource</button>
          </div>
        </header>

        <nav className="flex gap-6 overflow-x-auto border-b border-[var(--border)] py-3" aria-label="Workspace resource filters">
          {['All resources', 'Files', 'Links', 'Notes', 'Tables', 'Lists'].map((label, index) => (
            <span key={label} className={index === 0 ? 'whitespace-nowrap border-b-2 border-[var(--foreground)] pb-3 text-sm font-medium' : 'whitespace-nowrap pb-3 text-sm text-[var(--muted-foreground)]'}>{label}</span>
          ))}
        </nav>

        {resourcesError ? (
          <div className="mt-8 border border-[var(--error)]/30 bg-[var(--surface)] p-5 text-sm text-[var(--error)]" role="alert">We could not load this workspace's resources.</div>
        ) : resources && resources.length > 0 ? (
          <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{resource.title}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{resource.type}</span>
                  </div>
                  {resource.description ? <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{resource.description}</p> : null}
                </div>
                {resource.is_favorite ? <span aria-label="Favorite" title="Favorite" className="shrink-0 text-sm">★</span> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-[var(--border-strong)] p-10 text-center">
            <h2 className="text-sm font-semibold">This workspace is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">Files, links, notes, tables, and lists will appear here as resources.</p>
          </div>
        )}
      </div>
    </div>
  )
}
