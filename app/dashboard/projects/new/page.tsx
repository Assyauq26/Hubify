import Link from 'next/link'
import { createProject } from '../actions'

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-950">← Back to projects</Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-neutral-500">Projects</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Create project</h1>
          <p className="mt-2 text-sm text-neutral-500">Create a focused space for notes, documentation, and useful links.</p>

          <form action={createProject} className="mt-8 space-y-5">
            <label className="block text-sm font-medium">
              Project name
              <input name="name" required autoFocus className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" placeholder="e.g. Hubify" />
            </label>
            <label className="block text-sm font-medium">
              Description <span className="font-normal text-neutral-400">(optional)</span>
              <textarea name="description" rows={4} className="mt-2 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" placeholder="What is this project about?" />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard" className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50">Cancel</Link>
              <button type="submit" className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">Create project</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
