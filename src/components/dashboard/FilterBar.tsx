'use client'

import { Button } from '@/components/ui/button'
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
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tasks by status">
      {FILTERS.map(({ label, value }) => (
        <Button
          key={value}
          variant={active === value ? 'default' : 'outline'}
          size="sm"
          aria-pressed={active === value}
          onClick={() => onFilter(value)}
        >
          {label} {counts[value]}
        </Button>
      ))}
    </div>
  )
}
