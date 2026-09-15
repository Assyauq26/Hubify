import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id, name, description, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Hubify</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Workspaces</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Active working spaces for your files, links, notes, tables, and lists.</p>
          </div>
          <Link href="/dashboard/workspaces/new" className="ui-button-primary inline-flex min-h-10 items-center justify-center">New workspace</Link>
        </header>

        {error ? (
          <div className="mt-8 border border-[var(--error)]/30 bg-[var(--surface)] p-5 text-sm text-[var(--error)]" role="alert">
            We could not load your workspaces. Please try again.
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
            {workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/dashboard/workspaces/${workspace.id}`} className="block px-4 py-5 transition-colors hover:bg-[var(--surface-secondary)] sm:px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{workspace.name}</h2>
                    {workspace.description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{workspace.description}</p> : null}
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-[var(--muted)]">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-[var(--border-strong)] p-8 text-center">
            <h2 className="text-sm font-semibold">No workspaces yet</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Create a workspace to start organizing your work resources.</p>
            <Link href="/dashboard/workspaces/new" className="ui-button-primary mt-5 inline-flex min-h-10 items-center justify-center">Create workspace</Link>
          </div>
        )}
      </div>
    </div>
  )
}
