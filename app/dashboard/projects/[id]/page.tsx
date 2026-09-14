import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteProject, updateProject } from '../actions'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-950">← Back to projects</Link>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Project</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{project.name}</h1>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">Workspace</span>
          </div>

          <form action={updateProject} className="mt-8 space-y-5">
            <input type="hidden" name="id" value={project.id} />
            <label className="block text-sm font-medium">
              Project name
              <input name="name" required defaultValue={project.name} className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
            </label>
            <label className="block text-sm font-medium">
              Description
              <textarea name="description" rows={5} defaultValue={project.description ?? ''} className="mt-2 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <form action={deleteProject}>
                <input type="hidden" name="id" value={project.id} />
                <button type="submit" className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete project</button>
              </form>
              <button type="submit" className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">Save changes</button>
            </div>
          </form>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm font-medium">Notes</p>
            <p className="mt-1 text-sm text-neutral-500">Rich-text project notes will live here.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm font-medium">Links</p>
            <p className="mt-1 text-sm text-neutral-500">Useful project links will live here.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
