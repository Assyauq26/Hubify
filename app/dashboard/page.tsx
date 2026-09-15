import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: workspaces, error }, { data: resources }] = await Promise.all([
    supabase
      .from('workspaces')
      .select('id, name, description, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('resources')
      .select('id, workspace_id, title, type, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  const workspaceMap = new Map((workspaces ?? []).map((workspace) => [workspace.id, workspace.name]))

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[var(--border)] pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Hubify</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">Your workspace.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">One focused place for the files, links, notes, tables, and lists that keep your work moving.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/search" className="ui-button-secondary">Search</Link>
              <Link href="/dashboard/workspaces/new" className="ui-button-primary">New workspace</Link>
            </div>
          </div>
        </header>

        {error ? (
          <div role="alert" className="ui-error mt-7">Unable to load your workspaces right now. Please try again.</div>
        ) : null}

        <section aria-labelledby="recent-heading" className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Overview</p>
              <h2 id="recent-heading" className="mt-1 text-lg font-semibold tracking-[-0.01em]">Recent workspaces</h2>
            </div>
            <Link href="/dashboard/workspaces" className="text-xs font-medium text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)]">View all</Link>
          </div>

          {workspaces?.length ? (
            <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
              {workspaces.map((workspace) => (
                <Link key={workspace.id} href={`/dashboard/workspaces/${workspace.id}`} className="group block px-4 py-5 transition-colors hover:bg-[var(--surface-secondary)] sm:px-5">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{workspace.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{workspace.description || 'A focused workspace for your work resources.'}</p>
                      <p className="mt-3 text-xs text-[var(--muted-foreground)]">Updated {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(workspace.updated_at))}</p>
                    </div>
                    <span aria-hidden="true" className="shrink-0 pt-0.5 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-12 text-center">
              <h3 className="text-base font-semibold">No workspaces yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">Create your first workspace, then keep every related resource close at hand.</p>
              <Link href="/dashboard/workspaces/new" className="ui-button-primary mt-5">Create workspace</Link>
            </div>
          )}
        </section>

        {resources?.length ? (
          <section aria-labelledby="resources-heading" className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Library</p>
                <h2 id="resources-heading" className="mt-1 text-lg font-semibold tracking-[-0.01em]">Recent resources</h2>
              </div>
              <Link href="/dashboard/search" className="text-xs font-medium text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)]">Search library</Link>
            </div>
            <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
              {resources.map((resource) => (
                <Link key={resource.id} href={`/dashboard/resources/${resource.id}`} className="group flex items-center justify-between gap-4 px-4 py-4 hover:bg-[var(--surface-secondary)] sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{resource.title}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{workspaceMap.get(resource.workspace_id) ?? 'Workspace'} · {resource.type}</p>
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-[var(--muted-foreground)]">→</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
