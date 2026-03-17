import { execFile } from 'child_process'
import { promisify } from 'util'
import {
  TaskSuggestionsResponseSchema,
  type TaskSuggestion,
  type SuggestTasksRequest,
} from './schemas'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------------------
// Prompt builder — incorporates the task-suggester skill contract
// ---------------------------------------------------------------------------
function buildPrompt(request: SuggestTasksRequest): string {
  const existingList =
    request.existingTasks.length > 0
      ? request.existingTasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
      : '  (none)'

  return `You are a task planner for a software project.

Project name: ${request.projectName}

Existing tasks (do NOT duplicate these):
${existingList}

Generate exactly ${request.count} new task suggestions for this project.

RULES:
- Each task title must start with an imperative verb (Add, Write, Fix, Implement, Create, Update, Remove, Migrate, Configure, Test, Deploy, Document, Refactor, Integrate)
- Title: 1–200 characters
- Description: 1–1000 characters, explain WHY this task matters
- priority: one of low | medium | high
- task_type: one of code | research | content | design | subtask
- tags: 0–5 items from this exact list only: migration, auth, tests, api, form, ui, docs, config, deploy, database, security, performance, refactor, integration, realtime, storage, email, payments, analytics, onboarding, search
- rationale: 1–500 characters, explain why you chose this task given existing context
- No duplicate titles
- No task that duplicates an existing task above

SELF-CHECK before outputting (answer internally, do not include in output):
1. Does every title start with an imperative verb?
2. Are all task_type values in [code, research, content, design, subtask]?
3. Are all tags from the allowed list only?
4. Does every tag array have 0–5 items?
5. Is every title ≤ 200 chars and non-empty?
6. Is every rationale non-empty?
7. Are there exactly ${request.count} suggestions?
8. Are all priorities one of low | medium | high?

Return ONLY valid JSON matching this exact schema, no markdown fences, no explanation:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "priority": "low" | "medium" | "high",
      "task_type": "code" | "research" | "content" | "design" | "subtask",
      "tags": ["tag1", ...],
      "rationale": "string"
    }
  ]
}`
}

// ---------------------------------------------------------------------------
// generateTasks — calls claude -p subprocess, validates with Zod, retries once
// ---------------------------------------------------------------------------
export async function generateTasks(
  request: SuggestTasksRequest
): Promise<{ success: true; data: TaskSuggestion[] } | { success: false; error: string }> {
  const prompt = buildPrompt(request)

  async function attempt(extraContext?: string): Promise<string> {
    const fullPrompt = extraContext ? `${prompt}\n\nPrevious attempt failed validation: ${extraContext}\nPlease fix and return valid JSON only.` : prompt
    const { stdout } = await execFileAsync('claude', ['-p', fullPrompt], {
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    })
    return stdout.trim()
  }

  // First attempt
  let raw: string
  try {
    raw = await attempt()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'claude subprocess failed'
    return { success: false, error: message }
  }

  // Parse and validate
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // JSON parse failed — retry with error context
    try {
      raw = await attempt('Output was not valid JSON')
      parsed = JSON.parse(raw)
    } catch {
      return { success: false, error: 'Claude did not return valid JSON after retry' }
    }
  }

  const validated = TaskSuggestionsResponseSchema.safeParse(parsed)
  if (validated.success) {
    return { success: true, data: validated.data.suggestions }
  }

  // Zod validation failed — retry once with error details
  const zodError = validated.error.flatten()
  const errorContext = JSON.stringify(zodError)
  try {
    raw = await attempt(errorContext)
    parsed = JSON.parse(raw)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'retry failed'
    return { success: false, error: message }
  }

  const retryValidated = TaskSuggestionsResponseSchema.safeParse(parsed)
  if (retryValidated.success) {
    return { success: true, data: retryValidated.data.suggestions }
  }

  return { success: false, error: 'AI output failed schema validation after retry' }
}
