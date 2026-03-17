import { describe, it, expect } from 'vitest'
import {
  TaskSuggestionSchema,
  TaskSuggestionsResponseSchema,
  SuggestTasksRequestSchema,
} from '@/lib/ai/schemas'

// ---------------------------------------------------------------------------
// Valid fixtures
// ---------------------------------------------------------------------------
const VALID_SUGGESTION = {
  title: 'Write unit tests for auth module',
  description: 'Cover sign-in, sign-up, and token refresh edge cases',
  priority: 'high' as const,
  task_type: 'code' as const,
  tags: ['tests', 'auth'] as string[],
  rationale: 'No test coverage on auth paths',
}

const VALID_RESPONSE = {
  suggestions: [VALID_SUGGESTION],
}

const VALID_REQUEST = {
  projectId: crypto.randomUUID(),
  projectName: 'My Project',
  existingTasks: ['Set up CI pipeline', 'Add linting'],
  count: 5,
}

// ---------------------------------------------------------------------------
// TaskSuggestionSchema
// ---------------------------------------------------------------------------
describe('TaskSuggestionSchema', () => {
  it('parses a valid suggestion', () => {
    const result = TaskSuggestionSchema.safeParse(VALID_SUGGESTION)
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = TaskSuggestionSchema.safeParse({ ...VALID_SUGGESTION, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 200 chars', () => {
    const result = TaskSuggestionSchema.safeParse({
      ...VALID_SUGGESTION,
      title: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid priority', () => {
    const result = TaskSuggestionSchema.safeParse({
      ...VALID_SUGGESTION,
      priority: 'urgent',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid task_type', () => {
    const result = TaskSuggestionSchema.safeParse({
      ...VALID_SUGGESTION,
      task_type: 'unknown',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tag in tags array', () => {
    const result = TaskSuggestionSchema.safeParse({
      ...VALID_SUGGESTION,
      tags: ['tests', 'not-a-valid-tag'],
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty tags array', () => {
    const result = TaskSuggestionSchema.safeParse({ ...VALID_SUGGESTION, tags: [] })
    expect(result.success).toBe(true)
  })

  it('rejects more than 5 tags', () => {
    const result = TaskSuggestionSchema.safeParse({
      ...VALID_SUGGESTION,
      tags: ['tests', 'auth', 'api', 'ui', 'docs', 'config'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing rationale', () => {
    const { rationale: _r, ...withoutRationale } = VALID_SUGGESTION
    const result = TaskSuggestionSchema.safeParse(withoutRationale)
    expect(result.success).toBe(false)
  })

  it('rejects empty rationale', () => {
    const result = TaskSuggestionSchema.safeParse({ ...VALID_SUGGESTION, rationale: '' })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// TaskSuggestionsResponseSchema
// ---------------------------------------------------------------------------
describe('TaskSuggestionsResponseSchema', () => {
  it('parses a valid response with one suggestion', () => {
    const result = TaskSuggestionsResponseSchema.safeParse(VALID_RESPONSE)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.suggestions).toHaveLength(1)
    }
  })

  it('parses a response with multiple suggestions', () => {
    const result = TaskSuggestionsResponseSchema.safeParse({
      suggestions: [VALID_SUGGESTION, { ...VALID_SUGGESTION, title: 'Another task' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty suggestions array', () => {
    const result = TaskSuggestionsResponseSchema.safeParse({ suggestions: [] })
    expect(result.success).toBe(false)
  })

  it('rejects more than 10 suggestions', () => {
    const result = TaskSuggestionsResponseSchema.safeParse({
      suggestions: Array.from({ length: 11 }, (_, i) => ({
        ...VALID_SUGGESTION,
        title: `Task ${i + 1}`,
      })),
    })
    expect(result.success).toBe(false)
  })

  it('rejects response with invalid suggestion inside', () => {
    const result = TaskSuggestionsResponseSchema.safeParse({
      suggestions: [{ ...VALID_SUGGESTION, priority: 'critical' }],
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// SuggestTasksRequestSchema
// ---------------------------------------------------------------------------
describe('SuggestTasksRequestSchema', () => {
  it('parses a valid request', () => {
    const result = SuggestTasksRequestSchema.safeParse(VALID_REQUEST)
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID projectId', () => {
    const result = SuggestTasksRequestSchema.safeParse({
      ...VALID_REQUEST,
      projectId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty projectName', () => {
    const result = SuggestTasksRequestSchema.safeParse({
      ...VALID_REQUEST,
      projectName: '',
    })
    expect(result.success).toBe(false)
  })

  it('defaults count to 5 when omitted', () => {
    const { count: _c, ...withoutCount } = VALID_REQUEST
    const result = SuggestTasksRequestSchema.safeParse(withoutCount)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.count).toBe(5)
    }
  })

  it('rejects count less than 1', () => {
    const result = SuggestTasksRequestSchema.safeParse({ ...VALID_REQUEST, count: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects count greater than 10', () => {
    const result = SuggestTasksRequestSchema.safeParse({ ...VALID_REQUEST, count: 11 })
    expect(result.success).toBe(false)
  })

  it('defaults existingTasks to empty array when omitted', () => {
    const { existingTasks: _e, ...withoutTasks } = VALID_REQUEST
    const result = SuggestTasksRequestSchema.safeParse(withoutTasks)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.existingTasks).toEqual([])
    }
  })
})
