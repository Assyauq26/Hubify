export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: { id: string; user_id: string; name: string; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; description?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      notes: {
        Row: { id: string; project_id: string; user_id: string; title: string; content: Json; created_at: string; updated_at: string }
        Insert: { id?: string; project_id: string; user_id: string; title?: string; content?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; project_id?: string; user_id?: string; title?: string; content?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      links: {
        Row: { id: string; project_id: string; user_id: string; title: string; url: string; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; project_id?: string; user_id?: string; title?: string; url?: string; description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; project_id?: string; user_id?: string; title?: string; url?: string; description?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      workspaces: {
        Row: { id: string; user_id: string; name: string; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; description?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      resources: {
        Row: { id: string; workspace_id: string; user_id: string; type: string; title: string; description: string | null; metadata: Json; is_favorite: boolean; last_opened_at: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; workspace_id: string; user_id: string; type: string; title: string; description?: string | null; metadata?: Json; is_favorite?: boolean; last_opened_at?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; workspace_id?: string; user_id?: string; type?: string; title?: string; description?: string | null; metadata?: Json; is_favorite?: boolean; last_opened_at?: string | null; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: 'resources_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: false; referencedRelation: 'workspaces'; referencedColumns: ['id'] }]
      }
      workspace_project_migrations: {
        Row: { project_id: string; workspace_id: string; migrated_at: string }
        Insert: { project_id: string; workspace_id: string; migrated_at?: string }
        Update: { project_id?: string; workspace_id?: string; migrated_at?: string }
        Relationships: [
          { foreignKeyName: 'workspace_project_migrations_project_id_fkey'; columns: ['project_id']; isOneToOne: true; referencedRelation: 'projects'; referencedColumns: ['id'] },
          { foreignKeyName: 'workspace_project_migrations_workspace_id_fkey'; columns: ['workspace_id']; isOneToOne: true; referencedRelation: 'workspaces'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
