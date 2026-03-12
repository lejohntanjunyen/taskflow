-- Migration: create tasks table
-- Created: 2026-03-12

create type task_status as enum ('todo', 'in_progress', 'done');
create type task_priority as enum ('low', 'medium', 'high');

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for common query patterns
create index tasks_project_id_idx on tasks(project_id);
create index tasks_user_id_idx on tasks(user_id);
create index tasks_status_idx on tasks(status);
create index tasks_priority_idx on tasks(priority);

-- Row Level Security
alter table tasks enable row level security;

-- Users can see tasks in their own projects
create policy "tasks_select_own"
  on tasks for select
  using (
    exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Users can insert tasks into their own projects
create policy "tasks_insert_own"
  on tasks for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from projects
      where projects.id = project_id
      and projects.user_id = auth.uid()
    )
  );

-- Users can update tasks in their own projects
create policy "tasks_update_own"
  on tasks for update
  using (
    exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Users can delete tasks in their own projects
create policy "tasks_delete_own"
  on tasks for delete
  using (
    exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at_column();
