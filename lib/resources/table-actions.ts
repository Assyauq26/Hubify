'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

type TableColumn = { id: string; name: string; type: 'text' | 'number' | 'boolean' }
type TableRow = Record<string, Json>
type TableData = { columns: TableColumn[]; rows: TableRow[] }

const defaultTable: TableData = {
  columns: [
    { id: 'column-1', name: 'Column 1', type: 'text' },
    { id: 'column-2', name: 'Column 2', type: 'text' },
    { id: 'column-3', name: 'Column 3', type: 'number' },
  ],
  rows: [
    { 'column-1': '', 'column-2': '', 'column-3': null },
    { 'column-1': '', 'column-2': '', 'column-3': null },
    { 'column-1': '', 'column-2': '', 'column-3': null },
  ],
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function sanitizeTable(value: unknown): TableData {
  const source = asObject(value)
  const columns: TableColumn[] = Array.isArray(source.columns) ? source.columns.flatMap((column, index): TableColumn[] => {
    const item = asObject(column)
    const id = typeof item.id === 'string' && item.id ? item.id : `column-${index + 1}`
    const name = typeof item.name === 'string' && item.name ? item.name : `Column ${index + 1}`
    const type: TableColumn['type'] = item.type === 'number' || item.type === 'boolean' ? item.type : 'text'
    return [{ id, name, type }]
  }) : []
  const safeColumns = columns.length ? columns : defaultTable.columns
  const rows: TableRow[] = Array.isArray(source.rows) ? source.rows.map((row) => {
    const sourceRow = asObject(row)
    return Object.fromEntries(safeColumns.map((column) => {
      const cellValue = sourceRow[column.id]
      if (column.type === 'number') return [column.id, typeof cellValue === 'number' ? cellValue : cellValue === null ? null : Number(cellValue) || null]
      if (column.type === 'boolean') return [column.id, cellValue === true]
      return [column.id, typeof cellValue === 'string' ? cellValue : cellValue == null ? '' : String(cellValue)]
    })) as TableRow
  }) : []
  return { columns: safeColumns, rows }
}

export async function getWorkspaceTable(resourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }
  const { data: resource, error } = await supabase.from('resources').select('id, workspace_id, title, metadata, updated_at').eq('id', resourceId).eq('user_id', user.id).eq('type', 'table').single()
  if (error || !resource) return { ok: false as const, error: 'Table not found.' }
  const metadata = asObject(resource.metadata)
  return { ok: true as const, table: { id: resource.id, workspaceId: resource.workspace_id, title: resource.title, data: sanitizeTable(metadata.table), updatedAt: resource.updated_at } }
}

export async function saveWorkspaceTable(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'You must be signed in.' }
  const resourceId = String(formData.get('resource_id') ?? '').trim()
  const workspaceId = String(formData.get('workspace_id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const rawData = String(formData.get('data') ?? '')
  if (!resourceId || !workspaceId || !title || !rawData) return { ok: false as const, error: 'Table id, workspace, title, and data are required.' }
  let parsed: unknown
  try { parsed = JSON.parse(rawData) } catch { return { ok: false as const, error: 'Table data is invalid.' } }
  const table = sanitizeTable(parsed)
  const { data: resource, error: findError } = await supabase.from('resources').select('id, metadata').eq('id', resourceId).eq('workspace_id', workspaceId).eq('user_id', user.id).eq('type', 'table').single()
  if (findError || !resource) return { ok: false as const, error: 'Table not found.' }
  const metadata = asObject(resource.metadata)
  const { error } = await supabase.from('resources').update({ title, metadata: { ...metadata, table: table as unknown as Json } }).eq('id', resourceId).eq('workspace_id', workspaceId).eq('user_id', user.id).eq('type', 'table')
  if (error) return { ok: false as const, error: error.message }
  revalidatePath(`/dashboard/workspaces/${workspaceId}`)
  revalidatePath(`/dashboard/resources/${resourceId}`)
  return { ok: true as const, updatedAt: new Date().toISOString() }
}
