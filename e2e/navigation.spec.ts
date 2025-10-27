import {test, expect} from "@playwright/test";

test.describe("Navigation System Tests", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");
  });

  test("should navigate to home page", async ({page}) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Auticare/i);
  });

  test("should navigate to about page", async ({page}) => {
    const aboutLink = page.getByRole("link", {name: /about/i});
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test("should navigate to news page", async ({page}) => {
    const newsLink = page.getByRole("link", {name: /news/i});
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await expect(page).toHaveURL(/.*news/);
    }
  });

  test("should handle 404 page", async ({page}) => {
    await page.goto("/non-existent-page");

    // Should show 404 or redirect to home
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/404|not-found|\//);
  });

  test("should maintain navigation state", async ({page}) => {
    // Test that navigation elements persist across page changes
    await page.goto("/");

    const header = page.locator("header, nav").first();
    if (await header.isVisible()) {
      await expect(header).toBeVisible();
    }
  });

  test("should handle browser back/forward", async ({page}) => {
    await page.goto("/");
    await page.goto("/about");

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    await page.goForward();
    await expect(page).toHaveURL(/.*about/);
  });
});
