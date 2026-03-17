-- Add task_type column to tasks table
-- Matches the task_type field in the task-suggester skill output contract

alter table tasks
  add column if not exists task_type text not null default 'code'
    check (task_type in ('code', 'research', 'content', 'design', 'subtask'));

-- Index for aggregation queries (task_type + status lookups)
create index if not exists tasks_task_type_idx on tasks (task_type);
