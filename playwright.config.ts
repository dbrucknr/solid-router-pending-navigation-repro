import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:6137", browserName: "chromium" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:6137/start",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
