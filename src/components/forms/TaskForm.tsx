'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTask } from '@/app/actions/tasks'

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
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Task title"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Optional description"
          rows={3}
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue="todo"
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  )
}
