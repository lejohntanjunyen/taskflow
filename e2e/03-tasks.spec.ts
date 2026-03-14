import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectFormPage, ProjectDetailPage } from './pages/ProjectPage'
import { TEST_USER } from './helpers/test-user'

test.beforeEach(async ({ page }) => {
  // Sign in and create a fresh project for each test
  const auth = new AuthPage(page)
  await auth.signIn(TEST_USER.email, TEST_USER.password)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  const dashboard = new DashboardPage(page)
  await dashboard.clickNewProject()

  const form = new ProjectFormPage(page)
  await form.createProject(`Task Test Project ${Date.now()}`)
  await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/)
})

test.describe('Task Management', () => {
  test('project detail page shows New Task button', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    await expect(detail.newTaskButton).toBeVisible()
  })

  test('can create a task and see it in the list', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    const taskTitle = `My E2E Task ${Date.now()}`

    await detail.createTask(taskTitle)

    // Task should appear in the list
    await expect(detail.taskCard(taskTitle)).toBeVisible()
  })

  test('filter bar shows All, Todo, In Progress, Done', async ({ page }) => {
    const detail = new ProjectDetailPage(page)

    await expect(detail.filterAllButton).toBeVisible()
    await expect(detail.filterTodoButton).toBeVisible()
    await expect(detail.filterDoneButton).toBeVisible()
  })

  test('can advance a task status from Todo to In Progress', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    const taskTitle = `Status Task ${Date.now()}`

    await detail.createTask(taskTitle)

    // Find and click the "Mark In Progress" button on the task card
    const markBtn = detail.markButton(taskTitle)
    await expect(markBtn).toBeVisible()
    await markBtn.click()

    // The badge should now show In Progress
    const taskCard = page
      .locator('.rounded-lg.border.bg-card')
      .filter({ hasText: taskTitle })
    await expect(taskCard.getByText('In Progress')).toBeVisible()
  })

  test('filter by Todo hides In Progress tasks', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    const todoTitle = `Todo Task ${Date.now()}`
    const inProgressTitle = `InProgress Task ${Date.now()}`

    // Create two tasks
    await detail.createTask(todoTitle)
    await detail.createTask(inProgressTitle)

    // Advance second task to In Progress
    await detail.markButton(inProgressTitle).click()

    // Filter by Todo
    await detail.filterTodoButton.click()

    // Todo task visible, In Progress task hidden
    await expect(detail.taskCard(todoTitle)).toBeVisible()
    await expect(detail.taskCard(inProgressTitle)).not.toBeVisible()
  })
})
