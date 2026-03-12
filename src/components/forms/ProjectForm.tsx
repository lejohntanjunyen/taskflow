'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProject } from '@/app/actions/projects'

export function ProjectForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createProject(formData)
      if (result && !result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="e.g. Website redesign"
          disabled={isPending}
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">
          Description{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What is this project about?"
          disabled={isPending}
          maxLength={500}
          rows={3}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create project'}
        </Button>
      </div>
    </form>
  )
}
