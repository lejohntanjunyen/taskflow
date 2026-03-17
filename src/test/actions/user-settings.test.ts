import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Shared mutable state
// ---------------------------------------------------------------------------
const state = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
  dbResult: { data: null as unknown, error: null as unknown },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: vi.fn().mockReturnValue([]), set: vi.fn() }),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockImplementation(async () => {
    const single = vi.fn().mockImplementation(() => Promise.resolve(state.dbResult))

    // select().eq().single()  — for getSettings
    const eq1select = vi.fn().mockReturnValue({ single })
    const selectMock = vi.fn().mockReturnValue({ eq: eq1select })

    // upsert().select().single()  — for updateDailyBudget
    const selectForUpsert = vi.fn().mockReturnValue({ single })
    const upsertMock = vi.fn().mockReturnValue({ select: selectForUpsert })

    return {
      auth: {
        getUser: vi.fn().mockImplementation(() =>
          Promise.resolve({ data: { user: state.user }, error: null })
        ),
      },
      from: vi.fn().mockReturnValue({
        select: selectMock,
        upsert: upsertMock,
      }),
    }
  }),
}))

import { getSettings, updateDailyBudget } from '@/app/actions/user-settings'

const MOCK_USER = { id: 'af9fea59-5792-470c-adad-88cd0955f9e3', email: 'user@example.com' }

const MOCK_SETTINGS = {
  user_id: MOCK_USER.id,
  daily_token_budget: 100000,
  share_execution_data: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

beforeEach(() => {
  state.user = MOCK_USER
  state.dbResult = { data: null, error: null }
})

// ---------------------------------------------------------------------------
// getSettings
// ---------------------------------------------------------------------------
describe('getSettings', () => {
  it('returns error when unauthenticated', async () => {
    state.user = null
    const result = await getSettings()
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error when DB query fails', async () => {
    state.dbResult = { data: null, error: { message: 'not found' } }
    const result = await getSettings()
    expect(result).toMatchObject({ success: false })
  })

  it('returns user settings on success', async () => {
    state.dbResult = { data: MOCK_SETTINGS, error: null }
    const result = await getSettings()
    expect(result).toMatchObject({ success: true, data: MOCK_SETTINGS })
  })

  it('returned settings include daily_token_budget and share_execution_data', async () => {
    state.dbResult = { data: MOCK_SETTINGS, error: null }
    const result = await getSettings()
    if (result.success) {
      expect(result.data).toHaveProperty('daily_token_budget')
      expect(result.data).toHaveProperty('share_execution_data')
    }
  })
})

// ---------------------------------------------------------------------------
// updateDailyBudget
// ---------------------------------------------------------------------------
describe('updateDailyBudget', () => {
  it('returns error when unauthenticated', async () => {
    state.user = null
    const result = await updateDailyBudget(50000)
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error for budget <= 0', async () => {
    const result = await updateDailyBudget(0)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error for negative budget', async () => {
    const result = await updateDailyBudget(-1000)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error for non-integer budget', async () => {
    const result = await updateDailyBudget(1000.5)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error when DB upsert fails', async () => {
    state.dbResult = { data: null, error: { message: 'upsert failed' } }
    const result = await updateDailyBudget(50000)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with updated settings', async () => {
    const updated = { ...MOCK_SETTINGS, daily_token_budget: 50000 }
    state.dbResult = { data: updated, error: null }
    const result = await updateDailyBudget(50000)
    expect(result).toMatchObject({ success: true, data: updated })
  })
})
