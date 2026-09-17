import { defineConfig } from "@playwright/test";
const baseURL = process.env.PORTFOLIO_TEST_URL || "http://localhost:3000";
export default defineConfig({
  testDir: "./tests", fullyParallel: true, workers: 2,
  use: { baseURL, browserName: "chromium", channel: "msedge", screenshot: "only-on-failure" },
  ...(process.env.PORTFOLIO_TEST_URL ? {} : { webServer: { command: "npm run dev", url: `${baseURL}/ar`, reuseExistingServer: !process.env.CI, timeout: 120000 } }),
  reporter: [["list"], ["html", { open: "never" }]],
});
