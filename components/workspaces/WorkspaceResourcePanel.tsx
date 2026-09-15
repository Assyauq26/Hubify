'use client'

import { useEffect, useState } from 'react'
import { getResourceViewer } from '@/lib/resources/actions'
import type { ResourceType } from '@/lib/resources/types'

type Props = { resourceId: string; type: ResourceType; title: string }

export function WorkspaceResourcePanel({ resourceId, type, title }: Props) {
  const [viewer, setViewer] = useState<Awaited<ReturnType<typeof getResourceViewer>> | null>(null)
  const [loading, setLoading] = useState(type === 'file' || type === 'link')

  useEffect(() => {
    if (type !== 'file' && type !== 'link') return
    let cancelled = false
    setLoading(true)
    setViewer(null)
    void getResourceViewer(resourceId).then((result) => {
      if (!cancelled) { setViewer(result); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [resourceId, type])

  if (type !== 'file' && type !== 'link') return null
  if (loading) return <div className="flex min-h-[55vh] items-center justify-center bg-[var(--surface-secondary)] p-8 text-sm text-[var(--muted-foreground)]" role="status">Preparing preview…</div>
  if (!viewer?.ok) return <div className="p-8"><p className="text-sm font-semibold">Preview unavailable</p><p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">{viewer?.error ?? 'Could not prepare this resource.'}</p><a href={`/dashboard/resources/${resourceId}`} className="ui-button-secondary mt-5 inline-flex min-h-11 items-center justify-center">Open resource viewer</a></div>

  const resource = viewer.resource
  const isImage = resource.mimeType?.startsWith('image/')
  const isText = resource.mimeType === 'text/plain' || resource.mimeType === 'application/json' || resource.mimeType === 'text/csv'
  const canPreviewFile = Boolean(resource.fileUrl) && (resource.mimeType === 'application/pdf' || isImage || isText)

  return <div className="min-h-[55vh]">
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
      <p className="min-w-0 truncate text-xs text-[var(--muted-foreground)]">{type === 'file' ? resource.fileName ?? title : resource.externalUrl}</p>
      <div className="flex shrink-0 items-center gap-2">
        {resource.fileUrl ? <a href={resource.fileUrl} download={resource.fileName ?? title} className="ui-button-secondary inline-flex min-h-11 items-center justify-center px-3 text-xs">Download</a> : null}
        {resource.externalUrl ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="ui-button-secondary inline-flex min-h-11 items-center justify-center px-3 text-xs">Open external</a> : null}
      </div>
    </div>

    {type === 'link' && resource.externalUrl ? <iframe title={title} src={resource.externalUrl} className="h-[70vh] w-full border-0" /> : null}
    {type === 'file' && canPreviewFile && resource.fileUrl ? resource.mimeType === 'application/pdf' ? <iframe title={title} src={resource.fileUrl} className="h-[70vh] w-full border-0" /> : isImage ? <div className="flex min-h-[55vh] items-center justify-center p-6 sm:p-10"><img src={resource.fileUrl} alt={resource.fileName ?? title} className="max-h-[65vh] max-w-full object-contain" /></div> : <iframe title={title} src={resource.fileUrl} className="h-[70vh] w-full border-0 bg-white" /> : null}
    {(type === 'file' && !canPreviewFile) || (type === 'link' && !resource.externalUrl) ? <div className="flex min-h-[55vh] items-center justify-center p-8 text-center"><div><p className="text-sm font-semibold">This resource cannot be previewed here.</p><p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">Some providers block embedded views for security. Use an external view or download the file instead.</p><div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">{resource.fileUrl ? <a href={resource.fileUrl} download={resource.fileName ?? title} className="ui-button-secondary inline-flex min-h-11 items-center justify-center">Download</a> : null}{resource.externalUrl ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="ui-button-secondary inline-flex min-h-11 items-center justify-center">Open external</a> : null}</div></div></div> : null}
  </div>
}
