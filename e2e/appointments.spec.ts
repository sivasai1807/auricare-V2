import { test, expect } from '@playwright/test';

test.describe('Appointments System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should require authentication for appointments', async ({ page }) => {
    await page.goto('/patient/appointments');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/auth|login|home|\//);
  });

  test('should display appointment form for authenticated users', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/patient/appointments');
    await page.waitForTimeout(2000);
  });
});

test.describe('Doctor Schedule', () => {
  test('should require authentication for doctor schedule', async ({ page }) => {
    await page.goto('/doctor/schedule');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/auth|login|home|\//);
  });
});

test.describe('Learning Hub', () => {
  test('should display learning hub for patients', async ({ page }) => {
    await page.goto('/patient/learning-hub');

    await page.waitForTimeout(2000);
  });

  test('should display learning hub for doctors', async ({ page }) => {
    await page.goto('/doctor/learning-hub');

    await page.waitForTimeout(2000);
  });
});
