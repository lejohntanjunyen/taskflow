'use client'

import type { TaskType } from '@/types/database'

type Props = {
  taskType: TaskType
  avgTokens: number | null
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  code: 'Code',
  research: 'Research',
  content: 'Content',
  design: 'Design',
  subtask: 'Subtask',
}

export function TokenEstimateBadge({ taskType, avgTokens }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
      <span className="font-medium">{TASK_TYPE_LABELS[taskType]}</span>
      <span className="text-slate-400">|</span>
      {avgTokens !== null ? (
        <span>~{avgTokens.toLocaleString()} tokens avg</span>
      ) : (
        <span className="text-slate-400">No data yet</span>
      )}
    </span>
  )
}
