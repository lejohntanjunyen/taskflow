-- Task executions: one row per AI run of a task
-- Stores actual token usage — the ground truth for cross-project estimation
-- share_execution_data from user_settings controls whether this user's rows
-- are included in cross-user aggregate queries

create table if not exists task_executions (
  id                uuid primary key default gen_random_uuid(),
  task_id           uuid references tasks(id) on delete cascade not null,
  user_id           uuid references auth.users on delete cascade not null,
  prompt_tokens     integer check (prompt_tokens >= 0),
  completion_tokens integer check (completion_tokens >= 0),
  total_tokens      integer generated always as
                      (coalesce(prompt_tokens, 0) + coalesce(completion_tokens, 0))
                    stored,
  status            text not null default 'pending'
                      check (status in ('pending', 'running', 'done', 'failed')),
  result            text,           -- Claude's output (markdown / code / etc)
  error             text,           -- error message if status = 'failed'
  started_at        timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz default now()
);

-- RLS
alter table task_executions enable row level security;

-- Users can read their own executions
create policy "users can read their own executions"
  on task_executions for select
  using (user_id = auth.uid());

-- Users can insert executions for their own tasks
create policy "users can insert their own executions"
  on task_executions for insert
  with check (user_id = auth.uid());

-- Users can update their own executions (e.g. set status = 'done')
create policy "users can update their own executions"
  on task_executions for update
  using (user_id = auth.uid());

-- Cross-user aggregate view: shared token history
-- Only includes rows from users who have share_execution_data = true
-- This is the view the estimate query uses — opt-out just removes rows here
create or replace view shared_token_stats as
  select
    te.id,
    te.task_id,
    te.prompt_tokens,
    te.completion_tokens,
    te.total_tokens,
    te.status,
    te.completed_at,
    t.task_type,
    t.priority
  from task_executions te
  join tasks t on t.id = te.task_id
  join user_settings us on us.user_id = te.user_id
  where te.status = 'done'
    and us.share_execution_data = true;

-- Indexes for aggregate queries
create index if not exists task_executions_user_id_idx
  on task_executions (user_id);
create index if not exists task_executions_task_id_idx
  on task_executions (task_id);
create index if not exists task_executions_status_idx
  on task_executions (status);
create index if not exists task_executions_created_at_idx
  on task_executions (created_at desc);

-- Composite index for daily budget query: user_id + created_at + status
create index if not exists task_executions_daily_budget_idx
  on task_executions (user_id, created_at desc, status);
