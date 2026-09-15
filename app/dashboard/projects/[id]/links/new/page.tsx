import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { createLink } from '../actions'
import { LinkForm } from '../LinkForm'

export default async function NewLinkPage({ params }: { params: Promise<{ id: string }> }) {
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
    <AppShell email={user.email}>
      <main className="min-h-screen bg-[var(--background)] px-[var(--gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href={`/dashboard/projects/${id}`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            ← Back to {project.name}
          </Link>

          <header className="mt-7 border-b border-[var(--border)] pb-7">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Link manager</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em]">Add project link</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Save a repository, document, website, or other resource with this project.
            </p>
          </header>

          <section className="py-8">
            <LinkForm action={createLink} projectId={id} submitLabel="Add link" />
          </section>
        </div>
      </main>
    </AppShell>
  )
}
