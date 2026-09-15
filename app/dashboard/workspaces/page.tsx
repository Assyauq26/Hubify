import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspaces, error } = await supabase.from('workspaces').select('id, name, description, created_at, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false })

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[var(--border)] pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Workspace library</p>
              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.03em] sm:text-[34px]">Workspaces</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Focused spaces for the files, links, notes, tables, and lists you use together.</p>
            </div>
            <Link href="/dashboard/workspaces/new" className="ui-button-primary inline-flex min-h-11 shrink-0 items-center justify-center">New workspace</Link>
          </div>
        </header>

        {error ? <div className="ui-error mt-7" role="alert">We could not load your workspaces. Please try again.</div> : workspaces?.length ? (
          <section aria-labelledby="workspace-list-heading" className="mt-8">
            <div className="mb-3 flex items-end justify-between gap-4"><h2 id="workspace-list-heading" className="text-sm font-semibold">Your workspaces</h2><span className="text-xs text-[var(--muted-foreground)]">{workspaces.length} total</span></div>
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
              {workspaces.map((workspace) => <Link key={workspace.id} href={`/dashboard/workspaces/${workspace.id}`} className="group block min-h-24 px-4 py-5 transition-colors hover:bg-[var(--surface-secondary)] focus-visible:bg-[var(--surface-secondary)] sm:px-6"><div className="flex items-start justify-between gap-5"><div className="min-w-0"><h3 className="truncate text-sm font-semibold sm:text-base">{workspace.name}</h3><p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">{workspace.description || 'A focused workspace for your work resources.'}</p><p className="mt-2 text-xs text-[var(--muted-foreground)]">Updated {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(workspace.updated_at))}</p></div><span aria-hidden="true" className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border)] text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">→</span></div></Link>)}
            </div>
          </section>
        ) : <section className="mt-8 border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center"><h2 className="text-base font-semibold">No workspaces yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">Create your first workspace and keep every related resource close at hand.</p><Link href="/dashboard/workspaces/new" className="ui-button-primary mt-6 inline-flex min-h-11 items-center justify-center">Create workspace</Link></section>}
      </div>
    </div>
  )
}
