'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createProjectSchema, updateProjectSchema } from '@/lib/validations'
import type { ApiResponse } from '@/types'
import type { Project } from '@/types/database'

export async function createProject(
  formData: FormData
): Promise<ApiResponse<Project>> {
  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? 'Invalid input',
    }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: parsed.data.name, description: parsed.data.description ?? null, user_id: user.id })
    .select('id, name, description, user_id, created_at, updated_at')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to create project' }
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/projects/${data.id}`)
}

export async function updateProject(
  projectId: string,
  formData: FormData
): Promise<ApiResponse<Project>> {
  const parsed = updateProjectSchema.safeParse({
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: 'Invalid input' }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('projects')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select('id, name, description, user_id, created_at, updated_at')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to update project' }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true, data }
}

export async function deleteProject(projectId: string): Promise<ApiResponse<null>> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: 'Failed to delete project' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
