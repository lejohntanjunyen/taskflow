import { describe, it, expect } from 'vitest'
import {
  signUpSchema,
  signInSchema,
  createProjectSchema,
  createTaskSchema,
  createCommentSchema,
} from '@/lib/validations'

// ─── Auth schemas ────────────────────────────────────────────────────────────

describe('signUpSchema', () => {
  it('accepts valid email and password', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'securepass123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined()
    }
  })

  it('rejects empty fields', () => {
    const result = signUpSchema.safeParse({ email: '', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Project schemas ─────────────────────────────────────────────────────────

describe('createProjectSchema', () => {
  it('accepts name only', () => {
    const result = createProjectSchema.safeParse({ name: 'My Project' })
    expect(result.success).toBe(true)
  })

  it('accepts name with description', () => {
    const result = createProjectSchema.safeParse({
      name: 'My Project',
      description: 'A project description',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createProjectSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name over 100 characters', () => {
    const result = createProjectSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects description over 500 characters', () => {
    const result = createProjectSchema.safeParse({
      name: 'Valid Name',
      description: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

// ─── Task schemas ─────────────────────────────────────────────────────────────

describe('createTaskSchema', () => {
  const validTask = {
    title: 'Fix the bug',
    projectId: '123e4567-e89b-12d3-a456-426614174000',
  }

  it('accepts minimal valid task', () => {
    const result = createTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  it('defaults status to todo', () => {
    const result = createTaskSchema.safeParse(validTask)
    if (result.success) {
      expect(result.data.status).toBe('todo')
    }
  })

  it('defaults priority to medium', () => {
    const result = createTaskSchema.safeParse(validTask)
    if (result.success) {
      expect(result.data.priority).toBe('medium')
    }
  })

  it('rejects invalid status', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      status: 'invalid_status',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid priority', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      priority: 'urgent',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid project UUID', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      projectId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects title over 200 characters', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      title: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })
})

// ─── Comment schemas ──────────────────────────────────────────────────────────

describe('createCommentSchema', () => {
  const validComment = {
    body: 'This is a comment',
    taskId: '123e4567-e89b-12d3-a456-426614174000',
  }

  it('accepts valid comment', () => {
    const result = createCommentSchema.safeParse(validComment)
    expect(result.success).toBe(true)
  })

  it('rejects empty body', () => {
    const result = createCommentSchema.safeParse({ ...validComment, body: '' })
    expect(result.success).toBe(false)
  })

  it('rejects body over 2000 characters', () => {
    const result = createCommentSchema.safeParse({
      ...validComment,
      body: 'a'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid task UUID', () => {
    const result = createCommentSchema.safeParse({
      ...validComment,
      taskId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })
})
