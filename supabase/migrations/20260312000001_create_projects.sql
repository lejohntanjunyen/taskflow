-- Migration: create projects table
-- Created: 2026-03-12

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast user project lookups
create index projects_user_id_idx on projects(user_id);

-- Row Level Security
alter table projects enable row level security;

-- Users can only see their own projects
create policy "projects_select_own"
  on projects for select
  using (auth.uid() = user_id);

-- Users can only insert projects for themselves
create policy "projects_insert_own"
  on projects for insert
  with check (auth.uid() = user_id);

-- Users can only update their own projects
create policy "projects_update_own"
  on projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only delete their own projects
create policy "projects_delete_own"
  on projects for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at_column();
