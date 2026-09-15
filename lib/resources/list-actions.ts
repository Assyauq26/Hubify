'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

type ListItem = { id: string; text: string; completed: boolean }
type ListData = { items: ListItem[] }

const defaultList: ListData = {
  items: [
    { id: 'item-1', text: 'First item', completed: false },
    { id: 'item-2', text: 'Second item', completed: false },
    { id: 'item-3', text: 'Third item', completed: false },
  ],
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function sanitizeList(value: unknown): ListData {
  const source = asObject(value)
  const items = Array.isArray(source.items) ? source.items.flatMap((item, index): ListItem[] => {
    const sourceItem = asObject(item)
    const id = typeof sourceItem.id === 'string' && sourceItem.id ? sourceItem.id : `item-${index + 1}`
    const text = typeof sourceItem.text === 'string' ? sourceItem.text : ''
    const completed = sourceItem.completed === true
    return [{ id, text, completed }]
  }) : []
  return { items: items.length ? items : defaultList.items }
}

export async function getWorkspaceList(resourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const { data: resource, error } = await supabase
    .from('resources')
    .select('id, workspace_id, title, metadata, updated_at')
    .eq('id', resourceId)
    .eq('user_id', user.id)
    .eq('type', 'list')
    .single()

  if (error || !resource) return { ok: false as const, error: 'List not found.' }
  const metadata = asObject(resource.metadata)
  return {
    ok: true as const,
    list: {
      id: resource.id,
      workspaceId: resource.workspace_id,
      title: resource.title,
      data: sanitizeList(metadata.list),
      updatedAt: resource.updated_at,
    },
  }
}

export async function saveWorkspaceList(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }

  const resourceId = String(formData.get('resource_id') ?? '').trim()
  const workspaceId = String(formData.get('workspace_id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const rawData = String(formData.get('data') ?? '')
  if (!resourceId || !workspaceId || !title || !rawData) return { ok: false as const, error: 'List id, workspace, title, and data are required.' }

  let parsed: unknown
  try { parsed = JSON.parse(rawData) } catch { return { ok: false as const, error: 'List data is invalid.' } }
  const list = sanitizeList(parsed)

  const { data: resource, error: findError } = await supabase
    .from('resources')
    .select('id, metadata')
    .eq('id', resourceId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('type', 'list')
    .single()

  if (findError || !resource) return { ok: false as const, error: 'List not found.' }

  const metadata = asObject(resource.metadata)
  const { error } = await supabase
    .from('resources')
    .update({ title, metadata: { ...metadata, list: list as unknown as Json } })
    .eq('id', resourceId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('type', 'list')

  if (error) return { ok: false as const, error: error.message }
  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  revalidatePath(`/dashboard/resources/${resourceId}`)
  return { ok: true as const, updatedAt: new Date().toISOString() }
}
