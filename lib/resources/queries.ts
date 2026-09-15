import { createClient } from '@/lib/supabase/server'
import type { Resource, ResourceType } from './types'

export async function listResources(workspaceId: string, userId: string, type?: ResourceType) {
  const supabase = await createClient()

  let query = supabase
    .from('resources')
    .select('id, workspace_id, user_id, type, title, description, metadata, is_favorite, last_opened_at, created_at, updated_at')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  return { data: (data ?? []) as Resource[], error }
}

export async function getResource(resourceId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('id, workspace_id, user_id, type, title, description, metadata, is_favorite, last_opened_at, created_at, updated_at')
    .eq('id', resourceId)
    .eq('user_id', userId)
    .single()

  return { data: data as Resource | null, error }
}
