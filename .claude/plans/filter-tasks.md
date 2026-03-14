# Autonomous Loop: Add Task Status Filtering

## Objective

Add client-side task status filtering to the project detail page at
`src/app/(dashboard)/dashboard/projects/[id]/page.tsx`.

Users should be able to click a filter button (All / Todo / In Progress / Done)
and see only tasks with that status. The filter is client-side only — no new
server actions or DB queries needed.

## Stop Condition

All steps below are marked DONE and `npm run test` exits 0 and
`npm run typecheck` exits 0.

## Steps

### Step 1 — Create FilterBar component (TDD: test first)

Create `src/test/components/FilterBar.test.tsx` with tests for:
- renders All, Todo, In Progress, Done buttons
- clicking a button calls onFilter with the correct value
- the active filter button has an aria-pressed="true" attribute

Run the tests — they must FAIL (RED).

### Step 2 — Implement FilterBar

Create `src/components/dashboard/FilterBar.tsx`:

```tsx
'use client'

import { Button } from '@/components/ui/button'
import type { Task } from '@/types/database'

type FilterValue = 'all' | Task['status']

type FilterBarProps = {
  active: FilterValue
  onFilter: (value: FilterValue) => void
  counts: Record<FilterValue, number>
}

export function FilterBar({ active, onFilter, counts }: FilterBarProps) { ... }
```

Buttons: All (counts.all), Todo (counts.todo), In Progress (counts.in_progress), Done (counts.done).

Run the tests — they must PASS (GREEN).

### Step 3 — Wire FilterBar into ProjectDetail

Edit `src/components/dashboard/ProjectDetail.tsx`:
- Add `useState<FilterValue>('all')` for active filter
- Compute `filteredTasks` from `tasks` based on active filter
- Compute `counts` object
- Render `<FilterBar>` above `<TaskList>`
- Pass `filteredTasks` to `<TaskList>` instead of `tasks`

### Step 4 — Typecheck + full test suite

Run `npm run typecheck` — must exit 0.
Run `npm run test` — all tests must pass.

## Files to Create / Modify

- CREATE: `src/test/components/FilterBar.test.tsx`
- CREATE: `src/components/dashboard/FilterBar.tsx`
- MODIFY: `src/components/dashboard/ProjectDetail.tsx`

## Constraints (from CLAUDE.md)

- No emojis in code or UI
- No `any` types
- Immutable patterns only (spread, no mutation)
- Client Components: `'use client'` at top
- No `console.log`
- Shadcn/ui Button uses `@base-ui/react` — does NOT support `asChild` prop
