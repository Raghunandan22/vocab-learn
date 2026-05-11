import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: `test-${Date.now()}@vocab-learn.test`,
  password: 'TestPassword123!@#',
  name: 'Test User',
}

test.describe('Authentication Flow', () => {
  test('should signup new user', async ({ page }) => {
    await page.goto('/signup')

    // Fill signup form
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.fill('input[placeholder*="name" i]', TEST_USER.name)

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to login or show success
    await expect(page).toHaveURL(/\/(login|dashboard)/)
  })

  test('should login existing user', async ({ page }) => {
    // Assuming user exists from previous test or created manually
    await page.goto('/login')

    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toContainText(/Welcome|Dashboard/i)
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/)

    // Click logout
    await page.click('button:has-text("Logout")')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
