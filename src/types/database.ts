// Auto-generated Supabase types — regenerate with:
// npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskType = 'code' | 'research' | 'content' | 'design' | 'subtask'
export type ExecutionStatus = 'pending' | 'running' | 'done' | 'failed'
export type TaskTag =
  | 'migration' | 'auth' | 'tests' | 'api' | 'form' | 'ui' | 'docs'
  | 'config' | 'deploy' | 'database' | 'security' | 'performance'
  | 'refactor' | 'integration' | 'realtime' | 'storage' | 'email'
  | 'payments' | 'analytics' | 'onboarding' | 'search'

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          task_type: TaskType
          due_date: string | null
          project_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          task_type?: TaskType
          due_date?: string | null
          project_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          task_type?: TaskType
          due_date?: string | null
          project_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          body: string
          task_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          body: string
          task_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          body?: string
          task_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      task_tags: {
        Row: {
          id: string
          task_id: string
          tag: TaskTag
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          tag: TaskTag
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          tag?: TaskTag
          created_at?: string
        }
        Relationships: []
      }
      task_executions: {
        Row: {
          id: string
          task_id: string
          user_id: string
          prompt_tokens: number | null
          completion_tokens: number | null
          total_tokens: number | null
          status: ExecutionStatus
          result: string | null
          error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          prompt_tokens?: number | null
          completion_tokens?: number | null
          status?: ExecutionStatus
          result?: string | null
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          prompt_tokens?: number | null
          completion_tokens?: number | null
          status?: ExecutionStatus
          result?: string | null
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          user_id: string
          daily_token_budget: number
          share_execution_data: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          daily_token_budget?: number
          share_execution_data?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          daily_token_budget?: number
          share_execution_data?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      shared_token_stats: {
        Row: {
          id: string
          task_id: string
          prompt_tokens: number | null
          completion_tokens: number | null
          total_tokens: number | null
          status: ExecutionStatus
          completed_at: string | null
          task_type: TaskType
          priority: 'low' | 'medium' | 'high'
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      task_status: 'todo' | 'in_progress' | 'done'
      task_priority: 'low' | 'medium' | 'high'
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type TaskTagRow = Database['public']['Tables']['task_tags']['Row']
export type TaskExecution = Database['public']['Tables']['task_executions']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

// Insert types
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type TaskTagInsert = Database['public']['Tables']['task_tags']['Insert']
export type TaskExecutionInsert = Database['public']['Tables']['task_executions']['Insert']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']

// Update types
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type TaskExecutionUpdate = Database['public']['Tables']['task_executions']['Update']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']
