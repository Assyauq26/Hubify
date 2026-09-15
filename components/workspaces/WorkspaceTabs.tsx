'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { markResourceOpened } from '@/lib/resources/actions'
import { WorkspaceListEditor } from '@/components/resources/WorkspaceListEditor'
import { WorkspaceNoteEditor } from '@/components/resources/WorkspaceNoteEditor'
import { WorkspaceTableEditor } from '@/components/resources/WorkspaceTableEditor'
import { WorkspaceResourcePanel } from '@/components/workspaces/WorkspaceResourcePanel'
import type { ResourceType } from '@/lib/resources/types'

export type WorkspaceTab = { resourceId: string; title: string; type: ResourceType; dirty?: boolean }
export type WorkspaceResourceSummary = { id: string; title: string; type: ResourceType }
type Props = { workspaceId: string; resources: WorkspaceResourceSummary[] }

const storageKey = (workspaceId: string) => `hubify:workspace-tabs:${workspaceId}`
const filters: Array<{ value: ResourceType | 'all'; label: string }> = [
  { value: 'all', label: 'All resources' }, { value: 'file', label: 'Files' }, { value: 'link', label: 'Links' },
  { value: 'note', label: 'Notes' }, { value: 'table', label: 'Tables' }, { value: 'list', label: 'Lists' },
]

function readStored(workspaceId: string) {
  try {
    const raw = window.localStorage.getItem(storageKey(workspaceId))
    if (!raw) return { tabs: [] as WorkspaceTab[], activeId: null as string | null }
    const parsed = JSON.parse(raw) as { tabs?: WorkspaceTab[]; activeId?: string | null }
    return { tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [], activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null }
  } catch { return { tabs: [], activeId: null } }
}

export default function WorkspaceTabs({ workspaceId, resources }: Props) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ResourceType | 'all'>('all')
  const [hydrated, setHydrated] = useState(false)
  const resourceMap = useMemo(() => new Map(resources.map((resource) => [resource.id, resource])), [resources])
  const filteredResources = useMemo(() => filter === 'all' ? resources : resources.filter((resource) => resource.type === filter), [filter, resources])

  useEffect(() => {
    const stored = readStored(workspaceId)
    const validTabs = stored.tabs.filter((tab) => resourceMap.has(tab.resourceId)).map((tab) => ({ ...tab, title: resourceMap.get(tab.resourceId)!.title, type: resourceMap.get(tab.resourceId)!.type }))
    setTabs(validTabs)
    setActiveId(validTabs.some((tab) => tab.resourceId === stored.activeId) ? stored.activeId : validTabs[0]?.resourceId ?? null)
    setHydrated(true)
  }, [workspaceId, resourceMap])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(storageKey(workspaceId), JSON.stringify({ tabs, activeId }))
  }, [activeId, hydrated, tabs, workspaceId])

  const activate = async (resourceId: string) => { setActiveId(resourceId); await markResourceOpened(resourceId) }
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
  const setDirty = (resourceId: string, dirty: boolean) => setTabs((current) => current.map((tab) => tab.resourceId === resourceId ? { ...tab, dirty } : tab))
  const updateTitle = (resourceId: string, title: string) => setTabs((current) => current.map((tab) => tab.resourceId === resourceId ? { ...tab, title: title || 'Untitled resource' } : tab))
  const activeResource = activeId ? resourceMap.get(activeId) : null

  return <section aria-label="Workspace tabs" className="mt-6">
    <div role="tablist" aria-label="Open resources" className="flex min-h-11 items-stretch overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)]">
      {tabs.map((tab) => { const active = tab.resourceId === activeId; return <div key={tab.resourceId} className={`flex shrink-0 items-center border-r border-[var(--border)] ${active ? 'bg-[var(--background)]' : 'bg-[var(--surface)]'}`}>
        <button type="button" role="tab" aria-selected={active} aria-controls={`workspace-panel-${tab.resourceId}`} onClick={() => void activate(tab.resourceId)} className={`min-h-11 max-w-48 truncate px-4 text-left text-xs font-medium sm:max-w-64 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}><span className="mr-2 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{tab.type}</span>{tab.title}{tab.dirty ? <span className="ml-1" aria-label="Unsaved changes">•</span> : null}</button>
        <button type="button" aria-label={`Close ${tab.title}`} onClick={() => void close(tab.resourceId)} className="mr-2 inline-flex h-7 w-7 items-center justify-center text-base text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]">×</button>
      </div> })}
      <Link href={`/dashboard/workspaces/${workspaceId}/resources/new`} className="ml-auto flex shrink-0 items-center px-3 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">+ Add</Link>
    </div>

    <nav aria-label="Workspace resource filters" className="mt-4 flex gap-1 overflow-x-auto border-b border-[var(--border)] pb-0">
      {filters.map((item) => { const active = filter === item.value; return <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-current={active ? 'page' : undefined} className={`min-h-10 shrink-0 border-b-2 px-2 text-xs font-medium ${active ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>{item.label}</button> })}
    </nav>

    <div className="mt-5">
      <div className="flex items-center justify-between gap-4"><p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Resources</p><span className="text-xs text-[var(--muted-foreground)]">{filteredResources.length}</span></div>
      <div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
        {filteredResources.map((resource) => <button key={resource.id} type="button" onClick={() => void open(resource)} className="group flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-[var(--surface-secondary)] sm:px-5"><span className="min-w-0 truncate text-sm font-medium">{resource.title}</span><span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{resource.type}</span></button>)}
        {filteredResources.length === 0 ? <div className="p-8 text-center"><p className="text-sm font-medium">No resources in this view</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Create a resource to start working here.</p></div> : null}
      </div>
    </div>

    {activeResource ? <div id={`workspace-panel-${activeId}`} role="tabpanel" aria-label={activeResource.title} className="mt-6 overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      {activeResource.type === 'note' ? <WorkspaceNoteEditor resourceId={activeId!} workspaceId={workspaceId} onDirtyChange={(dirty) => setDirty(activeId!, dirty)} onTitleChange={(title) => updateTitle(activeId!, title)} /> : null}
      {activeResource.type === 'table' ? <WorkspaceTableEditor resourceId={activeId!} workspaceId={workspaceId} onDirtyChange={(dirty) => setDirty(activeId!, dirty)} onTitleChange={(title) => updateTitle(activeId!, title)} /> : null}
      {activeResource.type === 'list' ? <WorkspaceListEditor resourceId={activeId!} workspaceId={workspaceId} onDirtyChange={(dirty) => setDirty(activeId!, dirty)} onTitleChange={(title) => updateTitle(activeId!, title)} /> : null}
      {activeResource.type === 'file' || activeResource.type === 'link' ? <WorkspaceResourcePanel resourceId={activeId!} type={activeResource.type} title={activeResource.title} /> : null}
    </div> : <div className="mt-6 border border-dashed border-[var(--border-strong)] p-8 text-center"><p className="text-sm font-medium">No resource is open</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Select a resource below to open it as an internal tab.</p></div>}
  </section>
}
