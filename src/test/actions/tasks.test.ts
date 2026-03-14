import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Shared mutable state — each test mutates this before calling the action
// ---------------------------------------------------------------------------
const state = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
  dbResult: { data: null as unknown, error: null as unknown },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: vi.fn().mockReturnValue([]), set: vi.fn() }),
}))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockImplementation(async () => {
    // Every leaf async call reads state at invocation time via mockImplementation
    const single = vi.fn().mockImplementation(() => Promise.resolve(state.dbResult))

    const selectForInsert = vi.fn().mockReturnValue({ single })
    const insertMock = vi.fn().mockReturnValue({ select: selectForInsert })

    // update().eq('id').eq('user_id').select().single()
    const selectForUpdate = vi.fn().mockReturnValue({ single })
    const eq2update = vi.fn().mockReturnValue({ select: selectForUpdate, single })
    const eq1update = vi.fn().mockReturnValue({ eq: eq2update })
    const updateMock = vi.fn().mockReturnValue({ eq: eq1update })

    // delete().eq('id').eq('user_id')  — terminal, resolves directly
    const eq2delete = vi.fn().mockImplementation(() => Promise.resolve(state.dbResult))
    const eq1delete = vi.fn().mockReturnValue({ eq: eq2delete })
    const deleteMock = vi.fn().mockReturnValue({ eq: eq1delete })

    return {
      auth: {
        getUser: vi.fn().mockImplementation(() =>
          Promise.resolve({ data: { user: state.user }, error: null })
        ),
      },
      from: vi.fn().mockReturnValue({
        insert: insertMock,
        update: updateMock,
        delete: deleteMock,
      }),
    }
  }),
}))

import { createTask, updateTaskStatus, deleteTask } from '@/app/actions/tasks'

const MOCK_USER = { id: 'af9fea59-5792-470c-adad-88cd0955f9e3', email: 'user@example.com' }
const MOCK_PROJECT_ID = '5998a6fb-b859-476c-8dae-ce70095b551f'
const MOCK_TASK_ID = 'a692dd63-b76c-4d70-9bb7-edff613d8a26'

beforeEach(() => {
  state.user = MOCK_USER
  state.dbResult = { data: null, error: null }
})

// ---------------------------------------------------------------------------
// createTask
// ---------------------------------------------------------------------------
describe('createTask action', () => {
  it('returns error for empty title', async () => {
    const formData = new FormData()
    formData.set('title', '')
    formData.set('projectId', MOCK_PROJECT_ID)

    const result = await createTask(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error for invalid project UUID', async () => {
    const formData = new FormData()
    formData.set('title', 'My Task')
    formData.set('projectId', 'not-a-uuid')

    const result = await createTask(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error when user is not authenticated', async () => {
    state.user = null

    const formData = new FormData()
    formData.set('title', 'My Task')
    formData.set('projectId', MOCK_PROJECT_ID)

    const result = await createTask(formData)
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error when Supabase insert fails', async () => {
    state.dbResult = { data: null, error: { message: 'DB error' } }

    const formData = new FormData()
    formData.set('title', 'My Task')
    formData.set('projectId', MOCK_PROJECT_ID)

    const result = await createTask(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with task data on valid input', async () => {
    const mockTask = {
      id: MOCK_TASK_ID,
      title: 'My Task',
      status: 'todo' as const,
      priority: 'medium' as const,
      description: null,
      project_id: MOCK_PROJECT_ID,
      user_id: MOCK_USER.id,
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:00Z',
    }
    state.dbResult = { data: mockTask, error: null }

    const formData = new FormData()
    formData.set('title', 'My Task')
    formData.set('projectId', MOCK_PROJECT_ID)

    const result = await createTask(formData)
    expect(result).toMatchObject({ success: true })
  })

  it('inserts with provided priority and status', async () => {
    const mockTask = {
      id: MOCK_TASK_ID,
      title: 'High priority task',
      status: 'in_progress' as const,
      priority: 'high' as const,
      description: null,
      project_id: MOCK_PROJECT_ID,
      user_id: MOCK_USER.id,
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:00Z',
    }
    state.dbResult = { data: mockTask, error: null }

    const formData = new FormData()
    formData.set('title', 'High priority task')
    formData.set('projectId', MOCK_PROJECT_ID)
    formData.set('status', 'in_progress')
    formData.set('priority', 'high')

    const result = await createTask(formData)
    expect(result).toMatchObject({ success: true })
  })
})

// ---------------------------------------------------------------------------
// updateTaskStatus
// ---------------------------------------------------------------------------
describe('updateTaskStatus action', () => {
  it('returns error for invalid status value', async () => {
    const result = await updateTaskStatus(MOCK_TASK_ID, 'invalid_status' as never)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error when user is not authenticated', async () => {
    state.user = null
    const result = await updateTaskStatus(MOCK_TASK_ID, 'done')
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error when Supabase update fails', async () => {
    state.dbResult = { data: null, error: { message: 'DB error' } }
    const result = await updateTaskStatus(MOCK_TASK_ID, 'done')
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with updated task', async () => {
    const mockTask = {
      id: MOCK_TASK_ID,
      title: 'My Task',
      status: 'done' as const,
      priority: 'medium' as const,
      description: null,
      project_id: MOCK_PROJECT_ID,
      user_id: MOCK_USER.id,
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:00Z',
    }
    state.dbResult = { data: mockTask, error: null }
    const result = await updateTaskStatus(MOCK_TASK_ID, 'done')
    expect(result).toMatchObject({ success: true, data: mockTask })
  })
})

// ---------------------------------------------------------------------------
// deleteTask
// ---------------------------------------------------------------------------
describe('deleteTask action', () => {
  it('returns error when user is not authenticated', async () => {
    state.user = null
    const result = await deleteTask(MOCK_TASK_ID)
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error when Supabase delete fails', async () => {
    state.dbResult = { data: null, error: { message: 'DB error' } }
    const result = await deleteTask(MOCK_TASK_ID)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success on valid delete', async () => {
    state.dbResult = { data: null, error: null }
    const result = await deleteTask(MOCK_TASK_ID)
    expect(result).toMatchObject({ success: true })
  })
})
