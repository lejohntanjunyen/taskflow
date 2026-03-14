import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectFormPage, ProjectDetailPage } from './pages/ProjectPage'
import { TEST_USER } from './helpers/test-user'

test.beforeEach(async ({ page }) => {
  const auth = new AuthPage(page)
  await auth.signIn(TEST_USER.email, TEST_USER.password)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  const dashboard = new DashboardPage(page)
  await dashboard.clickNewProject()

  const form = new ProjectFormPage(page)
  await form.createProject(`Comment Test Project ${Date.now()}`)
  await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/)
})

test.describe('Comments', () => {
  test('selecting a task reveals the comment section', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    const taskTitle = `Commentable Task ${Date.now()}`

    await detail.createTask(taskTitle)
    await detail.clickTask(taskTitle)

    await expect(detail.commentTextarea).toBeVisible()
    await expect(detail.postCommentButton).toBeVisible()
  })

  test('can post a comment and see it appear', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    const taskTitle = `Comment Task ${Date.now()}`
    const commentText = `This is a test comment at ${Date.now()}`

    await detail.createTask(taskTitle)
    await detail.clickTask(taskTitle)
    await detail.postComment(commentText)

    // Comment body should appear in the list
    await expect(detail.commentBody(commentText)).toBeVisible()
  })

  test('can post multiple comments on the same task', async ({ page }) => {
    const detail = new ProjectDetailPage(page)
    const taskTitle = `Multi Comment Task ${Date.now()}`
    const comment1 = `First comment ${Date.now()}`
    const comment2 = `Second comment ${Date.now()}`

    await detail.createTask(taskTitle)
    await detail.clickTask(taskTitle)

    await detail.postComment(comment1)
    await expect(detail.commentBody(comment1)).toBeVisible()

    await detail.postComment(comment2)
    await expect(detail.commentBody(comment2)).toBeVisible()

    // Both comments visible simultaneously
    await expect(detail.commentBody(comment1)).toBeVisible()
  })
})
