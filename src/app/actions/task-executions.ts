'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { TaskExecution, TaskExecutionUpdate } from '@/types/database'

const uuidSchema = z.string().uuid()

// ---------------------------------------------------------------------------
// createExecution — insert a new pending execution row
// ---------------------------------------------------------------------------
export async function createExecution(
  taskId: string
): Promise<{ success: true; data: TaskExecution } | { success: false; error: string }> {
  const parsed = uuidSchema.safeParse(taskId)
  if (!parsed.success) return { success: false, error: 'Invalid task ID' }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('task_executions')
    .insert({
      task_id: taskId,
      user_id: user.id,
      status: 'pending',
    })
    .select('id, task_id, user_id, status, prompt_tokens, completion_tokens, total_tokens, result, error, started_at, completed_at, created_at')
    .single()

  if (error || !data) return { success: false, error: 'Failed to create execution' }
  return { success: true, data: data as TaskExecution }
}

// ---------------------------------------------------------------------------
// updateExecution — patch an execution by ID (status, tokens, result, error)
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  status: z.enum(['pending', 'running', 'done', 'failed']).optional(),
  prompt_tokens: z.number().int().nonnegative().nullable().optional(),
  completion_tokens: z.number().int().nonnegative().nullable().optional(),
  result: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
})

export async function updateExecution(
  executionId: string,
  updates: TaskExecutionUpdate
): Promise<{ success: true; data: TaskExecution } | { success: false; error: string }> {
  const idParsed = uuidSchema.safeParse(executionId)
  if (!idParsed.success) return { success: false, error: 'Invalid execution ID' }

  const updateParsed = updateSchema.safeParse(updates)
  if (!updateParsed.success) return { success: false, error: 'Invalid update fields' }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('task_executions')
    .update(updateParsed.data)
    .eq('id', executionId)
    .eq('user_id', user.id)
    .select('id, task_id, user_id, status, prompt_tokens, completion_tokens, total_tokens, result, error, started_at, completed_at, created_at')
    .single()

  if (error || !data) return { success: false, error: 'Failed to update execution' }
  return { success: true, data: data as TaskExecution }
}

// ---------------------------------------------------------------------------
// getTokenHistory — last 30 days of done executions for this user
// ---------------------------------------------------------------------------
export async function getTokenHistory(
  days = 30
): Promise<{ success: true; data: TaskExecution[] } | { success: false; error: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('task_executions')
    .select('id, task_id, user_id, status, prompt_tokens, completion_tokens, total_tokens, result, error, started_at, completed_at, created_at')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return { success: false, error: 'Failed to fetch token history' }
  return { success: true, data: (data ?? []) as TaskExecution[] }
}
