import { Suspense } from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TokenBudgetWidget } from '@/components/dashboard/TokenBudgetWidget'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <TokenBudgetWidget />
      </Suspense>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-3 h-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          New project
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                </CardHeader>
                {project.description && (
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 mb-4">No projects yet.</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-3 h-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Create your first project
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
