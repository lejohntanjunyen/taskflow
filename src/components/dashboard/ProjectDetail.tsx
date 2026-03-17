'use client'

import { useState } from 'react'
import { TaskForm } from '@/components/forms/TaskForm'
import { TaskList } from '@/components/dashboard/TaskList'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { CommentSection } from '@/components/dashboard/CommentSection'
import type { Task, Comment } from '@/types/database'

type FilterValue = 'all' | Task['status']

type ProjectDetailProps = {
  projectId: string
  projectName: string
  tasks: Task[]
  commentsByTask: Record<string, Comment[]>
  currentUserId: string
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums font-medium text-muted-foreground w-8 text-right">
        {pct}%
      </span>
    </div>
  )
}

export function ProjectDetail({
  projectId,
  tasks,
  commentsByTask,
  currentUserId,
}: ProjectDetailProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')

  const filteredTasks =
    activeFilter === 'all' ? tasks : tasks.filter((t) => t.status === activeFilter)

  const counts: Record<FilterValue, number> = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Progress</span>
            <span className="text-muted-foreground tabular-nums">
              {counts.done} of {tasks.length} tasks done
            </span>
          </div>
          <ProgressBar done={counts.done} total={tasks.length} />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: task list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <FilterBar active={activeFilter} onFilter={setActiveFilter} counts={counts} />
            <button
              type="button"
              onClick={() => setShowNewTaskForm((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                ${showNewTaskForm
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'}`}
            >
              {showNewTaskForm ? (
                <>
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  New Task
                </>
              )}
            </button>
          </div>

          {showNewTaskForm && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 text-foreground">New task</h3>
              <TaskForm
                projectId={projectId}
                onSuccess={() => setShowNewTaskForm(false)}
              />
            </div>
          )}

          <TaskList
            tasks={filteredTasks}
            onSelectTask={setSelectedTask}
            selectedTaskId={selectedTask?.id}
          />
        </div>

        {/* Right: task detail + comments */}
        <div>
          {selectedTask ? (
            <div className="rounded-xl border border-border bg-card p-4 space-y-4 sticky top-20">
              {/* Task header */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground leading-snug">
                    {selectedTask.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {selectedTask.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedTask.description}
                  </p>
                )}
                {/* Meta chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                    ${selectedTask.priority === 'high' ? 'bg-rose-50 text-rose-600' :
                      selectedTask.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-500'}`}>
                    {selectedTask.priority}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                  {selectedTask.due_date && (
                    <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                      Due {new Date(selectedTask.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-border" />

              <CommentSection
                taskId={selectedTask.id}
                comments={commentsByTask[selectedTask.id] ?? []}
                currentUserId={currentUserId}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-muted-foreground" aria-hidden="true">
                  <path d="M4 6h12M4 10h8M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Select a task</p>
              <p className="text-xs text-muted-foreground/70 mt-1">to view details and comments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
