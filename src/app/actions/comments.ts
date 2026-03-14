'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { createCommentSchema } from '@/lib/validations'
import type { ApiResponse } from '@/types'
import type { Comment } from '@/types/database'

export async function createComment(formData: FormData): Promise<ApiResponse<Comment>> {
  const parsed = createCommentSchema.safeParse({
    body: formData.get('body'),
    taskId: formData.get('taskId'),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors.body?.[0] ?? 'Invalid input',
    }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      body: parsed.data.body,
      task_id: parsed.data.taskId,
      user_id: user.id,
    })
    .select('id, body, task_id, user_id, created_at')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to create comment' }
  }

  revalidatePath(`/dashboard/projects`)
  return { success: true, data }
}

export async function deleteComment(commentId: string): Promise<ApiResponse<null>> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: 'Failed to delete comment' }
  }

  return { success: true, data: null }
}
