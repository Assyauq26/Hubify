'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createResource, deleteResource, finalizeFileResource, prepareFileResource } from '@/lib/resources/actions'
import type { ResourceType } from '@/lib/resources/types'
import { ResourceTypeSelector } from './ResourceTypeSelector'

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.svg,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.json'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function ResourceCreationForm({ workspaceId }: { workspaceId: string }) {
  const [type, setType] = useState<ResourceType>('file')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function selectType(nextType: ResourceType) {
    setType(nextType)
    setError(null)
    setStatus(null)
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile)
    setError(null)
    setStatus(null)
    if (nextFile && !title) setTitle(nextFile.name.replace(/\.[^/.]+$/, ''))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)

    if (!title.trim()) {
      setError('Give this resource a title.')
      return
    }

    if (type === 'link' && !/^https?:\/\//i.test(url.trim())) {
      setError('Enter a valid http:// or https:// URL.')
      return
    }

    const formData = new FormData(event.currentTarget)

    if (type !== 'file') {
      startTransition(async () => {
        const result = await createResource(formData)
        if (!result.ok) {
          setError(result.error)
          return
        }
        window.location.assign(`/dashboard/workspaces/${workspaceId}`)
      })
      return
    }

    if (!file) {
      setError('Choose a file to upload.')
      return
    }

    startTransition(async () => {
      setStatus('Preparing upload…')
      const prepared = await prepareFileResource(formData)
      if (!prepared.ok) {
        setStatus(null)
        setError(prepared.error)
        return
      }

      const supabase = createClient()
      setStatus('Uploading…')
      const { error: uploadError } = await supabase.storage
        .from('hubify-files')
        .upload(prepared.path, file, { contentType: file.type || 'application/octet-stream', upsert: false })

      if (uploadError) {
        const cleanupData = new FormData()
        cleanupData.set('id', prepared.resourceId)
        cleanupData.set('workspace_id', workspaceId)
        await deleteResource(cleanupData)
        setStatus(null)
        setError(uploadError.message)
        return
      }

      setStatus('Saving file details…')
      const finalizeData = new FormData()
      finalizeData.set('resource_id', prepared.resourceId)
      finalizeData.set('workspace_id', workspaceId)
      finalizeData.set('storage_path', prepared.path)
      const finalized = await finalizeFileResource(finalizeData)

      if (!finalized.ok) {
        await supabase.storage.from('hubify-files').remove([prepared.path])
        const cleanupData = new FormData()
        cleanupData.set('id', prepared.resourceId)
        cleanupData.set('workspace_id', workspaceId)
        await deleteResource(cleanupData)
        setStatus(null)
        setError(finalized.error)
        return
      }

      window.location.assign(`/dashboard/workspaces/${workspaceId}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-7" noValidate>
      <section>
        <p className="text-sm font-medium">Resource type</p>
        <div className="mt-3">
          <ResourceTypeSelector value={type} onChange={selectType} />
        </div>
      </section>

      {type === 'file' ? (
        <section>
          <p className="text-sm font-medium">File</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 flex min-h-36 w-full flex-col items-center justify-center border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-5 text-center hover:bg-[var(--surface-secondary)]"
          >
            <span className="text-sm font-medium">{file ? file.name : 'Choose a file'}</span>
            <span className="mt-1 text-xs text-[var(--muted-foreground)]">PDF, images, Office, CSV, TXT, or JSON · up to 100 MB</span>
            {file ? <span className="mt-3 text-xs text-[var(--muted)]">{formatBytes(file.size)} · {file.type || 'Unknown type'}</span> : null}
          </button>
          <input ref={inputRef} type="file" accept={ACCEPT} onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)} className="sr-only" />
        </section>
      ) : null}

      {type === 'link' ? (
        <label className="block text-sm font-medium">
          URL
          <input name="url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} required maxLength={2000} className="ui-input mt-2 w-full" placeholder="https://example.com" inputMode="url" autoComplete="url" />
          <span className="mt-1 block text-xs font-normal text-[var(--muted-foreground)]">Use a full http:// or https:// address.</span>
        </label>
      ) : null}

      <label className="block text-sm font-medium">
        Title
        <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} className="ui-input mt-2 w-full" placeholder={type === 'file' ? 'e.g. Monthly report' : `Name this ${type}`} />
      </label>

      <label className="block text-sm font-medium">
        Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        <textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={1000} className="ui-input mt-2 w-full resize-y" placeholder="Add context if useful." />
      </label>

      <input type="hidden" name="workspace_id" value={workspaceId} />
      <input type="hidden" name="type" value={type} />
      {file ? <><input type="hidden" name="file_name" value={file.name} /><input type="hidden" name="mime_type" value={file.type} /><input type="hidden" name="file_size" value={file.size} /></> : null}

      {error ? <div role="alert" className="border border-[var(--error)]/30 bg-[var(--error-surface)] p-4 text-sm text-[var(--error)]">{error}</div> : null}
      {status ? <div role="status" className="border border-[var(--border)] bg-[var(--surface-secondary)] p-4 text-sm text-[var(--muted-foreground)]">{status}</div> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
        <a href={`/dashboard/workspaces/${workspaceId}`} className="ui-button-secondary inline-flex min-h-10 items-center justify-center">Cancel</a>
        <button type="submit" disabled={isPending} className="ui-button-primary min-h-10 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'Saving…' : type === 'file' ? 'Upload file' : `Create ${type}`}</button>
      </div>
    </form>
  )
}
