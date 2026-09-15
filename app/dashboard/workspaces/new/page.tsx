import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function createWorkspace(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  if (!name) return

  const { data } = await supabase
    .from('workspaces')
    .insert({ name, description, user_id: user.id })
    .select('id')
    .single()

  if (data) redirect(`/dashboard/workspaces/${data.id}`)
}

export default function NewWorkspacePage() {
  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-8 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard/workspaces" className="inline-flex min-h-10 items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Back to workspaces</Link>
        <header className="mt-5 border-b border-[var(--border)] pb-7">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Create workspace</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Set up a focused space for the resources you use together.</p>
        </header>

        <form action={createWorkspace} className="mt-8 space-y-6">
          <label className="block text-sm font-medium">
            Workspace name
            <input name="name" required maxLength={120} autoFocus className="ui-input mt-2 w-full" placeholder="e.g. E-Commerce" />
          </label>
          <label className="block text-sm font-medium">
            Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            <textarea name="description" rows={5} maxLength={500} className="ui-input mt-2 w-full resize-y" placeholder="What are you working on?" />
          </label>
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
            <Link href="/dashboard/workspaces" className="ui-button-secondary inline-flex min-h-10 items-center justify-center">Cancel</Link>
            <button type="submit" className="ui-button-primary min-h-10">Create workspace</button>
          </div>
        </form>
      </div>
    </div>
  )
}
