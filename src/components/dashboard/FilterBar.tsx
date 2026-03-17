'use client'

import type { Task } from '@/types/database'

type FilterValue = 'all' | Task['status']

type FilterBarProps = {
  active: FilterValue
  onFilter: (value: FilterValue) => void
  counts: Record<FilterValue, number>
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

export function FilterBar({ active, onFilter, counts }: FilterBarProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
      role="group"
      aria-label="Filter tasks by status"
    >
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          aria-pressed={active === value}
          onClick={() => onFilter(value)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150
            ${active === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
            }`}
        >
          {label}
          <span className={`tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none
            ${active === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-border text-muted-foreground'
            }`}>
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  )
}
