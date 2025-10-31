import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "html",
  timeout: 30 * 1000,

  use: {
    baseURL: "http://127.0.0.1:5173",
    channel: "chrome",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "Google Chrome",
      use: {...devices["Desktop Chrome"]},
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
