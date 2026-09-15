'use client'

import { useEffect, useMemo, useState } from 'react'
import { markResourceOpened } from '@/lib/resources/actions'
import type { ResourceType } from '@/lib/resources/types'

export type WorkspaceTab = {
  resourceId: string
  title: string
  type: ResourceType
  dirty?: boolean
}

export type WorkspaceResourceSummary = {
  id: string
  title: string
  type: ResourceType
}

type Props = {
  workspaceId: string
  resources: WorkspaceResourceSummary[]
  onActiveResourceChange?: (resourceId: string | null) => void
}

const storageKey = (workspaceId: string) => `hubify:workspace-tabs:${workspaceId}`

function readStored(workspaceId: string) {
  try {
    const raw = window.localStorage.getItem(storageKey(workspaceId))
    if (!raw) return { tabs: [] as WorkspaceTab[], activeId: null as string | null }
    const parsed = JSON.parse(raw) as { tabs?: WorkspaceTab[]; activeId?: string | null }
    return {
      tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [],
      activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null,
    }
  } catch {
    return { tabs: [] as WorkspaceTab[], activeId: null as string | null }
  }
}

export default function WorkspaceTabs({ workspaceId, resources, onActiveResourceChange }: Props) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const resourceMap = useMemo(() => new Map(resources.map((resource) => [resource.id, resource])), [resources])

  useEffect(() => {
    const stored = readStored(workspaceId)
    const validTabs = stored.tabs
      .filter((tab) => resourceMap.has(tab.resourceId))
      .map((tab) => ({ ...tab, title: resourceMap.get(tab.resourceId)!.title, type: resourceMap.get(tab.resourceId)!.type }))
    const nextActive = validTabs.some((tab) => tab.resourceId === stored.activeId) ? stored.activeId : validTabs[0]?.resourceId ?? null
    setTabs(validTabs)
    setActiveId(nextActive)
    setHydrated(true)
  }, [workspaceId, resourceMap])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(storageKey(workspaceId), JSON.stringify({ tabs, activeId }))
    onActiveResourceChange?.(activeId)
  }, [activeId, hydrated, onActiveResourceChange, tabs, workspaceId])

  const activate = async (resourceId: string) => {
    setActiveId(resourceId)
    await markResourceOpened(resourceId)
  }

  const open = async (resource: WorkspaceResourceSummary) => {
    const exists = tabs.some((tab) => tab.resourceId === resource.id)
    if (!exists) setTabs((current) => [...current, { resourceId: resource.id, title: resource.title, type: resource.type }])
    await activate(resource.id)
  }

  const close = async (resourceId: string) => {
    const tab = tabs.find((item) => item.resourceId === resourceId)
    if (!tab) return
    if (tab.dirty && !window.confirm(`Discard unsaved changes in “${tab.title}”?`)) return

    const index = tabs.findIndex((item) => item.resourceId === resourceId)
    const nextTabs = tabs.filter((item) => item.resourceId !== resourceId)
    const nextActive = activeId === resourceId
      ? nextTabs[Math.min(index, nextTabs.length - 1)]?.resourceId ?? null
      : activeId

    setTabs(nextTabs)
    setActiveId(nextActive)
    if (nextActive) await markResourceOpened(nextActive)
  }

  return (
    <section aria-label="Workspace tabs" className="mt-6">
      <div role="tablist" aria-label="Open resources" className="flex min-h-11 items-stretch overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)]">
        {tabs.map((tab) => {
          const active = tab.resourceId === activeId
          return (
            <div key={tab.resourceId} className={`flex shrink-0 items-center border-r border-[var(--border)] ${active ? 'bg-[var(--background)]' : 'bg-[var(--surface)]'}`}>
              <button
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`workspace-panel-${tab.resourceId}`}
                onClick={() => void activate(tab.resourceId)}
                className={`min-h-11 max-w-48 px-4 text-left text-xs font-medium sm:max-w-64 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >
                <span className="mr-2 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{tab.type}</span>
                <span className="align-middle">{tab.title}</span>
              </button>
              <button type="button" aria-label={`Close ${tab.title}`} onClick={() => void close(tab.resourceId)} className="mr-2 inline-flex h-7 w-7 items-center justify-center text-base text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]">×</button>
            </div>
          )
        })}
        <div className="ml-auto flex shrink-0 items-center px-2">
          <span className="px-2 text-xs text-[var(--muted-foreground)]" aria-hidden="true">+ Add</span>
        </div>
      </div>

      <div className="mt-4 border-b border-[var(--border)] pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Open resources</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {resources.map((resource) => (
            <button key={resource.id} type="button" onClick={() => void open(resource)} className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--surface-secondary)]">
              {resource.title}
            </button>
          ))}
          {resources.length === 0 ? <p className="text-sm text-[var(--muted-foreground)]">Add a resource to open it as a tab.</p> : null}
        </div>
      </div>

      {activeId ? (
        <div id={`workspace-panel-${activeId}`} role="tabpanel" aria-label={resourceMap.get(activeId)?.title ?? 'Active resource'} className="mt-6">
          <p className="text-sm text-[var(--muted-foreground)]">Active resource: <span className="font-medium text-[var(--foreground)]">{resourceMap.get(activeId)?.title}</span></p>
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-[var(--border-strong)] p-8 text-center">
          <p className="text-sm font-medium">No resource is open</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Select a resource below to open it as an internal tab.</p>
        </div>
      )}
    </section>
  )
}
