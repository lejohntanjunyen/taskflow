'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { TaskTag } from '@/types/database'

const ALLOWED_TAGS: [TaskTag, ...TaskTag[]] = [
  'migration', 'auth', 'tests', 'api', 'form', 'ui', 'docs', 'config',
  'deploy', 'database', 'security', 'performance', 'refactor',
  'integration', 'realtime', 'storage', 'email', 'payments',
  'analytics', 'onboarding', 'search',
]

const upsertTagsSchema = z.object({
  taskId: z.string().uuid(),
  tags: z.array(z.enum(ALLOWED_TAGS)).max(5),
})

// ---------------------------------------------------------------------------
// upsertTags — delete existing tags for a task, then insert new ones
// ---------------------------------------------------------------------------
export async function upsertTags(
  taskId: string,
  tags: TaskTag[]
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = upsertTagsSchema.safeParse({ taskId, tags })
  if (!parsed.success) return { success: false, error: 'Invalid task ID or tags' }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Delete existing tags for this task (owned by this user via RLS)
  const { error: deleteError } = await supabase
    .from('task_tags')
    .delete()
    .eq('task_id', taskId)

  if (deleteError) return { success: false, error: 'Failed to clear existing tags' }

  if (tags.length === 0) return { success: true }

  const rows = tags.map((tag) => ({ task_id: taskId, tag }))
  const { error: insertError } = await supabase.from('task_tags').insert(rows)

  if (insertError) return { success: false, error: 'Failed to insert tags' }
  return { success: true }
}
