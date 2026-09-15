'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type JsonObject = Record<string, unknown>

const EMPTY_NOTE: JsonObject = { type: 'doc', content: [{ type: 'paragraph' }] }

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function objectValue(value: unknown): JsonObject | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : null
}

export async function getWorkspaceNote(resourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const { data: resource, error } = await supabase
    .from('resources')
    .select('id, workspace_id, title, description, metadata, updated_at')
    .eq('id', resourceId)
    .eq('user_id', user.id)
    .eq('type', 'note')
    .single()

  if (error || !resource) return { ok: false as const, error: 'Note not found.' }

  const metadata = objectValue(resource.metadata) ?? {}
  const content = objectValue(metadata.content) ?? EMPTY_NOTE

  return {
    ok: true as const,
    note: {
      id: resource.id,
      workspaceId: resource.workspace_id,
      title: resource.title,
      description: resource.description,
      content,
      updatedAt: resource.updated_at,
    },
  }
}

export async function saveWorkspaceNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const resourceId = readText(formData, 'resource_id')
  const workspaceId = readText(formData, 'workspace_id')
  const title = readText(formData, 'title')
  const rawContent = readText(formData, 'content')

  if (!resourceId || !workspaceId || !title || !rawContent) {
    return { ok: false as const, error: 'Note id, workspace, title, and content are required.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawContent)
  } catch {
    return { ok: false as const, error: 'Note content is invalid.' }
  }

  const content = objectValue(parsed)
  if (!content) return { ok: false as const, error: 'Note content is invalid.' }

  const { data: resource, error: findError } = await supabase
    .from('resources')
    .select('id, metadata')
    .eq('id', resourceId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('type', 'note')
    .single()

  if (findError || !resource) return { ok: false as const, error: 'Note not found.' }

  const metadata = objectValue(resource.metadata) ?? {}
  const { error } = await supabase
    .from('resources')
    .update({ title, metadata: { ...metadata, content } })
    .eq('id', resourceId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('type', 'note')

  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  revalidatePath(`/dashboard/resources/${resourceId}`)
  return { ok: true as const, updatedAt: new Date().toISOString() }
}
