'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { UserSettings } from '@/types/database'

// ---------------------------------------------------------------------------
// getSettings — fetch (or auto-create) settings for the current user
// ---------------------------------------------------------------------------
export async function getSettings(): Promise<
  { success: true; data: UserSettings } | { success: false; error: string }
> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('user_settings')
    .select('user_id, daily_token_budget, share_execution_data, created_at, updated_at')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return { success: false, error: 'Failed to fetch settings' }
  return { success: true, data: data as UserSettings }
}

// ---------------------------------------------------------------------------
// updateDailyBudget — upsert the daily_token_budget for the current user
// ---------------------------------------------------------------------------
const budgetSchema = z.number().int().positive()

export async function updateDailyBudget(
  budget: number
): Promise<{ success: true; data: UserSettings } | { success: false; error: string }> {
  const parsed = budgetSchema.safeParse(budget)
  if (!parsed.success) return { success: false, error: 'Budget must be a positive integer' }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        daily_token_budget: parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('user_id, daily_token_budget, share_execution_data, created_at, updated_at')
    .single()

  if (error || !data) return { success: false, error: 'Failed to update budget' }
  return { success: true, data: data as UserSettings }
}
