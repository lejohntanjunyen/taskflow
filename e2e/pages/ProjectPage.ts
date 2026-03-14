import type { Page } from '@playwright/test'

export class ProjectFormPage {
  constructor(private page: Page) {}

  // --- Locators ---
  get nameInput() {
    return this.page.getByLabel('Name')
  }

  get descriptionInput() {
    return this.page.getByLabel('Description')
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /create project/i })
  }

  // --- Actions ---
  async createProject(name: string, description?: string) {
    await this.nameInput.fill(name)
    if (description) {
      await this.descriptionInput.fill(description)
    }
    await this.submitButton.click()
  }
}

export class ProjectDetailPage {
  constructor(private page: Page) {}

  // --- Locators ---
  get heading() {
    return this.page.getByRole('heading', { level: 1 })
  }

  get newTaskButton() {
    return this.page.getByRole('button', { name: /new task/i })
  }

  get taskTitleInput() {
    return this.page.getByLabel('Title')
  }

  get createTaskButton() {
    return this.page.getByRole('button', { name: /create task/i })
  }

  // Filter buttons are inside the FilterBar group (role="group")
  private get filterBar() {
    return this.page.getByRole('group', { name: /filter tasks by status/i })
  }

  get filterAllButton() {
    return this.filterBar.getByRole('button', { name: /^all/i })
  }

  get filterTodoButton() {
    return this.filterBar.getByRole('button', { name: /^todo/i })
  }

  get filterDoneButton() {
    return this.filterBar.getByRole('button', { name: /^done/i })
  }

  taskCard(title: string) {
    return this.page.getByRole('button', { name: title })
  }

  markButton(taskTitle: string) {
    return this.page
      .locator('.rounded-lg.border.bg-card')
      .filter({ hasText: taskTitle })
      .getByRole('button', { name: /mark/i })
  }

  // --- Comment section ---
  get commentTextarea() {
    return this.page.getByPlaceholder('Add a comment...')
  }

  get postCommentButton() {
    return this.page.getByRole('button', { name: /post comment/i })
  }

  commentBody(text: string) {
    return this.page.locator('li').filter({ hasText: text }).locator('p')
  }

  // --- Actions ---
  async openNewTaskForm() {
    await this.newTaskButton.click()
  }

  async createTask(title: string) {
    await this.openNewTaskForm()
    await this.taskTitleInput.fill(title)
    await this.createTaskButton.click()
  }

  async clickTask(title: string) {
    await this.taskCard(title).click()
  }

  async postComment(body: string) {
    await this.commentTextarea.fill(body)
    await this.postCommentButton.click()
  }
}
