'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isResourceType } from './types'

const FILE_BUCKET = 'hubify-files'
const MAX_FILE_SIZE = 100 * 1024 * 1024

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function safeFileName(fileName: string) {
  const normalized = fileName.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return normalized || 'file'
}

export async function createResource(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const workspaceId = readText(formData, 'workspace_id')
  const title = readText(formData, 'title')
  const type = readText(formData, 'type')
  const description = readText(formData, 'description') || null

  if (!workspaceId || !title || !isResourceType(type)) return { ok: false as const, error: 'Resource type, workspace, and title are required.' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) return { ok: false as const, error: 'Workspace not found.' }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      title,
      description,
      type,
      metadata: {},
    })
    .select('id')
    .single()

  if (error || !data) return { ok: false as const, error: error?.message ?? 'Could not create the resource.' }

  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  return { ok: true as const, resourceId: data.id, workspaceId }
}

export async function prepareFileResource(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const workspaceId = readText(formData, 'workspace_id')
  const title = readText(formData, 'title')
  const description = readText(formData, 'description') || null
  const fileName = readText(formData, 'file_name')
  const mimeType = readText(formData, 'mime_type') || 'application/octet-stream'
  const fileSize = Number(formData.get('file_size') ?? 0)

  if (!workspaceId || !title || !fileName || !Number.isFinite(fileSize) || fileSize <= 0) {
    return { ok: false as const, error: 'File name, title, and size are required.' }
  }

  if (fileSize > MAX_FILE_SIZE) {
    return { ok: false as const, error: 'Files must be 100 MB or smaller.' }
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) return { ok: false as const, error: 'Workspace not found.' }

  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      title,
      description,
      type: 'file',
      metadata: {
        file_name: fileName,
        mime_type: mimeType,
        file_size: fileSize,
        extension: fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() ?? '' : '',
        storage_bucket: FILE_BUCKET,
        upload_status: 'pending',
      },
    })
    .select('id')
    .single()

  if (error || !resource) {
    return { ok: false as const, error: error?.message ?? 'Could not create the file resource.' }
  }

  const path = `${user.id}/${workspaceId}/${resource.id}/${safeFileName(fileName)}`
  return { ok: true as const, resourceId: resource.id, path, workspaceId }
}

export async function finalizeFileResource(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const resourceId = readText(formData, 'resource_id')
  const workspaceId = readText(formData, 'workspace_id')
  const storagePath = readText(formData, 'storage_path')
  const expectedPrefix = `${user.id}/${workspaceId}/${resourceId}/`

  if (!resourceId || !workspaceId || !storagePath || !storagePath.startsWith(expectedPrefix)) {
    return { ok: false as const, error: 'Upload information is invalid.' }
  }

  const { data: resource } = await supabase
    .from('resources')
    .select('id, metadata')
    .eq('id', resourceId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('type', 'file')
    .single()

  if (!resource) return { ok: false as const, error: 'File resource not found.' }

  const metadata = resource.metadata && typeof resource.metadata === 'object' && !Array.isArray(resource.metadata)
    ? resource.metadata as Record<string, unknown>
    : {}

  const { error } = await supabase
    .from('resources')
    .update({
      metadata: {
        ...metadata,
        storage_bucket: FILE_BUCKET,
        storage_path: storagePath,
        upload_status: 'ready',
      },
    })
    .eq('id', resourceId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  return { ok: true as const, resourceId }
}

export async function deleteResource(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const }

  const id = readText(formData, 'id')
  const workspaceId = readText(formData, 'workspace_id')
  if (!id || !workspaceId) return { ok: false as const }

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)

  if (error) return { ok: false as const, error: error.message }
  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  return { ok: true as const }
}

export async function toggleResourceFavorite(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = readText(formData, 'id')
  const workspaceId = readText(formData, 'workspace_id')
  if (!id || !workspaceId) return

  const { data: resource } = await supabase
    .from('resources')
    .select('is_favorite')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!resource) return

  await supabase
    .from('resources')
    .update({ is_favorite: !resource.is_favorite })
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
}

export async function markResourceOpened(resourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('resources')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', resourceId)
    .eq('user_id', user.id)
}
