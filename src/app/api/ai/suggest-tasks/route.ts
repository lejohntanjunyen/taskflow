import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateTasks } from '@/lib/ai/client'
import { SuggestTasksRequestSchema } from '@/lib/ai/schemas'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Parse + validate request body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SuggestTasksRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Generate tasks via claude -p
  const result = await generateTasks(parsed.data)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true, data: result.data })
}
