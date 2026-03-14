import type { Page } from '@playwright/test'

export class DashboardPage {
  constructor(private page: Page) {}

  // --- Navigation ---
  async goto() {
    await this.page.goto('/dashboard')
  }

  // --- Locators ---
  get heading() {
    return this.page.getByRole('heading', { name: /projects/i })
  }

  get newProjectButton() {
    return this.page.getByRole('link', { name: /new project/i })
  }

  get projectCards() {
    return this.page.locator('[data-testid="project-card"]')
  }

  get signOutButton() {
    return this.page.getByRole('button', { name: /sign out/i })
  }

  projectLink(name: string) {
    return this.page.getByRole('link', { name })
  }

  // --- Actions ---
  async clickNewProject() {
    await this.newProjectButton.click()
  }

  async signOut() {
    await this.signOutButton.click()
  }
}
