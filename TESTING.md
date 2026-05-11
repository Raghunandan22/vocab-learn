# Testing Guide

This project includes end-to-end (E2E) tests using Playwright to verify core functionality.

---

## 🧪 E2E Tests with Playwright

### Setup

1. **Install Dependencies**
   ```bash
   cd apps/web
   pnpm add -D @playwright/test
   ```

2. **Install Browsers**
   ```bash
   pnpm exec playwright install
   ```

### Running Tests

**Run all tests**
```bash
pnpm exec playwright test
```

**Run specific test file**
```bash
pnpm exec playwright test e2e/auth.spec.ts
```

**Run in UI mode** (interactive)
```bash
pnpm exec playwright test --ui
```

**Run in headed mode** (see browser)
```bash
pnpm exec playwright test --headed
```

**Run single test**
```bash
pnpm exec playwright test -g "should signup new user"
```

**Run tests in specific browser**
```bash
pnpm exec playwright test --project=chromium
```

**Generate test report**
```bash
pnpm exec playwright test
pnpm exec playwright show-report
```

### Test Files

| File | Coverage |
|------|----------|
| `e2e/auth.spec.ts` | User signup, login, logout, error handling |
| `e2e/vocab.spec.ts` | Movie search, vocabulary extraction, filtering, export |
| `e2e/flashcards.spec.ts` | Spaced repetition, card flipping, keyboard shortcuts |
| `e2e/settings.spec.ts` | User preferences, language levels, settings save |

### Test Scenarios

**Auth Tests**
- ✅ Signup new user
- ✅ Login with valid credentials
- ✅ Show error on invalid credentials
- ✅ Logout user

**Vocab Tests**
- ✅ Search for movie
- ✅ Upload and extract vocabulary
- ✅ Display vocabulary list
- ✅ Filter by level
- ✅ Save word
- ✅ Search within vocabulary
- ✅ Export as CSV

**Flashcard Tests**
- ✅ Show flashcard with saved words
- ✅ Flip card on click
- ✅ Navigate cards with buttons
- ✅ Show progress bar
- ✅ Respond to keyboard shortcuts
- ✅ Show "All caught up" when done

**Settings Tests**
- ✅ Display all language levels (A1-C2)
- ✅ Select language level
- ✅ Display language options
- ✅ Show level descriptions
- ✅ Save settings with success feedback
- ✅ Show user email
- ✅ Show CEFR information

---

## 📊 Test Coverage Goals

| Component | Current | Target |
|-----------|---------|--------|
| Authentication | 70% | 90% |
| Vocabulary | 65% | 85% |
| Flashcards | 60% | 80% |
| Settings | 75% | 90% |
| **Overall** | **68%** | **85%** |

---

## 🚀 CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/test.yml`:
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: vocab
          POSTGRES_PASSWORD: vocab
          POSTGRES_DB: vocab_learn
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm prisma migrate deploy
      - run: pnpm exec playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📝 Writing New Tests

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/path')
  })

  test('should do something', async ({ page }) => {
    // Act
    await page.click('button')

    // Assert
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### Common Assertions

```typescript
// Visibility
await expect(element).toBeVisible()
await expect(element).toBeHidden()

// Text
await expect(element).toContainText('text')
await expect(element).toHaveText('exact text')

// URLs
await expect(page).toHaveURL(/dashboard/)

// Attributes
await expect(element).toHaveAttribute('disabled')

// Counts
expect(await element.count()).toBe(5)
```

### Selectors

```typescript
// By text
page.locator('button:has-text("Click me")')
page.locator('text=Welcome')

// By role
page.locator('button[role="button"]')
page.locator('heading')

// By placeholder
page.locator('input[placeholder*="Search"]')

// By data-testid
page.locator('[data-testid="submit-button"]')

// Complex selectors
page.locator('.card:has(text="Learn")')
```

---

## 🐛 Debugging Tests

### Debug Mode
```bash
pnpm exec playwright test --debug
```

### Run Single Test in Debug
```bash
pnpm exec playwright test e2e/auth.spec.ts --debug
```

### Generate Trace
```bash
pnpm exec playwright test --trace on
```

### View Trace
```bash
pnpm exec playwright show-trace trace.zip
```

### Screenshots on Failure
Tests automatically take screenshots when they fail. Check `test-results/` folder.

---

## ⚙️ Configuration

Edit `playwright.config.ts` to customize:

```typescript
{
  testDir: './e2e',           // Test directory
  timeout: 30000,             // Test timeout
  retries: 2,                 // Retry failed tests
  workers: 4,                 // Parallel workers
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  }
}
```

---

## 📊 Pre-Deployment Test Checklist

Before deploying, ensure:

- [ ] All tests pass locally: `pnpm exec playwright test`
- [ ] No timeout errors
- [ ] No flaky tests (run twice)
- [ ] Works on Chromium, Firefox, Safari
- [ ] Works on mobile devices (included)
- [ ] Screenshots clean up properly
- [ ] CI pipeline passes (if using GitHub Actions)

---

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

## 📞 Troubleshooting

**Tests timeout**
- Increase timeout: `test.setTimeout(60000)`
- Check if server is running
- Check internet connection

**Browser crashes**
- Run `pnpm exec playwright install --with-deps`
- Close other Chrome instances
- Increase memory allocation

**Flaky tests**
- Add waits: `await page.waitForTimeout(500)`
- Use `waitForURL()` instead of waiting for selectors
- Use `waitForNavigation()`

**Cannot connect to localhost**
- Ensure dev server is running: `pnpm dev`
- Check port: should be 3000
- Check firewall settings

---

**Status**: E2E tests ready to run. Install Playwright and start testing!
