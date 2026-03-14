import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectFormPage } from './pages/ProjectPage'
import { TEST_USER } from './helpers/test-user'

// Sign in before each test
test.beforeEach(async ({ page }) => {
  const auth = new AuthPage(page)
  await auth.signIn(TEST_USER.email, TEST_USER.password)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
})

test.describe('Project Management', () => {
  test('dashboard shows heading and new project link', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await expect(dashboard.heading).toBeVisible()
    await expect(dashboard.newProjectButton).toBeVisible()
  })

  test('can navigate to new project form', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.clickNewProject()
    await expect(page).toHaveURL(/\/projects\/new/)
    await expect(page.getByLabel('Name')).toBeVisible()
  })

  test('can create a project and land on its detail page', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.clickNewProject()

    const form = new ProjectFormPage(page)
    const projectName = `E2E Project ${Date.now()}`
    await form.createProject(projectName, 'Created by E2E test')

    // Should redirect to project detail page
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(projectName)
  })

  test('newly created project appears on dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.clickNewProject()

    const form = new ProjectFormPage(page)
    const projectName = `Listed Project ${Date.now()}`
    await form.createProject(projectName)

    // Go back to dashboard
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: projectName })).toBeVisible()
  })
})
