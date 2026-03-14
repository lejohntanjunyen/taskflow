import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ProjectDetail } from '@/components/dashboard/ProjectDetail'
import type { Comment } from '@/types/database'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch project (RLS ensures ownership)
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description, user_id, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  // Fetch tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, project_id, user_id, created_at, updated_at')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const taskList = tasks ?? []
  const taskIds = taskList.map((t) => t.id)

  // Fetch comments for all tasks in one query
  let commentsByTask: Record<string, Comment[]> = {}
  if (taskIds.length > 0) {
    const { data: comments } = await supabase
      .from('comments')
      .select('id, body, task_id, user_id, created_at')
      .in('task_id', taskIds)
      .order('created_at', { ascending: true })
      .limit(500)

    if (comments) {
      commentsByTask = comments.reduce<Record<string, Comment[]>>((acc, comment) => {
        const existing = acc[comment.task_id] ?? []
        return { ...acc, [comment.task_id]: [...existing, comment] }
      }, {})
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <span>{project.name}</span>
        </div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      <ProjectDetail
        projectId={project.id}
        projectName={project.name}
        tasks={taskList}
        commentsByTask={commentsByTask}
        currentUserId={user.id}
      />
    </div>
  )
}
