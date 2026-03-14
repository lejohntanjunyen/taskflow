import type { Page } from '@playwright/test'

export class AuthPage {
  constructor(private page: Page) {}

  // --- Navigation ---
  async gotoLogin() {
    await this.page.goto('/login')
  }

  async gotoSignup() {
    await this.page.goto('/signup')
  }

  // --- Locators ---
  get emailInput() {
    return this.page.getByLabel('Email')
  }

  get passwordInput() {
    return this.page.getByLabel('Password')
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /sign in|sign up/i })
  }

  get errorMessage() {
    return this.page.getByRole('alert')
  }

  // --- Actions ---
  async signIn(email: string, password: string) {
    await this.gotoLogin()
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async signUp(email: string, password: string) {
    await this.gotoSignup()
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
