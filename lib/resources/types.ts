export const RESOURCE_TYPES = ['file', 'link', 'note', 'table', 'list'] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]

export type ResourceMetadata = Record<string, unknown>

export interface Resource {
  id: string
  workspace_id: string
  user_id: string
  type: ResourceType
  title: string
  description: string | null
  metadata: ResourceMetadata
  is_favorite: boolean
  last_opened_at: string | null
  created_at: string
  updated_at: string
}

export function isResourceType(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value)
}
