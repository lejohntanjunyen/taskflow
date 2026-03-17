import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Shared mutable state
// ---------------------------------------------------------------------------
const state = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
  dbResult: { data: null as unknown, error: null as unknown },
  dbListResult: { data: null as unknown, error: null as unknown },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: vi.fn().mockReturnValue([]), set: vi.fn() }),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockImplementation(async () => {
    const single = vi.fn().mockImplementation(() => Promise.resolve(state.dbResult))
    const selectForInsert = vi.fn().mockReturnValue({ single })
    const insertMock = vi.fn().mockReturnValue({ select: selectForInsert })

    // update().eq().eq().select().single()
    const selectForUpdate = vi.fn().mockReturnValue({ single })
    const eq2update = vi.fn().mockReturnValue({ select: selectForUpdate })
    const eq1update = vi.fn().mockReturnValue({ eq: eq2update })
    const updateMock = vi.fn().mockReturnValue({ eq: eq1update })

    // select(...).eq().eq().gte().order().limit() — for getTokenHistory list query
    const limitMock = vi.fn().mockImplementation(() => Promise.resolve(state.dbListResult))
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
    const gteMock = vi.fn().mockReturnValue({ order: orderMock })
    const eq2select = vi.fn().mockReturnValue({ gte: gteMock })
    const eq1select = vi.fn().mockReturnValue({ eq: eq2select })
    const selectMock = vi.fn().mockReturnValue({ eq: eq1select })

    return {
      auth: {
        getUser: vi.fn().mockImplementation(() =>
          Promise.resolve({ data: { user: state.user }, error: null })
        ),
      },
      from: vi.fn().mockReturnValue({
        insert: insertMock,
        update: updateMock,
        select: selectMock,
      }),
    }
  }),
}))

import {
  createExecution,
  updateExecution,
  getTokenHistory,
} from '@/app/actions/task-executions'

const MOCK_USER = { id: 'af9fea59-5792-470c-adad-88cd0955f9e3', email: 'user@example.com' }
const MOCK_TASK_ID = 'a692dd63-b76c-4d70-9bb7-edff613d8a26'
const MOCK_EXEC_ID = 'b1c2d3e4-f5a6-7890-abcd-ef1234567890'

beforeEach(() => {
  state.user = MOCK_USER
  state.dbResult = { data: null, error: null }
  state.dbListResult = { data: [], error: null }
})

// ---------------------------------------------------------------------------
// createExecution
// ---------------------------------------------------------------------------
describe('createExecution', () => {
  it('returns error when unauthenticated', async () => {
    state.user = null
    const result = await createExecution(MOCK_TASK_ID)
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error for invalid task UUID', async () => {
    const result = await createExecution('not-a-uuid')
    expect(result).toMatchObject({ success: false })
  })

  it('returns error when DB insert fails', async () => {
    state.dbResult = { data: null, error: { message: 'DB error' } }
    const result = await createExecution(MOCK_TASK_ID)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with execution data', async () => {
    const mockExec = {
      id: MOCK_EXEC_ID,
      task_id: MOCK_TASK_ID,
      user_id: MOCK_USER.id,
      status: 'pending',
      prompt_tokens: null,
      completion_tokens: null,
      total_tokens: null,
      result: null,
      error: null,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    }
    state.dbResult = { data: mockExec, error: null }
    const result = await createExecution(MOCK_TASK_ID)
    expect(result).toMatchObject({ success: true, data: mockExec })
  })
})

// ---------------------------------------------------------------------------
// updateExecution
// ---------------------------------------------------------------------------
describe('updateExecution', () => {
  it('returns error when unauthenticated', async () => {
    state.user = null
    const result = await updateExecution(MOCK_EXEC_ID, { status: 'done' })
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error for invalid execution UUID', async () => {
    const result = await updateExecution('bad-uuid', { status: 'done' })
    expect(result).toMatchObject({ success: false })
  })

  it('returns error when DB update fails', async () => {
    state.dbResult = { data: null, error: { message: 'update failed' } }
    const result = await updateExecution(MOCK_EXEC_ID, { status: 'done' })
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with updated execution', async () => {
    const mockExec = {
      id: MOCK_EXEC_ID,
      task_id: MOCK_TASK_ID,
      user_id: MOCK_USER.id,
      status: 'done',
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
      result: 'All done',
      error: null,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    state.dbResult = { data: mockExec, error: null }
    const result = await updateExecution(MOCK_EXEC_ID, {
      status: 'done',
      prompt_tokens: 100,
      completion_tokens: 200,
      result: 'All done',
    })
    expect(result).toMatchObject({ success: true, data: mockExec })
  })
})

// ---------------------------------------------------------------------------
// getTokenHistory
// ---------------------------------------------------------------------------
describe('getTokenHistory', () => {
  it('returns error when unauthenticated', async () => {
    state.user = null
    const result = await getTokenHistory()
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns empty array when no executions', async () => {
    state.dbListResult = { data: [], error: null }
    const result = await getTokenHistory()
    expect(result).toMatchObject({ success: true, data: [] })
  })

  it('returns error when DB query fails', async () => {
    state.dbListResult = { data: null, error: { message: 'query failed' } }
    const result = await getTokenHistory()
    expect(result).toMatchObject({ success: false })
  })

  it('returns list of executions with token data', async () => {
    const mockRows = [
      {
        id: MOCK_EXEC_ID,
        task_id: MOCK_TASK_ID,
        user_id: MOCK_USER.id,
        status: 'done',
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
        result: null,
        error: null,
        started_at: null,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]
    state.dbListResult = { data: mockRows, error: null }
    const result = await getTokenHistory()
    expect(result).toMatchObject({ success: true })
    if (result.success) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].total_tokens).toBe(300)
    }
  })
})
