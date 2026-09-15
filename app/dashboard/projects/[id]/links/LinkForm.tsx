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
    <form action={action} className="space-y-6">
      <input type="hidden" name="project_id" value={projectId} />
      {linkId ? <input type="hidden" name="id" value={linkId} /> : null}

      <label className="block text-sm font-medium">
        Title
        <input
          name="title"
          required
          defaultValue={initialTitle}
          placeholder="GitHub repository"
          className="ui-input mt-2 w-full"
        />
      </label>

      <label className="block text-sm font-medium">
        URL
        <input
          name="url"
          type="url"
          required
          defaultValue={initialUrl}
          placeholder="https://github.com/..."
          className="ui-input mt-2 w-full"
        />
      </label>

      <label className="block text-sm font-medium">
        Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={initialDescription}
          placeholder="What is this link for?"
          className="ui-input mt-2 w-full resize-none"
        />
      </label>

      <div className="flex justify-end border-t border-[var(--border)] pt-6">
        <button type="submit" className="ui-button-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
