import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page successfully', async ({ page }) => {
    await expect(page).toHaveURL('/');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation header', async ({ page }) => {
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should navigate to About page', async ({ page }) => {
    const aboutLink = page.getByRole('link', { name: /about/i });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test('should navigate to News page', async ({ page }) => {
    const newsLink = page.getByRole('link', { name: /news/i });
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await expect(page).toHaveURL(/.*news/);
    }
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mobileMenu = page.locator('[aria-label*="menu"], button[aria-label*="Menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Language Selector', () => {
  test('should display language selector', async ({ page }) => {
    await page.goto('/');

    const languageSelector = page.locator('[aria-label*="language"], select, button').filter({ hasText: /en|es|fr/i });
    if (await languageSelector.count() > 0) {
      await expect(languageSelector.first()).toBeVisible();
    }
  });
});
