'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim()
}

function parseContent(value: string) {
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid content')
    }
    return parsed
  } catch {
    throw new Error('Note content is invalid.')
  }
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

  if (error || !project) {
    throw new Error('Project not found.')
  }
}

export async function createNote(formData: FormData) {
  const { supabase, user } = await requireUser()
  const projectId = getText(formData, 'project_id')
  const title = getText(formData, 'title') || 'Untitled note'
  const content = parseContent(String(formData.get('content') ?? '{}'))

  if (!projectId) throw new Error('Project is required.')
  await verifyProjectOwnership(supabase, projectId, user.id)

  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      project_id: projectId,
      user_id: user.id,
      title,
      content,
    })
    .select('id')
    .single()

  if (error || !note) throw new Error(error?.message ?? 'Unable to create note.')
  redirect(`/dashboard/projects/${projectId}/notes/${note.id}`)
}

export async function updateNote(formData: FormData) {
  const { supabase, user } = await requireUser()
  const noteId = getText(formData, 'id')
  const projectId = getText(formData, 'project_id')
  const title = getText(formData, 'title') || 'Untitled note'
  const content = parseContent(String(formData.get('content') ?? '{}'))

  if (!noteId || !projectId) throw new Error('Note and project are required.')
  await verifyProjectOwnership(supabase, projectId, user.id)

  const { error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', noteId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect(`/dashboard/projects/${projectId}/notes/${noteId}`)
}

export async function deleteNote(formData: FormData) {
  const { supabase, user } = await requireUser()
  const noteId = getText(formData, 'id')
  const projectId = getText(formData, 'project_id')

  if (!noteId || !projectId) throw new Error('Note and project are required.')
  await verifyProjectOwnership(supabase, projectId, user.id)

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect(`/dashboard/projects/${projectId}`)
}
