import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WorkspaceTabs from '@/components/workspaces/WorkspaceTabs'
import type { ResourceType } from '@/lib/resources/types'

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

  const summaries = (resources ?? []).map((resource) => ({ id: resource.id, title: resource.title, type: resource.type as ResourceType }))

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
            <Link href={`/dashboard/workspaces/${id}/resources/new`} className="ui-button-primary inline-flex min-h-10 shrink-0 items-center justify-center">+ Add resource</Link>
          </div>
        </header>

        {resourcesError ? (
          <div className="mt-8 border border-[var(--error)]/30 bg-[var(--surface)] p-5 text-sm text-[var(--error)]" role="alert">We could not load this workspace's resources.</div>
        ) : (
          <WorkspaceTabs workspaceId={id} resources={summaries} />
        )}
      </div>
    </div>
  )
}
