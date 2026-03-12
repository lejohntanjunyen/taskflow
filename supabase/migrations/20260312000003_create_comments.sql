-- Migration: create comments table
-- Created: 2026-03-12

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Index for fast task comment lookups
create index comments_task_id_idx on comments(task_id);

-- Row Level Security
alter table comments enable row level security;

-- Users can see comments on tasks in their own projects
create policy "comments_select_own"
  on comments for select
  using (
    exists (
      select 1 from tasks
      join projects on projects.id = tasks.project_id
      where tasks.id = comments.task_id
      and projects.user_id = auth.uid()
    )
  );

-- Users can insert comments on tasks in their own projects
create policy "comments_insert_own"
  on comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from tasks
      join projects on projects.id = tasks.project_id
      where tasks.id = task_id
      and projects.user_id = auth.uid()
    )
  );

-- Users can only delete their own comments
create policy "comments_delete_own"
  on comments for delete
  using (auth.uid() = user_id);
