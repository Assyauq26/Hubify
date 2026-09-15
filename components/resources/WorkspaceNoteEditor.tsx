'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { getWorkspaceNote, saveWorkspaceNote } from '@/lib/resources/note-actions'

type JsonObject = Record<string, unknown>

type Props = {
  resourceId: string
  workspaceId: string
  onDirtyChange?: (dirty: boolean) => void
  onTitleChange?: (title: string) => void
}

const emptyContent: JsonObject = { type: 'doc', content: [{ type: 'paragraph' }] }

export function WorkspaceNoteEditor({ resourceId, workspaceId, onDirtyChange, onTitleChange }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<JsonObject>(emptyContent)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [isPending, startTransition] = useTransition()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRef = useRef({ title: '', content: emptyContent })
  const dirtyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getWorkspaceNote(resourceId).then((result) => {
      if (cancelled) return
      if (!result.ok) {
        setError(result.error)
        setLoading(false)
        return
      }
      setTitle(result.note.title)
      setContent(result.note.content)
      latestRef.current = { title: result.note.title, content: result.note.content }
      dirtyRef.current = false
      onDirtyChange?.(false)
      setSaveState('saved')
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [onDirtyChange, resourceId])

  const persist = useCallback((nextTitle: string, nextContent: JsonObject) => {
    latestRef.current = { title: nextTitle, content: nextContent }
    dirtyRef.current = true
    onDirtyChange?.(true)
    setSaveState('unsaved')

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const formData = new FormData()
      formData.set('resource_id', resourceId)
      formData.set('workspace_id', workspaceId)
      formData.set('title', latestRef.current.title.trim() || 'Untitled note')
      formData.set('content', JSON.stringify(latestRef.current.content))
      startTransition(async () => {
        setSaveState('saving')
        const result = await saveWorkspaceNote(formData)
        if (!result.ok) {
          setSaveState('error')
          setError(result.error)
          return
        }
        dirtyRef.current = false
        onDirtyChange?.(false)
        setSaveState('saved')
      })
    }, 700)
  }, [onDirtyChange, resourceId, workspaceId])

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
  }, [])

  if (loading) return <div className="min-h-[420px] bg-[var(--surface-secondary)]" aria-label="Loading note" />
  if (error && !title) return <div role="alert" className="p-8 text-sm text-[var(--error)]">{error}</div>

  return (
    <div className="bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-5 sm:px-8">
        <label className="block">
          <span className="sr-only">Note title</span>
          <input
            value={title}
            onChange={(event) => {
              const next = event.target.value
              setTitle(next)
              onTitleChange?.(next || 'Untitled note')
              persist(next, content)
            }}
            maxLength={200}
            aria-label="Note title"
            className="w-full border-0 bg-transparent p-0 text-xl font-semibold tracking-[-0.02em] outline-none placeholder:text-[var(--muted-foreground)] focus:ring-0 sm:text-2xl"
            placeholder="Untitled note"
          />
        </label>
        <div className="mt-2 flex min-h-5 items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]" aria-live="polite">
          <span>{saveState === 'saving' || isPending ? 'Saving…' : saveState === 'unsaved' ? 'Unsaved changes' : saveState === 'error' ? 'Save failed' : 'Saved'}</span>
          {saveState === 'error' ? <button type="button" onClick={() => persist(latestRef.current.title, latestRef.current.content)} className="underline underline-offset-2 hover:text-[var(--foreground)]">Retry</button> : null}
        </div>
      </div>

      {error ? <div role="alert" className="border-b border-[var(--error)]/30 bg-[var(--error-surface)] px-5 py-3 text-sm text-[var(--error)] sm:px-8">{error}</div> : null}

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-8">
        <NoteEditor
          initialContent={content}
          onContentChange={(nextContent) => {
            setContent(nextContent)
            persist(title, nextContent)
          }}
        />
      </div>
    </div>
  )
}
