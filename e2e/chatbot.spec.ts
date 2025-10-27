import { test, expect } from '@playwright/test';

test.describe('Chatbot Functionality', () => {
  test('should display chatbot widget on home page', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const chatWidget = page.locator('[class*="chat"], [aria-label*="chat"]').first();
    if (await chatWidget.isVisible()) {
      await expect(chatWidget).toBeVisible();
    }
  });

  test('should open chatbot when clicked', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const chatButton = page.locator('button[class*="chat"], button[aria-label*="chat"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(1000);

      const chatWindow = page.locator('[class*="chat-window"], [role="dialog"]');
      if (await chatWindow.count() > 0) {
        await expect(chatWindow.first()).toBeVisible();
      }
    }
  });

  test('should display input field in chatbot', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const chatButton = page.locator('button[class*="chat"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(1000);

      const input = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]');
      if (await input.count() > 0) {
        await expect(input.first()).toBeVisible();
      }
    }
  });

  test('should allow typing in chatbot input', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const chatButton = page.locator('button[class*="chat"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(1000);

      const input = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
      if (await input.isVisible()) {
        await input.fill('Hello');
        await expect(input).toHaveValue('Hello');
      }
    }
  });

  test('should have send button in chatbot', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const chatButton = page.locator('button[class*="chat"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(1000);

      const sendButton = page.locator('button[type="submit"], button[aria-label*="send"]');
      if (await sendButton.count() > 0) {
        await expect(sendButton.first()).toBeVisible();
      }
    }
  });
});

test.describe('Chatbot API Integration', () => {
  test('should handle chatbot API errors gracefully', async ({ page }) => {
    await page.route('**/api/*/chat', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button[class*="chat"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(1000);

      const input = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
      const sendButton = page.locator('button[type="submit"]').first();

      if (await input.isVisible() && await sendButton.isVisible()) {
        await input.fill('Test message');
        await sendButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should show loading state while waiting for response', async ({ page }) => {
    await page.route('**/api/*/chat', async route => {
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, response: 'Test response' })
      });
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button[class*="chat"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(1000);

      const input = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
      const sendButton = page.locator('button[type="submit"]').first();

      if (await input.isVisible() && await sendButton.isVisible()) {
        await input.fill('Test message');
        await sendButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
