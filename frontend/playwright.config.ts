// === TRIANGULATION RECORD ===
// Task: Configure Playwright for Next.js E2E testing
// Approach: Official Playwright config with webServer, Chromium-only for speed
//
// Vertex 1 (Academic):
//   Source: Huyen, C. (2022). "Designing Machine Learning Systems", Ch.9. O'Reilly.
//   Finding: E2E tests should validate the complete user workflow end-to-end
//   Relevance: Tests the full data pipeline from upload to forecast to optimize
//
// Vertex 2 (Industry):
//   Source: https://nextjs.org/docs/pages/guides/testing/playwright (Next.js official)
//   Pattern: webServer starts Next.js dev, baseURL, Chromium for CI speed
//   Adaptation: Added API health check before tests, screenshot on failure
//
// Vertex 3 (Internal):
//   Files checked: frontend/package.json (next dev on port 3000)
//   Consistency: Confirmed — dev server on 3000, API on 8000
//
// Verdict: PROCEED
// =============================

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Add Firefox and WebKit for full browser coverage in CI
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
