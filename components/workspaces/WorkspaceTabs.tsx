'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
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

  const activate = async (resourceId: string, focus = false) => {
    setActiveId(resourceId)
    if (focus) requestAnimationFrame(() => tabRefs.current[resourceId]?.focus())
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
    setTabs(nextTabs)
    setActiveId(nextActive)
    if (nextActive) await markResourceOpened(nextActive)
  }
  const setDirty = (resourceId: string, dirty: boolean) => setTabs((current) => current.map((tab) => tab.resourceId === resourceId ? { ...tab, dirty } : tab))
  const updateTitle = (resourceId: string, title: string) => setTabs((current) => current.map((tab) => tab.resourceId === resourceId ? { ...tab, title: title || 'Untitled resource' } : tab))
  const activeResource = activeId ? resourceMap.get(activeId) : null
  const moveTab = (resourceId: string, direction: 'next' | 'previous' | 'first' | 'last') => {
    const index = tabs.findIndex((tab) => tab.resourceId === resourceId)
    if (index < 0 || tabs.length < 2) return
    const target = direction === 'next' ? (index + 1) % tabs.length : direction === 'previous' ? (index - 1 + tabs.length) % tabs.length : direction === 'first' ? 0 : tabs.length - 1
    void activate(tabs[target].resourceId, true)
  }

  return (
    <section aria-label="Workspace resources" className="mt-6">
      <div role="tablist" aria-label="Open resources" className="flex min-h-12 items-stretch overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)]" onKeyDown={(event) => {
        if (!activeId) return
        if (event.key === 'ArrowRight') { event.preventDefault(); moveTab(activeId, 'next') }
        if (event.key === 'ArrowLeft') { event.preventDefault(); moveTab(activeId, 'previous') }
        if (event.key === 'Home') { event.preventDefault(); moveTab(activeId, 'first') }
        if (event.key === 'End') { event.preventDefault(); moveTab(activeId, 'last') }
      }}>
        {tabs.length ? tabs.map((tab) => {
          const active = tab.resourceId === activeId
          const panelId = `workspace-panel-${tab.resourceId}`
          return (
            <div key={tab.resourceId} className={`flex shrink-0 items-center border-r border-[var(--border)] ${active ? 'bg-[var(--background)]' : 'bg-[var(--surface)]'}`}>
              <button ref={(node) => { tabRefs.current[tab.resourceId] = node }} type="button" role="tab" id={`workspace-tab-${tab.resourceId}`} aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} onClick={() => void activate(tab.resourceId)} className={`min-h-12 max-w-56 truncate border-b-2 px-4 text-left text-xs font-medium outline-none focus-visible:border-[var(--foreground)] focus-visible:bg-[var(--surface-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset ${active ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
                <span className="mr-2 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{tab.type}</span>{tab.title}{tab.dirty ? <span className="ml-1" aria-label="Unsaved changes">•</span> : null}
              </button>
              <button type="button" aria-label={`Close ${tab.title}`} onClick={() => void close(tab.resourceId)} className="touch-target inline-flex h-11 w-11 shrink-0 items-center justify-center text-lg leading-none text-[var(--muted-foreground)] outline-none hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] focus-visible:bg-[var(--surface-secondary)] focus-visible:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset">×</button>
            </div>
          )
        }) : <span className="flex min-h-12 items-center px-4 text-xs text-[var(--muted-foreground)]">No open resources</span>}
        <Link href={`/dashboard/workspaces/${workspaceId}/resources/new`} className="ml-auto flex min-h-12 shrink-0 items-center px-4 text-xs font-medium text-[var(--muted)] outline-none hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] focus-visible:bg-[var(--surface-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset">+ Add</Link>
      </div>

      <nav aria-label="Resource type filter" className="mt-4 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {filters.map((item) => {
          const active = filter === item.value
          return <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={active} className={`min-h-11 shrink-0 border-b-2 px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset ${active ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>{item.label}</button>
        })}
      </nav>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Resources</p><p className="mt-1 text-sm text-[var(--muted)]">Select a resource to open it as a tab.</p></div><span className="shrink-0 text-xs text-[var(--muted-foreground)]">{filteredResources.length}</span></div>
        <div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
          {filteredResources.map((resource) => <button key={resource.id} type="button" onClick={() => void open(resource)} className="group flex min-h-12 w-full items-center justify-between gap-4 px-4 py-4 text-left outline-none transition-colors hover:bg-[var(--surface-secondary)] focus-visible:bg-[var(--surface-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset sm:px-5"><span className="min-w-0 truncate text-sm font-medium">{resource.title}</span><span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{resource.type}</span></button>)}
          {filteredResources.length === 0 ? <div className="p-10 text-center"><p className="text-sm font-semibold">No resources in this view</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Add a file, link, note, table, or list to start working here.</p><Link href={`/dashboard/workspaces/${workspaceId}/resources/new`} className="ui-button-secondary mt-5">Add resource</Link></div> : null}
        </div>
      </div>

      {activeResource ? <div id={`workspace-panel-${activeId}`} role="tabpanel" aria-labelledby={`workspace-tab-${activeId}`} tabIndex={0} className="mt-6 overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        {activeResource.type === 'note' ? <WorkspaceNoteEditor resourceId={activeId!} workspaceId={workspaceId} onDirtyChange={(dirty) => setDirty(activeId!, dirty)} onTitleChange={(title) => updateTitle(activeId!, title)} /> : null}
        {activeResource.type === 'table' ? <WorkspaceTableEditor resourceId={activeId!} workspaceId={workspaceId} onDirtyChange={(dirty) => setDirty(activeId!, dirty)} onTitleChange={(title) => updateTitle(activeId!, title)} /> : null}
        {activeResource.type === 'list' ? <WorkspaceListEditor resourceId={activeId!} workspaceId={workspaceId} onDirtyChange={(dirty) => setDirty(activeId!, dirty)} onTitleChange={(title) => updateTitle(activeId!, title)} /> : null}
        {activeResource.type === 'file' || activeResource.type === 'link' ? <WorkspaceResourcePanel resourceId={activeId!} type={activeResource.type} title={activeResource.title} /> : null}
      </div> : <div className="mt-6 border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-10 text-center"><p className="text-sm font-semibold">No resource is open</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Select a resource above to open it in your workspace.</p></div>}
    </section>
  )
}
