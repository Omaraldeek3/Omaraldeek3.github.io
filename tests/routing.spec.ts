import { test, expect } from "@playwright/test";

test("the root redirects to Arabic", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
});

test("a path without a locale gains one", async ({ page }) => {
  await page.goto("/lab");
  await expect(page).toHaveURL(/\/ar\/lab$/);
});

test("each locale sets lang and dir", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("an unknown locale is a 404", async ({ page }) => {
  expect((await page.goto("/fr"))?.status()).toBe(404);
});

test("api routes are not rewritten by the locale proxy", async ({ request }) => {
  const status = (await request.get("/api/tools/cdr")).status();
  expect([307, 308]).not.toContain(status);
});
