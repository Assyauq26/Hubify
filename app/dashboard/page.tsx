import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims?.sub) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="text-sm font-semibold tracking-wide">HUBIFY</Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm text-neutral-500 sm:block">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your projects</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Keep project notes, documentation, and useful links organized in one place.</p>
          </div>
          <Link href="/dashboard/projects/new" className="inline-flex w-fit rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">New project</Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Unable to load projects: {error.message}</div>
        ) : projects?.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow">
                <h2 className="font-semibold">{project.name}</h2>
                <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-500">{project.description || 'No description yet.'}</p>
                <p className="mt-5 text-xs text-neutral-400">Updated {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(project.updated_at))}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="font-semibold">No projects yet</h2>
            <p className="mt-2 text-sm text-neutral-500">Create your first project to start building your knowledge hub.</p>
            <Link href="/dashboard/projects/new" className="mt-5 inline-flex rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">Create first project</Link>
          </div>
        )}
      </div>
    </main>
  )
}
