import { Suspense } from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { TokenBudgetWidget } from '@/components/dashboard/TokenBudgetWidget'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const projectList = projects ?? []

  // Batch-fetch task status counts for all projects in one query
  type StatRow = { project_id: string; status: string; count: number }
  let statsByProject: Record<string, { todo: number; in_progress: number; done: number }> = {}

  if (projectList.length > 0) {
    const projectIds = projectList.map((p) => p.id)
    const { data: statRows } = await supabase
      .from('tasks')
      .select('project_id, status')
      .in('project_id', projectIds)
      .limit(5000)

    if (statRows) {
      // Group counts client-side (avoids needing a DB aggregate view)
      const grouped: Record<string, { todo: number; in_progress: number; done: number }> = {}
      for (const row of statRows as StatRow[]) {
        if (!grouped[row.project_id]) {
          grouped[row.project_id] = { todo: 0, in_progress: 0, done: 0 }
        }
        const s = row.status as 'todo' | 'in_progress' | 'done'
        if (s === 'todo' || s === 'in_progress' || s === 'done') {
          grouped[row.project_id][s]++
        }
      }
      statsByProject = grouped
    }
  }

  return (
    <div className="space-y-8">
      {/* Token budget */}
      <Suspense fallback={null}>
        <TokenBudgetWidget />
      </Suspense>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projectList.length === 0
              ? 'Create your first project to get started'
              : `${projectList.length} project${projectList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 h-9 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
        >
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          New project
        </Link>
      </div>

      {/* Project grid */}
      {projectList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              createdAt={project.created_at}
              stats={statsByProject[project.id] ?? { todo: 0, in_progress: 0, done: 0 }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-primary" aria-hidden="true">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-semibold text-foreground">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Create a project to start tracking tasks
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 h-9 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            Create first project
          </Link>
        </div>
      )}
    </div>
  )
}
