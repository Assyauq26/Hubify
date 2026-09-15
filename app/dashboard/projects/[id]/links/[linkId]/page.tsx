import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { deleteLink, updateLink } from '../actions'
import { LinkForm } from '../LinkForm'

export default async function LinkPage({ params }: { params: Promise<{ id: string; linkId: string }> }) {
  const { id, linkId } = await params
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

  const { data: link } = await supabase
    .from('links')
    .select('id, title, url, description, updated_at')
    .eq('id', linkId)
    .eq('project_id', id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!link) notFound()

  return (
    <AppShell email={user.email}>
      <main className="min-h-screen bg-[var(--background)] px-[var(--gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href={`/dashboard/projects/${id}`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            ← Back to {project.name}
          </Link>

          <header className="mt-7 border-b border-[var(--border)] pb-7">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Link manager</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em]">Edit project link</h1>
            <p className="mt-2 max-w-2xl truncate text-sm text-[var(--muted-foreground)]">{link.url}</p>
          </header>

          <section className="py-8">
            <LinkForm
              action={updateLink}
              projectId={id}
              linkId={link.id}
              initialTitle={link.title}
              initialUrl={link.url}
              initialDescription={link.description ?? ''}
              submitLabel="Save link"
            />
          </section>

          <section className="border-t border-[var(--border)] py-6">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]">Danger zone</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Remove this link from the project.</p>
              <form action={deleteLink} className="mt-4">
                <input type="hidden" name="id" value={link.id} />
                <input type="hidden" name="project_id" value={id} />
                <button type="submit" className="ui-button-ghost text-[var(--error)] hover:bg-red-50">Delete link</button>
              </form>
            </div>
            <p className="mt-5 text-xs text-[var(--muted)]">Last updated {new Date(link.updated_at).toLocaleString('en-ID')}</p>
          </section>
        </div>
      </main>
    </AppShell>
  )
}
