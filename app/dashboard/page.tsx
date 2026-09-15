import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  if (!claimsData?.claims?.sub) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <AppShell email={user.email}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Workspace</p>
            <h1 className="mt-2 text-[26px] font-semibold leading-[1.3] tracking-[-0.02em]">Your projects</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Keep project notes, documentation, and useful links organized in one place.</p>
          </div>
          <Link href="/dashboard/projects/new" className="ui-button-primary inline-flex w-fit items-center justify-center">New project</Link>
        </header>

        {error ? (
          <div role="alert" className="ui-error mt-6 p-4 text-sm">Unable to load projects: {error.message}</div>
        ) : projects?.length ? (
          <section aria-label="Projects" className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group block px-4 py-5 transition-colors hover:bg-[var(--surface-secondary)] sm:px-5">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-medium leading-5">{project.name}</h2>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--muted)]">{project.description || 'No description yet.'}</p>
                    <p className="mt-3 text-xs text-[var(--muted-foreground)]">Updated {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(project.updated_at))}</p>
                  </div>
                  <span aria-hidden="true" className="pt-0.5 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="mt-7 flex min-h-72 flex-col items-center justify-center border-y border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Projects</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.01em]">No projects yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Create your first project to start building your knowledge hub.</p>
              <Link href="/dashboard/projects/new" className="ui-button-primary mt-5 inline-flex items-center justify-center">Create first project</Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
}
