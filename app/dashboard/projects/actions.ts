'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!name) {
    throw new Error('Project name is required.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description: description || null, user_id: user.id })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/dashboard/projects/${data.id}`)
}

export async function updateProject(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!id || !name) {
    throw new Error('Project name is required.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('projects')
    .update({ name, description: description || null })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/dashboard/projects/${id}`)
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get('id') ?? '')

  if (!id) {
    throw new Error('Project id is required.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard')
}
