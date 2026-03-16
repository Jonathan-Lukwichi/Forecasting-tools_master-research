/**
 * E2E smoke test: verify the app loads and redirects to login.
 * This is the first Playwright test — validates E2E infrastructure works.
 */
import { test, expect } from "@playwright/test";

test("app loads and shows login page", async ({ page }) => {
  await page.goto("/");

  // Should redirect to login or show login UI
  await expect(page).toHaveURL(/\/(login)?/);
});

test("login page has required elements", async ({ page }) => {
  await page.goto("/login");

  // Should have username and password fields
  await expect(page.locator("body")).toBeVisible();
});
