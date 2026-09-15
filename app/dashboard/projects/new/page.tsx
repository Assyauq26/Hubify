import Link from 'next/link'
import { createProject } from '../actions'
import { AppShell } from '@/components/layout/AppShell'

export default function NewProjectPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[var(--background)] px-[var(--gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Back to projects</Link>
          <header className="mt-7 border-b border-[var(--border)] pb-7">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Projects</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em]">Create project</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">Create a focused space for notes, documentation, and useful links.</p>
          </header>

          <form action={createProject} className="py-8">
            <div className="space-y-6">
              <label className="block text-sm font-medium">
                Project name
                <input name="name" required autoFocus className="ui-input mt-2 w-full" placeholder="e.g. Hubify" />
              </label>
              <label className="block text-sm font-medium">
                Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
                <textarea name="description" rows={5} className="ui-input mt-2 w-full resize-none" placeholder="What is this project about?" />
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3 border-t border-[var(--border)] pt-6">
              <Link href="/dashboard" className="ui-button-secondary">Cancel</Link>
              <button type="submit" className="ui-button-primary">Create project</button>
            </div>
          </form>
        </div>
      </main>
    </AppShell>
  )
}
