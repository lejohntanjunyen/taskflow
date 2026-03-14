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
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockImplementation(async () => {
    // insert().select().single() — single reads state at call time
    const single = vi.fn().mockImplementation(() => Promise.resolve(state.dbResult))
    const selectForInsert = vi.fn().mockReturnValue({ single })
    const insertMock = vi.fn().mockReturnValue({ select: selectForInsert })

    // delete().eq('id').eq('user_id') — terminal eq reads state at call time
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
        delete: deleteMock,
      }),
    }
  }),
}))

import { createComment, deleteComment } from '@/app/actions/comments'

const MOCK_USER = { id: 'af9fea59-5792-470c-adad-88cd0955f9e3', email: 'user@example.com' }
const MOCK_TASK_ID = 'a692dd63-b76c-4d70-9bb7-edff613d8a26'
const MOCK_COMMENT_ID = '5998a6fb-b859-476c-8dae-ce70095b551f'

beforeEach(() => {
  state.user = MOCK_USER
  state.dbResult = { data: null, error: null }
})

// ---------------------------------------------------------------------------
// createComment
// ---------------------------------------------------------------------------
describe('createComment action', () => {
  it('returns error for empty body', async () => {
    const formData = new FormData()
    formData.set('body', '')
    formData.set('taskId', MOCK_TASK_ID)

    const result = await createComment(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error for invalid task UUID', async () => {
    const formData = new FormData()
    formData.set('body', 'This is a comment')
    formData.set('taskId', 'not-a-uuid')

    const result = await createComment(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns error when user is not authenticated', async () => {
    state.user = null

    const formData = new FormData()
    formData.set('body', 'This is a comment')
    formData.set('taskId', MOCK_TASK_ID)

    const result = await createComment(formData)
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error when Supabase insert fails', async () => {
    state.dbResult = { data: null, error: { message: 'DB error' } }

    const formData = new FormData()
    formData.set('body', 'This is a comment')
    formData.set('taskId', MOCK_TASK_ID)

    const result = await createComment(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with comment data on valid input', async () => {
    const mockComment = {
      id: MOCK_COMMENT_ID,
      body: 'This is a comment',
      task_id: MOCK_TASK_ID,
      user_id: MOCK_USER.id,
      created_at: '2026-03-14T00:00:00Z',
    }
    state.dbResult = { data: mockComment, error: null }

    const formData = new FormData()
    formData.set('body', 'This is a comment')
    formData.set('taskId', MOCK_TASK_ID)

    const result = await createComment(formData)
    expect(result).toMatchObject({ success: true, data: mockComment })
  })
})

// ---------------------------------------------------------------------------
// deleteComment
// ---------------------------------------------------------------------------
describe('deleteComment action', () => {
  it('returns error when user is not authenticated', async () => {
    state.user = null
    const result = await deleteComment(MOCK_COMMENT_ID)
    expect(result).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns error when Supabase delete fails', async () => {
    state.dbResult = { data: null, error: { message: 'DB error' } }
    const result = await deleteComment(MOCK_COMMENT_ID)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success on valid delete', async () => {
    state.dbResult = { data: null, error: null }
    const result = await deleteComment(MOCK_COMMENT_ID)
    expect(result).toMatchObject({ success: true })
  })
})
