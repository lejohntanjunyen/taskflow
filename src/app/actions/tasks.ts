'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { createTaskSchema, updateTaskStatusSchema } from '@/lib/validations'
import type { ApiResponse } from '@/types'
import type { Task, TaskType } from '@/types/database'

const TASK_TYPES: TaskType[] = ['code', 'research', 'content', 'design', 'subtask']
function toTaskType(raw: unknown): TaskType {
  const str = z.string().safeParse(raw)
  if (str.success && (TASK_TYPES as string[]).includes(str.data)) {
    return str.data as TaskType
  }
  return 'code'
}

export async function createTask(formData: FormData): Promise<ApiResponse<Task>> {
  const parsed = createTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    status: formData.get('status') || 'todo',
    priority: formData.get('priority') || 'medium',
    due_date: formData.get('due_date') || null,
    projectId: formData.get('projectId'),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Invalid input',
    }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      task_type: toTaskType(formData.get('task_type')),
      due_date: parsed.data.due_date ?? null,
      project_id: parsed.data.projectId,
      user_id: user.id,
    })
    .select('id, title, description, status, priority, task_type, due_date, project_id, user_id, created_at, updated_at')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to create task' }
  }

  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`)
  return { success: true, data }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'todo' | 'in_progress' | 'done'
): Promise<ApiResponse<Task>> {
  const parsed = updateTaskStatusSchema.safeParse({ status })

  if (!parsed.success) {
    return { success: false, error: 'Invalid status value' }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select('id, title, description, status, priority, task_type, due_date, project_id, user_id, created_at, updated_at')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to update task status' }
  }

  revalidatePath(`/dashboard/projects/${data.project_id}`)
  return { success: true, data }
}

export async function deleteTask(taskId: string): Promise<ApiResponse<null>> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: 'Failed to delete task' }
  }

  return { success: true, data: null }
}
