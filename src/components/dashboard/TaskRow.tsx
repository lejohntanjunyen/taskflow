'use client'

import { useTransition, useOptimistic } from 'react'
import { updateTaskStatus, deleteTask } from '@/app/actions/tasks'
import type { Task } from '@/types/database'

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-slate-300',
  medium: 'bg-amber-400',
  high: 'bg-rose-500',
}

const PRIORITY_TEXT: Record<Task['priority'], string> = {
  low: 'text-slate-400',
  medium: 'text-amber-500',
  high: 'text-rose-500',
}

function formatDueDate(due: string | null): { label: string; overdue: boolean } | null {
  if (!due) return null
  const dueMs = new Date(due).getTime()
  const todayMs = new Date(new Date().toDateString()).getTime()
  const diffDays = Math.round((dueMs - todayMs) / 86_400_000)
  const overdue = diffDays < 0

  if (diffDays === 0) return { label: 'Today', overdue: false }
  if (diffDays === 1) return { label: 'Tomorrow', overdue: false }
  if (diffDays === -1) return { label: 'Yesterday', overdue: true }
  if (overdue) return { label: `${Math.abs(diffDays)}d overdue`, overdue: true }
  if (diffDays <= 7) return { label: `${diffDays}d`, overdue: false }
  return {
    label: new Date(due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    overdue: false,
  }
}

type TaskRowProps = {
  task: Task
  onSelect?: (task: Task) => void
  isSelected?: boolean
}

export function TaskRow({ task, onSelect, isSelected }: TaskRowProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticDone, setOptimisticDone] = useOptimistic(task.status === 'done')

  function handleCheck() {
    const nextStatus = optimisticDone ? 'todo' : 'done'
    startTransition(async () => {
      setOptimisticDone(!optimisticDone)
      await updateTaskStatus(task.id, nextStatus)
    })
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    startTransition(async () => {
      await deleteTask(task.id)
    })
  }

  const due = formatDueDate(task.due_date ?? null)

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer
        ${isSelected ? 'bg-primary/8 border border-primary/20' : 'hover:bg-muted/60 border border-transparent'}
        ${optimisticDone ? 'opacity-60' : ''}
        ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => onSelect?.(task)}
    >
      {/* Priority stripe */}
      <div className={`shrink-0 w-0.5 h-8 rounded-full ${PRIORITY_COLORS[task.priority]}`} />

      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleCheck() }}
        aria-label={optimisticDone ? 'Mark incomplete' : 'Mark complete'}
        className={`shrink-0 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all
          ${optimisticDone
            ? 'bg-primary border-primary'
            : 'border-border hover:border-primary/60 bg-transparent'}`}
      >
        {optimisticDone && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
            <path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium leading-snug truncate block
          ${optimisticDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </span>
        {task.description && !isSelected && (
          <span className="text-xs text-muted-foreground truncate block mt-0.5">
            {task.description}
          </span>
        )}
      </div>

      {/* Meta: priority label + due date */}
      <div className="shrink-0 flex items-center gap-2">
        {due && (
          <span className={`text-xs font-medium tabular-nums ${due.overdue ? 'text-rose-500' : 'text-muted-foreground'}`}>
            {due.label}
          </span>
        )}
        <span className={`hidden sm:block text-xs font-medium capitalize ${PRIORITY_TEXT[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {/* Delete — visible on hover */}
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete task"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5l.5-9" stroke="currentColor"
            strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
