// Shared test credentials — used across all E2E specs
// The account must exist in Supabase Auth before tests run.
// Run `npm run e2e` after ensuring this user exists (see global-setup.ts).

export const TEST_USER = {
  email: 'e2e-test@taskflow.dev',
  password: 'e2eTestPass123!',
}
