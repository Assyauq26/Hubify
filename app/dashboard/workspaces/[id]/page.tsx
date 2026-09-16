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
    <div className="min-h-[calc(100vh-0.01rem)] min-w-0 bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col">
        <header className="shrink-0 border-b border-[var(--border)] bg-[var(--background)] px-[var(--content-gutter)] py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Workspace</p>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{workspace.name}</h1>
              {workspace.description ? <p className="mt-1 max-w-3xl truncate text-sm text-[var(--muted)]">{workspace.description}</p> : null}
            </div>
            <a href={`/dashboard/workspaces/${id}/resources/new`} className="ui-button-primary inline-flex min-h-11 shrink-0 items-center justify-center">Add resource</a>
          </div>
        </header>

        {resourcesError ? (
          <div className="px-[var(--content-gutter)] py-6 sm:px-8 lg:px-10"><div className="ui-error" role="alert">We could not load this workspace&apos;s resources. Please try again.</div></div>
        ) : (
          <div className="min-h-0 flex-1 px-[var(--content-gutter)] py-4 sm:px-8 lg:px-10 lg:py-5">
            <WorkspaceTabs workspaceId={id} resources={summaries} />
          </div>
        )}
      </div>
    </div>
  )
}
