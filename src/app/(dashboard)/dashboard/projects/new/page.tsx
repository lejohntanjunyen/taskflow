import { ProjectForm } from '@/components/forms/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New project</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a project to start tracking tasks.
        </p>
      </div>
      <ProjectForm />
    </div>
  )
}
