'use client'

import { useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateTaskStatus, deleteTask } from '@/app/actions/tasks'
import type { Task } from '@/types/database'

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

const STATUS_NEXT: Record<Task['status'], Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

const PRIORITY_VARIANTS: Record<Task['priority'], 'default' | 'secondary' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
}

type TaskCardProps = {
  task: Task
  onSelect?: (task: Task) => void
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange() {
    startTransition(async () => {
      await updateTaskStatus(task.id, STATUS_NEXT[task.status])
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id)
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect?.(task)}
          className="text-left font-medium hover:underline flex-1"
        >
          {task.title}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={PRIORITY_VARIANTS[task.priority]}>{task.priority}</Badge>
          <Badge variant="outline">{STATUS_LABELS[task.status]}</Badge>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleStatusChange}
        >
          {isPending ? '...' : `Mark ${STATUS_LABELS[STATUS_NEXT[task.status]]}`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
