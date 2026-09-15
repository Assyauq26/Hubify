'use client'

import { useEffect, useMemo, useState } from 'react'
import { getResourceViewer, markResourceOpened } from '@/lib/resources/actions'
import type { ResourceType } from '@/lib/resources/types'

export type WorkspaceTab = { resourceId: string; title: string; type: ResourceType; dirty?: boolean }
export type WorkspaceResourceSummary = { id: string; title: string; type: ResourceType }
type Props = { workspaceId: string; resources: WorkspaceResourceSummary[] }
type ViewerResource = Awaited<ReturnType<typeof getResourceViewer>> extends { ok: true; resource: infer R } ? R : never

const storageKey = (workspaceId: string) => `hubify:workspace-tabs:${workspaceId}`

function readStored(workspaceId: string) {
  try {
    const raw = window.localStorage.getItem(storageKey(workspaceId))
    if (!raw) return { tabs: [] as WorkspaceTab[], activeId: null as string | null }
    const parsed = JSON.parse(raw) as { tabs?: WorkspaceTab[]; activeId?: string | null }
    return { tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [], activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null }
  } catch { return { tabs: [] as WorkspaceTab[], activeId: null as string | null } }
}

function Preview({ resource }: { resource: ViewerResource }) {
  if (resource.type === 'file' && resource.fileUrl) {
    if (resource.mimeType === 'application/pdf') return <iframe title={resource.title} src={resource.fileUrl} className="h-[65vh] min-h-[480px] w-full border-0" />
    if (resource.mimeType?.startsWith('image/')) return <div className="flex min-h-[480px] items-center justify-center bg-[var(--surface-secondary)] p-6"><img src={resource.fileUrl} alt={resource.title} className="max-h-[65vh] max-w-full object-contain" /></div>
    if (resource.mimeType === 'text/plain' || resource.mimeType === 'text/csv' || resource.mimeType === 'application/json') return <iframe title={resource.title} src={resource.fileUrl} className="h-[65vh] min-h-[480px] w-full border-0 bg-[var(--surface)]" />
    return <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center"><p className="text-sm">Preview is not available for this file type.</p><a href={resource.fileUrl} target="_blank" rel="noreferrer" className="ui-button-primary inline-flex min-h-10 items-center justify-center">Download / Open file</a></div>
  }
  if (resource.type === 'link' && resource.externalUrl) return <iframe title={resource.title} src={resource.externalUrl} className="h-[65vh] min-h-[480px] w-full border-0" />
  if (resource.type === 'link' && !resource.externalUrl) return <div className="p-8 text-sm text-[var(--muted-foreground)]">This link does not have a URL yet.</div>
  return <div className="p-8 text-sm text-[var(--muted-foreground)]">This resource does not have a viewer yet.</div>
}

export default function WorkspaceTabs({ workspaceId, resources }: Props) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewer, setViewer] = useState<ViewerResource | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const resourceMap = useMemo(() => new Map(resources.map((resource) => [resource.id, resource])), [resources])

  useEffect(() => {
    const stored = readStored(workspaceId)
    const validTabs = stored.tabs.filter((tab) => resourceMap.has(tab.resourceId)).map((tab) => ({ ...tab, title: resourceMap.get(tab.resourceId)!.title, type: resourceMap.get(tab.resourceId)!.type }))
    setTabs(validTabs)
    setActiveId(validTabs.some((tab) => tab.resourceId === stored.activeId) ? stored.activeId : validTabs[0]?.resourceId ?? null)
    setHydrated(true)
  }, [resourceMap, workspaceId])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(storageKey(workspaceId), JSON.stringify({ tabs, activeId }))
  }, [activeId, hydrated, tabs, workspaceId])

  useEffect(() => {
    let cancelled = false
    if (!activeId) { setViewer(null); return }
    setLoading(true); setError(null)
    void getResourceViewer(activeId).then((result) => {
      if (cancelled) return
      if (!result.ok) { setViewer(null); setError(result.error); setLoading(false); return }
      setViewer(result.resource); setLoading(false)
    })
    return () => { cancelled = true }
  }, [activeId])

  const activate = async (resourceId: string) => {
    setActiveId(resourceId)
    await markResourceOpened(resourceId)
  }

  const open = async (resource: WorkspaceResourceSummary) => {
    if (!tabs.some((tab) => tab.resourceId === resource.id)) setTabs((current) => [...current, { resourceId: resource.id, title: resource.title, type: resource.type }])
    await activate(resource.id)
  }

  const close = async (resourceId: string) => {
    const tab = tabs.find((item) => item.resourceId === resourceId)
    if (!tab) return
    if (tab.dirty && !window.confirm(`Discard unsaved changes in “${tab.title}”?`)) return
    const index = tabs.findIndex((item) => item.resourceId === resourceId)
    const nextTabs = tabs.filter((item) => item.resourceId !== resourceId)
    const nextActive = activeId === resourceId ? nextTabs[Math.min(index, nextTabs.length - 1)]?.resourceId ?? null : activeId
    setTabs(nextTabs); setActiveId(nextActive)
    if (nextActive) await markResourceOpened(nextActive)
  }

  return (
    <section aria-label="Workspace tabs" className="mt-6">
      <div role="tablist" aria-label="Open resources" className="flex min-h-11 items-stretch overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)]">
        {tabs.map((tab) => {
          const active = tab.resourceId === activeId
          return <div key={tab.resourceId} className={`flex shrink-0 items-center border-r border-[var(--border)] ${active ? 'bg-[var(--background)]' : ''}`}>
            <button type="button" role="tab" aria-selected={active} aria-controls={`workspace-panel-${tab.resourceId}`} onClick={() => void activate(tab.resourceId)} className={`min-h-11 max-w-52 truncate px-4 text-left text-xs font-medium ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}><span className="mr-2 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{tab.type}</span>{tab.title}</button>
            <button type="button" aria-label={`Close ${tab.title}`} onClick={() => void close(tab.resourceId)} className="mr-2 inline-flex h-7 w-7 items-center justify-center text-base text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]">×</button>
          </div>
        })}
      </div>

      <div className="mt-4 border-b border-[var(--border)] pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Resources</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {resources.map((resource) => <button key={resource.id} type="button" onClick={() => void open(resource)} className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs hover:bg-[var(--surface-secondary)]">{resource.title}</button>)}
          {resources.length === 0 ? <p className="text-sm text-[var(--muted-foreground)]">Add a resource to open it as a tab.</p> : null}
        </div>
      </div>

      <div id={activeId ? `workspace-panel-${activeId}` : undefined} role={activeId ? 'tabpanel' : undefined} className="mt-6 overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        {loading ? <div className="flex min-h-[300px] items-center justify-center text-sm text-[var(--muted-foreground)]">Loading resource…</div> : null}
        {error ? <div role="alert" className="p-8 text-sm text-[var(--error)]">{error}</div> : null}
        {!loading && !error && viewer ? <><header className="flex flex-col gap-2 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{viewer.title}</h2>{viewer.description ? <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{viewer.description}</p> : null}</div><span className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{viewer.type}</span></header><Preview resource={viewer} /></> : null}
        {!activeId && !loading ? <div className="p-10 text-center"><p className="text-sm font-medium">No resource is open</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Select a resource above to open it as an internal tab.</p></div> : null}
      </div>
    </section>
  )
}
