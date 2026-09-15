'use client'

import { useCallback, useState } from 'react'
import { NoteEditor } from '@/components/editor/NoteEditor'

type JsonValue = Record<string, unknown>

type NoteFormProps = {
  action: (formData: FormData) => void | Promise<void>
  projectId: string
  noteId?: string
  initialTitle: string
  initialContent: JsonValue
  submitLabel: string
}

const emptyContent: JsonValue = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function NoteForm({
  action,
  projectId,
  noteId,
  initialTitle,
  initialContent,
  submitLabel,
}: NoteFormProps) {
  const [content, setContent] = useState<JsonValue>(initialContent ?? emptyContent)
  const updateContent = useCallback((nextContent: JsonValue) => setContent(nextContent), [])

  return (
    <form
      action={action}
      className="space-y-7"
      onSubmit={(event) => {
        const form = event.currentTarget
        let input = form.elements.namedItem('content') as HTMLInputElement | null
        if (!input) {
          input = document.createElement('input')
          input.type = 'hidden'
          input.name = 'content'
          form.appendChild(input)
        }
        input.value = JSON.stringify(content)
      }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      {noteId ? <input type="hidden" name="id" value={noteId} /> : null}

      <label className="block text-sm font-medium text-[var(--foreground)]">
        Title
        <input
          name="title"
          required
          defaultValue={initialTitle}
          placeholder="Note title"
          className="ui-input mt-2 text-base"
        />
      </label>

      <div>
        <div className="mb-2 text-sm font-medium text-[var(--foreground)]">Content</div>
        <NoteEditor initialContent={initialContent ?? emptyContent} onContentChange={updateContent} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[var(--muted)]">Changes are saved when you press {submitLabel.toLowerCase()}.</p>
        <button type="submit" className="ui-button-primary w-full sm:w-auto">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
