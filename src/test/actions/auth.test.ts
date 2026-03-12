import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted so mock vars are available when vi.mock factory runs
const { mockSignInWithPassword, mockSignUp, mockSignOut } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  }),
}))

import { signIn, signUp, signOut } from '@/app/actions/auth'

describe('signIn action', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for invalid email', async () => {
    const formData = new FormData()
    formData.set('email', 'not-an-email')
    formData.set('password', 'password123')

    const result = await signIn(formData)
    expect(result).toMatchObject({ success: false })
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('returns error for missing password', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', '')

    const result = await signIn(formData)
    expect(result).toMatchObject({ success: false })
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('returns error when Supabase auth fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'wrongpassword')

    const result = await signIn(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('calls Supabase with correct credentials on valid input', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123' }, session: {} },
      error: null,
    })

    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'securepass123')

    await signIn(formData)
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'securepass123',
    })
  })
})

describe('signUp action', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error for invalid email', async () => {
    const formData = new FormData()
    formData.set('email', 'bad-email')
    formData.set('password', 'securepass123')

    const result = await signUp(formData)
    expect(result).toMatchObject({ success: false })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('returns error for short password', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'short')

    const result = await signUp(formData)
    expect(result).toMatchObject({ success: false })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('returns error when Supabase signup fails', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const formData = new FormData()
    formData.set('email', 'existing@example.com')
    formData.set('password', 'securepass123')

    const result = await signUp(formData)
    expect(result).toMatchObject({ success: false })
  })

  it('returns success with confirmation message on valid signup', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null,
    })

    const formData = new FormData()
    formData.set('email', 'newuser@example.com')
    formData.set('password', 'securepass123')

    const result = await signUp(formData)
    expect(result).toMatchObject({ success: true })
  })
})

describe('signOut action', () => {
  it('calls Supabase signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    await signOut()
    expect(mockSignOut).toHaveBeenCalled()
  })
})
