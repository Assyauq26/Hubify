import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResourceCreationForm } from '@/components/resources/ResourceCreationForm'

export default async function NewResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !workspace) notFound()

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href={`/dashboard/workspaces/${workspace.id}`} className="inline-flex min-h-10 items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← {workspace.name}</Link>
        <header className="mt-5 border-b border-[var(--border)] pb-7">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Resource</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Add to workspace</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Upload a file or create a resource that you can open from this workspace.</p>
        </header>

        <ResourceCreationForm workspaceId={workspace.id} />
      </div>
    </div>
  )
}
