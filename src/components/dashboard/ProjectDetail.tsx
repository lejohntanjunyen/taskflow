'use client'

import { useState } from 'react'
import { TaskForm } from '@/components/forms/TaskForm'
import { TaskList } from '@/components/dashboard/TaskList'
import { CommentSection } from '@/components/dashboard/CommentSection'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Task, Comment } from '@/types/database'

type ProjectDetailProps = {
  projectId: string
  projectName: string
  tasks: Task[]
  commentsByTask: Record<string, Comment[]>
  currentUserId: string
}

export function ProjectDetail({
  projectId,
  projectName,
  tasks,
  commentsByTask,
  currentUserId,
}: ProjectDetailProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left: task list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <Button
            size="sm"
            variant={showNewTaskForm ? 'ghost' : 'default'}
            onClick={() => setShowNewTaskForm((v) => !v)}
          >
            {showNewTaskForm ? 'Cancel' : 'New Task'}
          </Button>
        </div>

        {showNewTaskForm && (
          <div className="rounded-lg border p-4">
            <TaskForm
              projectId={projectId}
              onSuccess={() => setShowNewTaskForm(false)}
            />
          </div>
        )}

        <TaskList tasks={tasks} onSelectTask={setSelectedTask} />
      </div>

      {/* Right: task detail + comments */}
      <div className="space-y-4">
        {selectedTask ? (
          <>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{selectedTask.title}</h2>
              {selectedTask.description && (
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              )}
            </div>
            <Separator />
            <CommentSection
              taskId={selectedTask.id}
              comments={commentsByTask[selectedTask.id] ?? []}
              currentUserId={currentUserId}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Select a task to view details and comments.
          </div>
        )}
      </div>
    </div>
  )
}
