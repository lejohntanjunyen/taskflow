import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'
import { TEST_USER } from './helpers/test-user'

test.describe('Authentication', () => {
  test('login page loads and redirects unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('sign in with valid credentials lands on dashboard', async ({ page }) => {
    const auth = new AuthPage(page)
    await auth.signIn(TEST_USER.email, TEST_USER.password)

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible()
  })

  test('sign in with wrong password shows error', async ({ page }) => {
    const auth = new AuthPage(page)
    await auth.gotoLogin()
    await auth.emailInput.fill(TEST_USER.email)
    await auth.passwordInput.fill('wrongpassword')
    await auth.submitButton.click()

    // Should stay on login and show an error
    await expect(page).toHaveURL(/\/login/)
    await expect(auth.errorMessage).toBeVisible()
  })

  test('sign out returns to login', async ({ page }) => {
    const auth = new AuthPage(page)
    await auth.signIn(TEST_USER.email, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)

    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
