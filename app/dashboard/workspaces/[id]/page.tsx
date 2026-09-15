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
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-6 text-[var(--foreground)] sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard/workspaces" className="inline-flex min-h-11 items-center rounded-sm text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]">← Workspaces</Link>
        <header className="mt-3 border-b border-[var(--border)] pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Workspace</p>
              <h1 className="mt-2 break-words text-[30px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">{workspace.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{workspace.description || 'Keep the resources for this work together.'}</p>
            </div>
            <Link href={`/dashboard/workspaces/${id}/resources/new`} className="ui-button-primary inline-flex min-h-11 shrink-0 items-center justify-center">Add resource</Link>
          </div>
        </header>
        {resourcesError ? <div className="ui-error mt-7" role="alert">We could not load this workspace&apos;s resources. Please try again.</div> : <WorkspaceTabs workspaceId={id} resources={summaries} />}
      </div>
    </div>
  )
}
