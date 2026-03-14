import { TaskCard } from '@/components/dashboard/TaskCard'
import type { Task } from '@/types/database'

type TaskListProps = {
  tasks: Task[]
  onSelectTask?: (task: Task) => void
}

export function TaskList({ tasks, onSelectTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No tasks yet. Create one above.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
      ))}
    </div>
  )
}
