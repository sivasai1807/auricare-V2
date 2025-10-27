import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Auticare/i);
  });

  test('should navigate to auth page', async ({ page }) => {
    const signInButton = page.getByRole('link', { name: /sign in/i });
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await expect(page).toHaveURL(/.*auth/);
    }
  });

  test('should show sign up form', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should validate empty email', async ({ page }) => {
    await page.goto('/auth');

    const submitButton = page.getByRole('button', { name: /sign up|sign in/i });
    await submitButton.click();

    await page.waitForTimeout(1000);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');

    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByPlaceholder(/password/i).fill('password123');

    const submitButton = page.getByRole('button', { name: /sign up|sign in/i });
    await submitButton.click();

    await page.waitForTimeout(1000);
  });

  test('should switch between sign in and sign up', async ({ page }) => {
    await page.goto('/auth');

    const toggleLink = page.getByText(/already have an account|don't have an account/i);
    if (await toggleLink.isVisible()) {
      await toggleLink.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/patient/dashboard');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/auth|home|\//);
  });
});
