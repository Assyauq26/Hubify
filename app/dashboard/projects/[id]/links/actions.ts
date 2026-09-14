'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim()
}

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

async function verifyProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string,
) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !project) throw new Error('Project not found.')
}

function normalizeUrl(value: string) {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS links are supported.')
  }
  return url.toString()
}

export async function createLink(formData: FormData) {
  const { supabase, user } = await requireUser()
  const projectId = getText(formData, 'project_id')
  const title = getText(formData, 'title')
  const rawUrl = getText(formData, 'url')
  const description = getText(formData, 'description') || null

  if (!projectId || !title || !rawUrl) throw new Error('Title and URL are required.')
  await verifyProjectOwnership(supabase, projectId, user.id)

  let url: string
  try {
    url = normalizeUrl(rawUrl)
  } catch {
    throw new Error('Please enter a valid HTTP or HTTPS URL.')
  }

  const { data: link, error } = await supabase
    .from('links')
    .insert({ project_id: projectId, user_id: user.id, title, url, description })
    .select('id')
    .single()

  if (error || !link) throw new Error(error?.message ?? 'Unable to create link.')
  redirect(`/dashboard/projects/${projectId}/links/${link.id}`)
}

export async function updateLink(formData: FormData) {
  const { supabase, user } = await requireUser()
  const linkId = getText(formData, 'id')
  const projectId = getText(formData, 'project_id')
  const title = getText(formData, 'title')
  const rawUrl = getText(formData, 'url')
  const description = getText(formData, 'description') || null

  if (!linkId || !projectId || !title || !rawUrl) throw new Error('Title and URL are required.')
  await verifyProjectOwnership(supabase, projectId, user.id)

  let url: string
  try {
    url = normalizeUrl(rawUrl)
  } catch {
    throw new Error('Please enter a valid HTTP or HTTPS URL.')
  }

  const { error } = await supabase
    .from('links')
    .update({ title, url, description })
    .eq('id', linkId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect(`/dashboard/projects/${projectId}/links/${linkId}`)
}

export async function deleteLink(formData: FormData) {
  const { supabase, user } = await requireUser()
  const linkId = getText(formData, 'id')
  const projectId = getText(formData, 'project_id')

  if (!linkId || !projectId) throw new Error('Link and project are required.')
  await verifyProjectOwnership(supabase, projectId, user.id)

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', linkId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect(`/dashboard/projects/${projectId}`)
}
