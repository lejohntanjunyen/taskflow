'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenEstimateBadge } from './TokenEstimateBadge'
import { createTask } from '@/app/actions/tasks'
import { upsertTags } from '@/app/actions/task-tags'
import type { TaskSuggestion } from '@/lib/ai/schemas'
import type { TaskTag } from '@/types/database'

type ReviewState = 'pending' | 'accepted' | 'rejected'

type SuggestionItem = {
  suggestion: TaskSuggestion
  state: ReviewState
}

type Props = {
  projectId: string
  projectName: string
  existingTaskTitles: string[]
  onDone?: () => void
}

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
}

export function SuggestTasksPanel({ projectId, projectName, existingTaskTitles, onDone }: Props) {
  const [items, setItems] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setSubmitted(false)
    setItems([])

    try {
      const res = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName,
          existingTasks: existingTaskTitles,
          count: 5,
        }),
      })

      const json = (await res.json()) as
        | { success: true; data: TaskSuggestion[] }
        | { success: false; error: string }

      if (!json.success) {
        setError(json.error)
        return
      }

      setItems(json.data.map((suggestion) => ({ suggestion, state: 'pending' })))
    } catch {
      setError('Failed to reach suggestion API')
    } finally {
      setLoading(false)
    }
  }

  function setItemState(index: number, state: ReviewState) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, state } : item))
    )
  }

  function handleAcceptAll() {
    setItems((prev) => prev.map((item) => ({ ...item, state: 'accepted' as ReviewState })))
  }

  function handleRejectAll() {
    setItems((prev) => prev.map((item) => ({ ...item, state: 'rejected' as ReviewState })))
  }

  function handleSubmit() {
    const accepted = items.filter((item) => item.state === 'accepted')
    if (accepted.length === 0) return

    startTransition(async () => {
      for (const item of accepted) {
        const formData = new FormData()
        formData.set('title', item.suggestion.title)
        formData.set('description', item.suggestion.description)
        formData.set('priority', item.suggestion.priority)
        formData.set('projectId', projectId)
        formData.set('task_type', item.suggestion.task_type)

        const result = await createTask(formData)
        if (result.success && item.suggestion.tags.length > 0) {
          await upsertTags(result.data.id, item.suggestion.tags as TaskTag[])
        }
      }
      setSubmitted(true)
      onDone?.()
    })
  }

  const acceptedCount = items.filter((i) => i.state === 'accepted').length
  const hasReviewed = items.length > 0 && items.every((i) => i.state !== 'pending')

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">AI Task Suggestions</h3>
        <Button
          variant="default"
          size="sm"
          onClick={handleGenerate}
          disabled={loading || isPending}
        >
          {loading ? 'Generating...' : items.length > 0 ? 'Regenerate' : 'Suggest Tasks'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {submitted && (
        <p className="text-sm text-green-700">
          {acceptedCount} task{acceptedCount !== 1 ? 's' : ''} added to project.
        </p>
      )}

      {items.length > 0 && !submitted && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{items.length} suggestions</span>
            <span>|</span>
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={handleAcceptAll}
            >
              Accept all
            </button>
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={handleRejectAll}
            >
              Reject all
            </button>
          </div>

          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-md border p-3 space-y-2 transition-opacity ${
                  item.state === 'rejected' ? 'opacity-40' : ''
                } ${item.state === 'accepted' ? 'border-green-500 bg-green-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{item.suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{item.suggestion.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={PRIORITY_VARIANTS[item.suggestion.priority]}>
                      {item.suggestion.priority}
                    </Badge>
                    <TokenEstimateBadge taskType={item.suggestion.task_type} avgTokens={null} />
                  </div>
                </div>

                {item.suggestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.suggestion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground italic">
                  {item.suggestion.rationale}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant={item.state === 'accepted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setItemState(index, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant={item.state === 'rejected' ? 'destructive' : 'ghost'}
                    size="sm"
                    onClick={() => setItemState(index, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {hasReviewed && acceptedCount > 0 && (
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending
                ? 'Adding tasks...'
                : `Add ${acceptedCount} task${acceptedCount !== 1 ? 's' : ''} to project`}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
