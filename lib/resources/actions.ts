import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isResourceType } from './types'

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createResource(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workspaceId = readText(formData, 'workspace_id')
  const title = readText(formData, 'title')
  const type = readText(formData, 'type')
  const description = readText(formData, 'description') || null

  if (!workspaceId || !title || !isResourceType(type)) return

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) return

  const { data } = await supabase
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

  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  if (data) redirect(`/dashboard/workspaces/${workspaceId}`)
}

export async function toggleResourceFavorite(formData: FormData) {
  'use server'

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
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('resources')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', resourceId)
    .eq('user_id', user.id)
}
