import { defineConfig } from "@playwright/test";
// A dedicated port, not 3000. With reuseExistingServer a run would otherwise
// adopt whatever already listens on the default port — an unrelated app has
// answered these tests before, and every assertion then describes that app.
const baseURL = process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:3100";
export default defineConfig({
  testDir: "./tests", fullyParallel: true, workers: 2,
  use: { baseURL, browserName: "chromium", channel: "msedge", screenshot: "only-on-failure" },
  ...(process.env.PORTFOLIO_TEST_URL ? {} : { webServer: { command: "npm run dev -- --port 3100", url: `${baseURL}/ar`, reuseExistingServer: !process.env.CI, timeout: 120000 } }),
  reporter: [["list"], ["html", { open: "never" }]],
});
