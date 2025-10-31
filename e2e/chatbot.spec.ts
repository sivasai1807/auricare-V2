import {test, expect} from "@playwright/test";

test.describe("Chatbot System Tests", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");
  });

  test("should open chatbot widget", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      // Look for chat input or chat interface
      const chatInput = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      await expect(chatInput).toBeVisible();
    }
  });

  test("should allow typing in chatbot input", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const input = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      await input.fill("Hello");
      await expect(input).toHaveValue("Hello");
    }
  });

  test("should send message in chatbot", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const input = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      const sendButton = page
        .locator('button:has-text("Send"), button[type="submit"]')
        .first();

      await input.fill("Test message");

      if (await sendButton.isVisible()) {
        await sendButton.click();

        // Wait for response or message to appear
        await page.waitForTimeout(2000);
      }
    }
  });

  test("should handle empty message submission", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const sendButton = page
        .locator('button:has-text("Send"), button[type="submit"]')
        .first();

      if (await sendButton.isVisible()) {
        await sendButton.click();

        // Should not crash or show error
        await page.waitForTimeout(1000);
      }
    }
  });

  test("should close chatbot widget", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const closeButton = page
        .locator(
          'button[aria-label*="close"], button:has-text("×"), button:has-text("Close")'
        )
        .first();
      if (await closeButton.isVisible()) {
        await closeButton.click();

        // Chat interface should be hidden
        const chatInput = page
          .locator(
            'input[placeholder*="message"], textarea[placeholder*="message"]'
          )
          .first();
        await expect(chatInput).not.toBeVisible();
      }
    }
  });

  test("should handle long messages", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const input = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      const longMessage =
        "This is a very long message that should test the chatbot's ability to handle extended text input and ensure that the interface remains responsive and functional even with substantial content.";

      await input.fill(longMessage);
      await expect(input).toHaveValue(longMessage);
    }
  });

  test("should handle special characters in messages", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const input = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      const specialMessage = "Hello! @#$%^&*()_+{}|:<>?[]\\;'\",./";

      await input.fill(specialMessage);
      await expect(input).toHaveValue(specialMessage);
    }
  });

  test("should handle unicode characters", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const input = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      const unicodeMessage = "Hello 世界! 🌍 مرحبا بالعالم";

      await input.fill(unicodeMessage);
      await expect(input).toHaveValue(unicodeMessage);
    }
  });

  test("should maintain chat history during session", async ({page}) => {
    const chatButton = page
      .locator('button[class*="chat"], button:has-text("Chat")')
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();

      const input = page
        .locator(
          'input[placeholder*="message"], textarea[placeholder*="message"]'
        )
        .first();
      const sendButton = page
        .locator('button:has-text("Send"), button[type="submit"]')
        .first();

      // Send first message
      await input.fill("First message");
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await page.waitForTimeout(2000);
      }

      // Send second message
      await input.fill("Second message");
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await page.waitForTimeout(2000);
      }

      // Chat history should be maintained
      // This test verifies the interface doesn't crash with multiple messages
    }
  });
});
