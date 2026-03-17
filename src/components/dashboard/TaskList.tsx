import { TaskRow } from '@/components/dashboard/TaskRow'
import type { Task } from '@/types/database'

type TaskListProps = {
  tasks: Task[]
  onSelectTask?: (task: Task) => void
  selectedTaskId?: string | null
}

export function TaskList({ tasks, onSelectTask, selectedTaskId }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-muted-foreground" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted-foreground">No tasks yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Add your first task above</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onSelect={onSelectTask}
          isSelected={task.id === selectedTaskId}
        />
      ))}
    </div>
  )
}
