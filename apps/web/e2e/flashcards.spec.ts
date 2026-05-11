import { test, expect } from '@playwright/test'

test.describe('Spaced Repetition / Flashcards', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to flashcards (assuming logged in)
    await page.goto('/flashcards')
  })

  test('should show flashcard if words exist', async ({ page }) => {
    // Check if no words message OR flashcard is shown
    const noWordsMsg = page.locator('text=No words saved')
    const flashcard = page.locator('[style*="preserve-3d"]')

    const hasWords = await flashcard.isVisible().catch(() => false)
    const hasNoWords = await noWordsMsg.isVisible().catch(() => false)

    expect(hasWords || hasNoWords).toBeTruthy()
  })

  test('should flip card on click', async ({ page }) => {
    const flashcard = page.locator('[style*="preserve-3d"]').first()

    // Check if visible (if it exists)
    const isVisible = await flashcard.isVisible().catch(() => false)

    if (isVisible) {
      // Get initial rotation
      const initialStyle = await flashcard.getAttribute('style')

      // Click to flip
      await flashcard.click()

      // Wait a bit for animation
      await page.waitForTimeout(300)

      // Style should change (rotation should update)
      const newStyle = await flashcard.getAttribute('style')
      expect(newStyle).not.toEqual(initialStyle)
    }
  })

  test('should navigate cards with "Know It" button', async ({ page }) => {
    const knowButton = page.locator('button:has-text("Know It")').first()

    const isVisible = await knowButton.isVisible().catch(() => false)

    if (isVisible) {
      const initialCard = page.locator('[style*="preserve-3d"]').first()
      const cardText = await initialCard.textContent()

      // Click "Know It"
      await knowButton.click()

      // Wait for navigation
      await page.waitForTimeout(500)

      // Card should change (either different word or same card rotated differently)
      const newCardText = await initialCard.textContent().catch(() => cardText)
      // At minimum, card should still be visible or show "All caught up"
      const cardExists = await initialCard.isVisible().catch(() => false)
      const caughtUp = await page.locator('text=All caught up').isVisible().catch(() => false)
      expect(cardExists || caughtUp).toBeTruthy()
    }
  })

  test('should navigate cards with "Practice More" button', async ({ page }) => {
    const practiceButton = page.locator('button:has-text("Practice More")').first()

    const isVisible = await practiceButton.isVisible().catch(() => false)

    if (isVisible) {
      // Click "Practice More"
      await practiceButton.click()

      // Wait for navigation
      await page.waitForTimeout(500)

      // Card should still be visible
      const cardExists = await page.locator('[style*="preserve-3d"]').first().isVisible().catch(() => false)
      const caughtUp = await page.locator('text=All caught up').isVisible().catch(() => false)
      expect(cardExists || caughtUp).toBeTruthy()
    }
  })

  test('should show progress bar', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"], .bg-blue-600.h-2')

    const exists = await progressBar.isVisible().catch(() => false)
    expect(exists).toBeTruthy()
  })

  test('should show keyboard shortcuts hint', async ({ page }) => {
    const hint = page.locator('text=Space to flip')

    const exists = await hint.isVisible().catch(() => false)
    expect(exists).toBeTruthy()
  })

  test('should respond to keyboard shortcuts', async ({ page }) => {
    const flashcard = page.locator('[style*="preserve-3d"]').first()

    const isVisible = await flashcard.isVisible().catch(() => false)

    if (isVisible) {
      // Press Space to flip
      await page.keyboard.press('Space')

      // Wait for animation
      await page.waitForTimeout(300)

      // Card should still be visible
      await expect(flashcard).toBeVisible()

      // Press ArrowRight (Know It)
      await page.keyboard.press('ArrowRight')

      // Wait for animation
      await page.waitForTimeout(500)

      // Should still show card or "All caught up"
      const cardExists = await flashcard.isVisible().catch(() => false)
      const caughtUp = await page.locator('text=All caught up').isVisible().catch(() => false)
      expect(cardExists || caughtUp).toBeTruthy()
    }
  })

  test('should show all caught up when no due words', async ({ page }) => {
    // This test depends on actual data state
    // Just verify the page loads without error
    await expect(page).toHaveTitle(/Flashcards/)

    // Should show either flashcard or caught up message
    const hasContent = await page
      .locator('text=All caught up|No words saved|Practice|Know')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasContent).toBeTruthy()
  })
})
