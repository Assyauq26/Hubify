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
    getResourceViewer(resourceId).then((result) => {
      if (!cancelled) {
        setViewer(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [resourceId, type])

  if (type !== 'file' && type !== 'link') return null
  if (loading) return <div className="flex min-h-[55vh] items-center justify-center p-8 text-sm text-[var(--muted-foreground)]">Preparing preview…</div>
  if (!viewer?.ok) return <div className="p-8"><p className="text-sm font-medium">Preview unavailable</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{viewer?.error ?? 'Could not prepare this resource.'}</p><a href={`/dashboard/resources/${resourceId}`} className="mt-4 inline-flex text-sm font-medium underline underline-offset-2">Open resource viewer</a></div>

  const resource = viewer.resource
  const isImage = resource.mimeType?.startsWith('image/')
  const isText = resource.mimeType === 'text/plain' || resource.mimeType === 'application/json' || resource.mimeType === 'text/csv'
  const canPreviewFile = Boolean(resource.fileUrl) && (resource.mimeType === 'application/pdf' || isImage || isText)

  return <div className="min-h-[55vh]">
    {type === 'link' && resource.externalUrl ? <iframe title={title} src={resource.externalUrl} className="h-[70vh] w-full border-0" /> : null}
    {type === 'file' && canPreviewFile && resource.fileUrl ? resource.mimeType === 'application/pdf' ? <iframe title={title} src={resource.fileUrl} className="h-[70vh] w-full border-0" /> : isImage ? <div className="flex min-h-[55vh] items-center justify-center p-6 sm:p-10"><img src={resource.fileUrl} alt={resource.fileName ?? title} className="max-h-[65vh] max-w-full object-contain" /></div> : <iframe title={title} src={resource.fileUrl} className="h-[70vh] w-full border-0 bg-white" /> : null}
    {(type === 'file' && !canPreviewFile) || (type === 'link' && !resource.externalUrl) ? <div className="flex min-h-[55vh] items-center justify-center p-8 text-center"><div><p className="text-sm font-medium">This resource cannot be previewed here.</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Provider security restrictions may prevent embedding.</p><div className="mt-4 flex justify-center gap-2">{resource.fileUrl ? <a href={resource.fileUrl} download={resource.fileName ?? title} className="ui-button-secondary inline-flex min-h-10 items-center">Download</a> : null}{resource.externalUrl ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="ui-button-secondary inline-flex min-h-10 items-center">Open external</a> : null}</div></div></div> : null}
  </div>
}
