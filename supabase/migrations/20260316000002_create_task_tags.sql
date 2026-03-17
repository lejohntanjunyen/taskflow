-- Task tags: keyword labels extracted from task title/description
-- Used for cross-project token estimation similarity matching
-- Tags must come from the allowed list defined in the task-suggester skill

create table if not exists task_tags (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references tasks(id) on delete cascade not null,
  tag        text not null,
  created_at timestamptz default now(),

  -- One tag value per task (no duplicates)
  unique (task_id, tag)
);

-- Allowed tag values — matches SKILL.md allowed list
alter table task_tags
  add constraint task_tags_tag_check check (
    tag in (
      'migration', 'auth', 'tests', 'api', 'form', 'ui', 'docs', 'config',
      'deploy', 'database', 'security', 'performance', 'refactor',
      'integration', 'realtime', 'storage', 'email', 'payments',
      'analytics', 'onboarding', 'search'
    )
  );

-- RLS
alter table task_tags enable row level security;

-- Users can read tags for tasks in their projects
create policy "users can read task tags for their tasks"
  on task_tags for select
  using (
    exists (
      select 1 from tasks t
      where t.id = task_tags.task_id
        and t.user_id = auth.uid()
    )
  );

-- Users can insert/delete tags for their own tasks
create policy "users can manage tags for their tasks"
  on task_tags for insert
  with check (
    exists (
      select 1 from tasks t
      where t.id = task_tags.task_id
        and t.user_id = auth.uid()
    )
  );

create policy "users can delete tags for their tasks"
  on task_tags for delete
  using (
    exists (
      select 1 from tasks t
      where t.id = task_tags.task_id
        and t.user_id = auth.uid()
    )
  );

-- Index for tag-based lookups
create index if not exists task_tags_tag_idx on task_tags (tag);
create index if not exists task_tags_task_id_idx on task_tags (task_id);
