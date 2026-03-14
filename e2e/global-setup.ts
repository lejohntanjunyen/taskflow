import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const TEST_EMAIL = 'e2e-test@taskflow.dev'
const TEST_PASSWORD = 'e2eTestPass123!'

async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Delete existing test user if present (clean state)
  const { data: existing } = await supabase.auth.admin.listUsers()
  const testUser = existing?.users?.find((u) => u.email === TEST_EMAIL)
  if (testUser) {
    await supabase.auth.admin.deleteUser(testUser.id)
  }

  // Create fresh test user
  const { error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`)
  }

  console.log(`E2E test user created: ${TEST_EMAIL}`)
}

export default globalSetup
