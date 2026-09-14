'use client'

export function LinkForm({
  action,
  projectId,
  linkId,
  initialTitle = '',
  initialUrl = '',
  initialDescription = '',
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  projectId: string
  linkId?: string
  initialTitle?: string
  initialUrl?: string
  initialDescription?: string
  submitLabel: string
}) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="project_id" value={projectId} />
      {linkId ? <input type="hidden" name="id" value={linkId} /> : null}

      <label className="block text-sm font-medium">
        Title
        <input name="title" required defaultValue={initialTitle} placeholder="GitHub repository" className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
      </label>

      <label className="block text-sm font-medium">
        URL
        <input name="url" type="url" required defaultValue={initialUrl} placeholder="https://github.com/..." className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
      </label>

      <label className="block text-sm font-medium">
        Description <span className="font-normal text-neutral-400">(optional)</span>
        <textarea name="description" rows={4} defaultValue={initialDescription} placeholder="What is this link for?" className="mt-2 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" />
      </label>

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
