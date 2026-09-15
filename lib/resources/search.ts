import { createClient } from '@/lib/supabase/server'
import type { ResourceType } from './types'

export type ResourceSearchResult = {
  id: string
  workspaceId: string
  workspaceName: string
  type: ResourceType
  title: string
  description: string | null
  isFavorite: boolean
  updatedAt: string
}

export async function searchResources(userId: string, term: string, type?: ResourceType) {
  const supabase = await createClient()
  const normalized = term.trim().slice(0, 120)
  let query = supabase
    .from('resources')
    .select('id, workspace_id, type, title, description, is_favorite, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(100)

  if (type) query = query.eq('type', type)

  if (normalized) {
    const pattern = `%${normalized}%`
    const [{ data: titleMatches, error: titleError }, { data: descriptionMatches, error: descriptionError }] = await Promise.all([
      query.ilike('title', pattern),
      supabase.from('resources').select('id, workspace_id, type, title, description, is_favorite, updated_at').eq('user_id', userId).eq(type ? 'type' : 'user_id', type ?? userId).ilike('description', pattern).order('updated_at', { ascending: false }).limit(100),
    ])
    if (titleError || descriptionError) return { data: [] as ResourceSearchResult[], error: titleError ?? descriptionError }
    const merged = new Map<string, typeof titleMatches[number]>()
    for (const item of [...(titleMatches ?? []), ...(descriptionMatches ?? [])]) merged.set(item.id, item)
    const items = [...merged.values()]
    return await hydrateSearchResults(supabase, items)
  }

  const { data, error } = await query
  if (error) return { data: [] as ResourceSearchResult[], error }
  return await hydrateSearchResults(supabase, data ?? [])
}

async function hydrateSearchResults(supabase: Awaited<ReturnType<typeof createClient>>, items: Array<{ id: string; workspace_id: string; type: string; title: string; description: string | null; is_favorite: boolean; updated_at: string }>) {
  const workspaceIds = [...new Set(items.map((item) => item.workspace_id))]
  const { data: workspaces, error } = workspaceIds.length
    ? await supabase.from('workspaces').select('id, name').in('id', workspaceIds)
    : { data: [], error: null }
  if (error) return { data: [] as ResourceSearchResult[], error }
  const names = new Map((workspaces ?? []).map((workspace) => [workspace.id, workspace.name]))
  const data = items
    .filter((item): item is typeof item & { type: ResourceType } => ['file', 'link', 'note', 'table', 'list'].includes(item.type))
    .map((item) => ({ id: item.id, workspaceId: item.workspace_id, workspaceName: names.get(item.workspace_id) ?? 'Workspace', type: item.type, title: item.title, description: item.description, isFavorite: item.is_favorite, updatedAt: item.updated_at }))
  return { data, error: null }
}
