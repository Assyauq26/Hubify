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
      className="space-y-5"
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

      <label className="block text-sm font-medium text-neutral-900">
        Title
        <input
          name="title"
          required
          defaultValue={initialTitle}
          placeholder="Note title"
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        />
      </label>

      <div>
        <div className="mb-2 text-sm font-medium text-neutral-900">Content</div>
        <NoteEditor initialContent={initialContent ?? emptyContent} onContentChange={updateContent} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">Changes are saved when you press {submitLabel.toLowerCase()}.</p>
        <button type="submit" className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
