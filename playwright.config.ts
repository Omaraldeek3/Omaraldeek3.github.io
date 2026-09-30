import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
// A dedicated port, not 3000. With reuseExistingServer a run would otherwise
// adopt whatever already listens on the default port — an unrelated app has
// answered these tests before, and every assertion then describes that app.
const baseURL = process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:3100";
export default defineConfig({
  testDir: "./tests", testIgnore: "**/mada-backend.test.mjs", fullyParallel: true, workers: 2,
  use: { baseURL, browserName: "chromium", channel: "msedge", screenshot: "only-on-failure" },
  ...(process.env.PORTFOLIO_TEST_URL ? {} : { webServer: {
    command: "npm run dev -- --port 3100", url: `${baseURL}/ar`,
    // Mutation tests must never adopt a preview server with real workspace data.
    reuseExistingServer: false, timeout: 120000,
    env: { MADA_DATA_DIR: join(tmpdir(), `mada-playwright-${process.pid}-${Date.now()}`), MADA_PUBLIC_ORIGIN: baseURL },
  } }),
  reporter: [["list"], ["html", { open: "never" }]],
});
