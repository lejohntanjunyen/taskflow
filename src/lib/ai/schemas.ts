import { z } from 'zod'
import type { TaskType, TaskTag } from '@/types/database'

// ---------------------------------------------------------------------------
// Allowed values — must match task-suggester SKILL.md and DB constraints
// ---------------------------------------------------------------------------
const TASK_TYPES: [TaskType, ...TaskType[]] = ['code', 'research', 'content', 'design', 'subtask']

const TASK_TAGS: [TaskTag, ...TaskTag[]] = [
  'migration', 'auth', 'tests', 'api', 'form', 'ui', 'docs', 'config',
  'deploy', 'database', 'security', 'performance', 'refactor',
  'integration', 'realtime', 'storage', 'email', 'payments',
  'analytics', 'onboarding', 'search',
]

// ---------------------------------------------------------------------------
// TaskSuggestionSchema — one AI-suggested task
// ---------------------------------------------------------------------------
export const TaskSuggestionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  priority: z.enum(['low', 'medium', 'high']),
  task_type: z.enum(TASK_TYPES),
  tags: z.array(z.enum(TASK_TAGS)).max(5),
  rationale: z.string().min(1).max(500),
})

export type TaskSuggestion = z.infer<typeof TaskSuggestionSchema>

// ---------------------------------------------------------------------------
// TaskSuggestionsResponseSchema — full JSON output from claude -p
// ---------------------------------------------------------------------------
export const TaskSuggestionsResponseSchema = z.object({
  suggestions: z.array(TaskSuggestionSchema).min(1).max(10),
})

export type TaskSuggestionsResponse = z.infer<typeof TaskSuggestionsResponseSchema>

// ---------------------------------------------------------------------------
// SuggestTasksRequestSchema — POST /api/ai/suggest-tasks body
// ---------------------------------------------------------------------------
export const SuggestTasksRequestSchema = z.object({
  projectId: z.string().uuid(),
  projectName: z.string().min(1).max(200),
  existingTasks: z.array(z.string()).default([]),
  count: z.number().int().min(1).max(10).default(5),
})

export type SuggestTasksRequest = z.infer<typeof SuggestTasksRequestSchema>
