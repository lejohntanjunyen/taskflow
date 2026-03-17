-- User settings: per-user preferences including daily token budget
-- share_execution_data: opt-in toggle for contributing to cross-user estimates
-- Default is true (shared) — easily switchable per user in future

create table if not exists user_settings (
  user_id              uuid primary key references auth.users on delete cascade,
  daily_token_budget   integer not null default 100000
                         check (daily_token_budget > 0),
  share_execution_data boolean not null default true,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- RLS
alter table user_settings enable row level security;

create policy "users can read their own settings"
  on user_settings for select
  using (user_id = auth.uid());

create policy "users can insert their own settings"
  on user_settings for insert
  with check (user_id = auth.uid());

create policy "users can update their own settings"
  on user_settings for update
  using (user_id = auth.uid());

-- Auto-create settings row when a new user signs up
create or replace function create_user_settings_on_signup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure create_user_settings_on_signup();
