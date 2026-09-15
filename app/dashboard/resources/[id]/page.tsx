import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markResourceOpened } from '@/lib/resources/actions'
import type { ResourceMetadata } from '@/lib/resources/types'

const FILE_BUCKET = 'hubify-files'

function metadataOf(value: unknown): ResourceMetadata {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ResourceMetadata : {}
}

function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function isImageMime(value: unknown) {
  return typeof value === 'string' && value.startsWith('image/')
}

function isTextMime(value: unknown) {
  return value === 'text/plain' || value === 'application/json' || value === 'text/csv'
}

export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resource, error } = await supabase
    .from('resources')
    .select('id, workspace_id, type, title, description, metadata, is_favorite, last_opened_at, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !resource) notFound()

  await markResourceOpened(resource.id)

  const metadata = metadataOf(resource.metadata)
  const filePath = typeof metadata.storage_path === 'string' ? metadata.storage_path : null
  const mimeType = typeof metadata.mime_type === 'string' ? metadata.mime_type : ''
  const fileName = typeof metadata.file_name === 'string' ? metadata.file_name : resource.title
  let fileUrl: string | null = null

  if (resource.type === 'file' && filePath) {
    const { data } = await supabase.storage.from(FILE_BUCKET).createSignedUrl(filePath, 60 * 60)
    fileUrl = data?.signedUrl ?? null
  }

  const externalUrl = isHttpUrl(metadata.url) ? metadata.url : null
  const canPreviewFile = Boolean(fileUrl) && (mimeType === 'application/pdf' || isImageMime(mimeType) || isTextMime(mimeType))

  return (
    <div className="min-w-0 bg-[var(--background)] px-[var(--content-gutter)] py-6 text-[var(--foreground)] sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-10 items-center justify-between gap-4">
          <Link href={`/dashboard/workspaces/${resource.workspace_id}`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Workspace</Link>
          <div className="flex items-center gap-2">
            {fileUrl ? <a href={fileUrl} download={fileName} className="ui-button-secondary inline-flex min-h-10 items-center justify-center">Download</a> : null}
            {externalUrl ? <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="ui-button-secondary inline-flex min-h-10 items-center justify-center">Open external</a> : null}
          </div>
        </div>

        <header className="mt-5 border-b border-[var(--border)] pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{resource.type}</p>
              <h1 className="mt-1 break-words text-2xl font-semibold tracking-[-0.02em]">{resource.title}</h1>
              {resource.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">{resource.description}</p> : null}
            </div>
            {resource.is_favorite ? <span className="shrink-0 text-sm" aria-label="Favorite" title="Favorite">★</span> : null}
          </div>
        </header>

        <main className="mt-6 min-h-[60vh] border border-[var(--border)] bg-[var(--surface)]">
          {resource.type === 'file' && canPreviewFile && fileUrl ? (
            mimeType === 'application/pdf' ? (
              <iframe title={resource.title} src={fileUrl} className="h-[75vh] w-full border-0" />
            ) : isImageMime(mimeType) ? (
              <div className="flex min-h-[60vh] items-center justify-center p-6 sm:p-10"><img src={fileUrl} alt={fileName} className="max-h-[72vh] max-w-full object-contain" /></div>
            ) : (
              <iframe title={resource.title} src={fileUrl} className="h-[75vh] w-full border-0 bg-white" />
            )
          ) : resource.type === 'link' && externalUrl ? (
            <iframe title={resource.title} src={externalUrl} className="h-[75vh] w-full border-0" />
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center px-6 py-16 text-center">
              <div className="max-w-lg">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]">Preview unavailable</p>
                <h2 className="mt-2 text-lg font-semibold">This resource cannot be previewed here yet.</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Use the available action above to open or download it. Hubify will never bypass provider or browser security restrictions.</p>
                {!fileUrl && !externalUrl ? <p className="mt-4 text-xs text-[var(--muted-foreground)]">This resource has no external URL or uploaded file attached.</p> : null}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
