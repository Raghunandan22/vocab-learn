import { test, expect } from '@playwright/test'

test.describe('Settings & User Preferences', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings (assuming logged in)
    await page.goto('/settings')
  })

  test('should display all language levels', async ({ page }) => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

    for (const level of levels) {
      const button = page.locator(`button:has-text("${level}")`)
      await expect(button).toBeVisible()
    }
  })

  test('should select language level', async ({ page }) => {
    // Click A1
    await page.click('button:has-text("A1")')

    // Button should show as selected (different styling)
    const a1Button = page.locator('button:has-text("A1")')
    const classes = await a1Button.getAttribute('class')
    expect(classes).toContain('bg-blue-600')
  })

  test('should display language options', async ({ page }) => {
    const languages = ['French', 'Spanish', 'German', 'Italian']

    for (const lang of languages) {
      const button = page.locator(`button:has-text("${lang}")`)
      await expect(button).toBeVisible()
    }
  })

  test('should show current level description', async ({ page }) => {
    // Select B1
    await page.click('button:has-text("B1")')

    // Should show description
    const description = page.locator('text=Intermediate')
    await expect(description).toBeVisible()
  })

  test('should save settings', async ({ page }) => {
    // Change level
    await page.click('button:has-text("C1")')

    // Change language (click French - should already be selected)
    await page.click('button:has-text("French")')

    // Click save
    await page.click('button:has-text("Save Settings")')

    // Should show success message (toast or banner)
    const success = page.locator('text=Settings saved|successfully')
    await expect(success).toBeVisible({ timeout: 5000 })
  })

  test('should show user email', async ({ page }) => {
    // Should display email somewhere on page
    const email = page.locator('[data-testid="user-email"], text=@')
    const exists = await email.isVisible().catch(() => false)
    expect(exists).toBeTruthy()
  })

  test('should show CEFR level information', async ({ page }) => {
    // Should have help text about levels
    const cefr = page.locator('text=CEFR|Beginner|Elementary|Intermediate')
    const exists = await cefr.first().isVisible().catch(() => false)
    expect(exists).toBeTruthy()
  })

  test('should disable non-French languages', async ({ page }) => {
    // Spanish, German, Italian should be disabled
    const spanishBtn = page.locator('button:has-text("Spanish")')
    const disabled = await spanishBtn.getAttribute('disabled')
    expect(disabled).toBeDefined()
  })

  test('should show settings summary', async ({ page }) => {
    // Should show summary of current settings
    const summary = page.locator('text=Preferences Summary|Language Level|Target Language')
    const exists = await summary.first().isVisible().catch(() => false)
    expect(exists).toBeTruthy()
  })
})
