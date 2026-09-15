'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { getWorkspaceList, saveWorkspaceList } from '@/lib/resources/list-actions'

type ListItem = { id: string; text: string; completed: boolean }
type ListData = { items: ListItem[] }
type Props = { resourceId: string; workspaceId: string; onDirtyChange?: (dirty: boolean) => void; onTitleChange?: (title: string) => void }

const empty: ListData = { items: [] }
function makeId() { return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export function WorkspaceListEditor({ resourceId, workspaceId, onDirtyChange, onTitleChange }: Props) {
  const [title, setTitle] = useState('')
  const [data, setData] = useState<ListData>(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [isPending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef({ title: '', data: empty })
  const dirtyRef = useRef(onDirtyChange)
  const titleRef = useRef(onTitleChange)

  useEffect(() => { dirtyRef.current = onDirtyChange; titleRef.current = onTitleChange }, [onDirtyChange, onTitleChange])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getWorkspaceList(resourceId).then((result) => {
      if (cancelled) return
      if (!result.ok) { setError(result.error); setLoading(false); return }
      setTitle(result.list.title)
      setData(result.list.data)
      latest.current = { title: result.list.title, data: result.list.data }
      dirtyRef.current?.(false)
      setSaveState('saved')
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [resourceId])

  const scheduleSave = useCallback((nextTitle: string, nextData: ListData) => {
    latest.current = { title: nextTitle, data: nextData }
    dirtyRef.current?.(true)
    setSaveState('unsaved')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const form = new FormData()
      form.set('resource_id', resourceId)
      form.set('workspace_id', workspaceId)
      form.set('title', latest.current.title.trim() || 'Untitled list')
      form.set('data', JSON.stringify(latest.current.data))
      startTransition(async () => {
        setSaveState('saving')
        const result = await saveWorkspaceList(form)
        if (!result.ok) { setError(result.error); setSaveState('error'); return }
        dirtyRef.current?.(false)
        setSaveState('saved')
      })
    }, 500)
  }, [resourceId, workspaceId])

  const changeTitle = (next: string) => { setTitle(next); titleRef.current?.(next || 'Untitled list'); scheduleSave(next, data) }
  const changeItem = (itemId: string, text: string) => {
    const next = { items: data.items.map((item) => item.id === itemId ? { ...item, text } : item) }
    setData(next); scheduleSave(title, next)
  }
  const toggleItem = (itemId: string) => {
    const next = { items: data.items.map((item) => item.id === itemId ? { ...item, completed: !item.completed } : item) }
    setData(next); scheduleSave(title, next)
  }
  const addItem = () => {
    const next = { items: [...data.items, { id: makeId(), text: '', completed: false }] }
    setData(next); scheduleSave(title, next)
  }
  const deleteItem = (itemId: string) => {
    const next = { items: data.items.filter((item) => item.id !== itemId) }
    setData(next); scheduleSave(title, next)
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  if (loading) return <div className="min-h-[360px] bg-[var(--surface-secondary)]" aria-label="Loading list" />
  if (error && !title) return <div role="alert" className="p-8 text-sm text-[var(--error)]">{error}</div>

  const completed = data.items.filter((item) => item.completed).length

  return <div className="bg-[var(--surface)]">
    <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <input value={title} onChange={(event) => changeTitle(event.target.value)} maxLength={200} aria-label="List title" placeholder="Untitled list" className="w-full border-0 bg-transparent p-0 text-xl font-semibold outline-none focus:ring-0 sm:text-2xl" />
      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]" aria-live="polite">
        <span>{saveState === 'saving' || isPending ? 'Saving…' : saveState === 'unsaved' ? 'Unsaved changes' : saveState === 'error' ? 'Save failed' : `${completed}/${data.items.length} done`}</span>
        <button type="button" onClick={addItem} className="border border-[var(--border)] px-3 py-2 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]">+ Item</button>
      </div>
    </div>
    {error ? <div role="alert" className="border-b border-[var(--error)]/30 px-5 py-3 text-sm text-[var(--error)]">{error}</div> : null}
    <div className="divide-y divide-[var(--border)]">
      {data.items.map((item, index) => <div key={item.id} className="flex items-center gap-3 px-5 py-3 sm:px-8">
        <input type="checkbox" checked={item.completed} onChange={() => toggleItem(item.id)} aria-label={`Complete item ${index + 1}`} className="h-4 w-4 shrink-0 accent-[var(--primary)]" />
        <input value={item.text} onChange={(event) => changeItem(item.id, event.target.value)} aria-label={`List item ${index + 1}`} placeholder="List item" className={`min-w-0 flex-1 border-0 bg-transparent py-1 text-sm outline-none focus:ring-0 ${item.completed ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--foreground)]'}`} />
        <button type="button" onClick={() => deleteItem(item.id)} aria-label={`Delete item ${index + 1}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--error)]">×</button>
      </div>)}
      {data.items.length === 0 ? <div className="px-5 py-12 text-center sm:px-8"><p className="text-sm font-medium">No items yet</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Add an item to start your list.</p></div> : null}
    </div>
    <div className="border-t border-[var(--border)] px-5 py-3 sm:px-8"><button type="button" onClick={addItem} className="text-xs font-medium text-[var(--foreground)] underline underline-offset-2">+ Add item</button></div>
  </div>
}
