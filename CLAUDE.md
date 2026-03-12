# TaskFlow — Project CLAUDE.md

## Project Overview

**TaskFlow** is a task and issue tracker built to learn Claude Code end-to-end.

**Stack:** Next.js 15 (App Router), TypeScript, Supabase (auth + DB + real-time), Tailwind CSS, Shadcn/ui, Playwright (E2E), Vercel (deployment)

**Architecture:** Server Components by default. Client Components only for interactivity. Server Actions for all mutations. API routes only for webhooks or external integrations.

## Critical Rules

### Database

- All queries use Supabase client with RLS enabled — never bypass RLS
- Migrations in `supabase/migrations/` — never modify the database directly
- Use `select()` with explicit column lists, never `select('*')`
- All user-facing queries must include `.limit()` to prevent unbounded results
- Use `supabase.from('table').select('col1, col2')` pattern consistently

### Authentication

- Use `createServerClient()` from `@supabase/ssr` in Server Components and Server Actions
- Use `createBrowserClient()` from `@supabase/ssr` in Client Components only
- Protected routes check `getUser()` — never trust `getSession()` alone for auth
- Middleware in `middleware.ts` refreshes auth tokens on every request

### Code Style

- No emojis in code, comments, or UI text
- Immutable patterns only — spread operator for object/array updates, never mutate
- Server Components: no `'use client'` directive, no `useState`/`useEffect`
- Client Components: `'use client'` at top, keep minimal — extract logic to hooks
- Prefer Zod schemas for all input validation (server actions, forms, env vars)
- No `console.log` in production code — use proper error handling

### TypeScript

- Strict mode enabled — no `any` types
- Prefer `type` over `interface` for object shapes
- Infer types from Zod schemas with `z.infer<typeof schema>`
- Export Supabase-generated types from `src/types/database.ts`

### File Size

- 200-400 lines typical, 800 max per file
- One component per file
- Organize by feature/domain under `src/app/`, not by type

## File Structure

```
src/
  app/
    (auth)/               # Auth pages: login, signup
    (dashboard)/          # Protected pages: projects, tasks
    api/
      webhooks/           # External webhooks only
    layout.tsx            # Root layout with providers
    page.tsx              # Landing / redirect page
  components/
    ui/                   # Shadcn/ui primitives
    forms/                # Form components with Zod validation
    dashboard/            # Dashboard-specific components
  hooks/                  # Custom React hooks (client-side only)
  lib/
    supabase/
      server.ts           # createServerClient factory
      client.ts           # createBrowserClient factory
    utils.ts              # General utilities (cn, formatDate, etc.)
    validations.ts        # Shared Zod schemas
  types/
    database.ts           # Supabase generated types
    index.ts              # App-level TypeScript types
supabase/
  migrations/             # SQL migration files
  seed.sql                # Dev seed data
```

## Key Patterns

### API Response Format

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### Server Action Pattern

```typescript
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const schema = z.object({
  title: z.string().min(1).max(200),
  projectId: z.string().uuid(),
})

export async function createTask(formData: FormData) {
  const parsed = schema.safeParse({
    title: formData.get('title'),
    projectId: formData.get('projectId'),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ title: parsed.data.title, project_id: parsed.data.projectId, user_id: user.id })
    .select('id, title, status, created_at')
    .single()

  if (error) return { success: false, error: 'Failed to create task' }
  return { success: true, data }
}
```

### Error Handling Pattern

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Server-only, never expose to client

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema (Target)

```sql
-- Users managed by Supabase Auth (auth.users)

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  created_at timestamptz default now()
);
```

## Testing Strategy

```bash
/tdd                    # Unit + integration tests for new features
/e2e                    # Playwright tests for auth flow and core flows
/test-coverage          # Verify 80%+ coverage
```

### Critical E2E Flows

1. Sign up -> email verification -> create first project
2. Login -> dashboard -> create task -> change status
3. Add comment on task -> see it appear
4. Filter tasks by status and priority

## ECC Workflow

```bash
# Planning a feature
/plan "Add task status filtering to the dashboard"

# Developing with TDD
/tdd

# Before committing
/code-review
/security-scan

# Before release
/e2e
/test-coverage

# Audit your harness
/harness-audit
```

## Git Workflow

- `feat:` new features, `fix:` bug fixes, `refactor:` code changes, `test:` test additions, `chore:` maintenance
- Feature branches from `main`, PRs required — never commit directly to `main`
- CI runs: type-check, lint, unit tests, E2E tests
- Deploy: Vercel preview on every PR, production on merge to `main`

## Available Agents

| Agent | When to Use |
|-------|-------------|
| planner | Before any new feature — always plan first |
| tdd-guide | Writing any new code — tests first |
| code-reviewer | After writing or modifying code |
| security-reviewer | Before commits touching auth, queries, or user data |
| build-error-resolver | When TypeScript or build errors appear |
| database-reviewer | When writing migrations or Supabase queries |
| e2e-runner | When implementing critical user flows |
