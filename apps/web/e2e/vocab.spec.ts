import { test, expect } from '@playwright/test'

// Sample SRT subtitle content for testing
const SAMPLE_SUBTITLE = `1
00:00:00,000 --> 00:00:05,000
Bonjour, comment allez-vous?

2
00:00:05,000 --> 00:00:10,000
Je vais très bien, merci beaucoup.

3
00:00:10,000 --> 00:00:15,000
Enchanté de vous rencontrer.
`

test.describe('Vocabulary Extraction', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming user is already logged in
    await page.goto('/search')
  })

  test('should search for movie', async ({ page }) => {
    // Fill search input
    await page.fill('input[placeholder*="Movie" i]', 'Amélie')

    // Click search button
    await page.click('button:has-text("Find Movie")')

    // Should show movie results
    await expect(page.locator('text=Amélie')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('img[alt="Amélie"]')).toBeVisible()
  })

  test('should upload and extract vocabulary', async ({ page }) => {
    // Fill movie title
    await page.fill('input[placeholder*="Movie" i]', 'Test Movie')

    // Click search (even though it won't find anything, we need to pass to next step)
    await page.click('button:has-text("Find Movie")')

    // Wait for movie preview
    await expect(page.locator('text=Test Movie')).toBeVisible({ timeout: 5000 })

    // Fill subtitle content
    const textareaHandle = page.locator('textarea')
    await textareaHandle.fill(SAMPLE_SUBTITLE)

    // Click extract button
    await page.click('button:has-text("Extract Vocabulary")')

    // Should show success message and redirect
    await expect(page.locator('text=Extracted')).toBeVisible({ timeout: 10000 })

    // Should redirect to vocab page
    await expect(page).toHaveURL(/\/vocab\//)
  })

  test('should display vocabulary list', async ({ page }) => {
    // Assuming on vocab page from previous test
    await page.goto('/vocab') // In real scenario, would use actual vocab ID

    // Should show vocabulary table or cards
    await expect(page.locator('text=Word|Translation|Level', { exact: false })).toBeVisible()

    // Should show level filter buttons
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.locator('button:has-text("Basic")')).toBeVisible()
  })

  test('should filter vocabulary by level', async ({ page }) => {
    // Click "Basic" filter
    await page.click('button:has-text("Basic")')

    // Should only show Basic level words
    const basicBadges = page.locator('text="Basic"')
    const count = await basicBadges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should save word', async ({ page }) => {
    // Find and click first save button
    const saveButton = page.locator('button:has-text("Save")').first()
    await saveButton.click()

    // Button should change to "Saved"
    await expect(saveButton).toContainText('Saved')
  })

  test('should search within vocabulary', async ({ page }) => {
    // Fill search input
    await page.fill('input[placeholder*="Search" i]', 'bonjour')

    // Should filter results
    await page.waitForTimeout(500) // Wait for debounce
    const results = page.locator('table tbody tr, .md\\:hidden.card')
    const count = await results.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should export vocabulary as CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    // Click download button
    await page.click('button:has-text("Download")')

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')
  })
})
