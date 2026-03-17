'use client'

import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTask } from '@/app/actions/tasks'

const selectClass =
  'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

type TaskFormProps = {
  projectId: string
  onSuccess?: () => void
}

export function TaskForm({ projectId, onSuccess }: TaskFormProps) {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTask(formData)
      if (result.success && onSuccess) {
        onSuccess()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-medium">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="What needs to be done?"
          required
          disabled={isPending}
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add more context…"
          rows={2}
          disabled={isPending}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="priority" className="text-xs font-medium">Priority</Label>
          <select id="priority" name="priority" defaultValue="medium" disabled={isPending} className={selectClass}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs font-medium">Status</Label>
          <select id="status" name="status" defaultValue="todo" disabled={isPending} className={selectClass}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due_date" className="text-xs font-medium">Due date <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            disabled={isPending}
            className="h-9"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating…' : 'Create task'}
      </button>
    </form>
  )
}
