import { test, expect, type Page } from "@playwright/test";

// E1: Cut Studio opens in Arabic from /tools?lang=ar and nowhere else.
// The static HTML always starts in English; the switch happens after hydration.

function watchHydration(page: Page) {
  const messages: string[] = [];
  page.on("console", message => { if (/hydrat/i.test(message.text())) messages.push(message.text()); });
  page.on("pageerror", error => { if (/hydrat/i.test(error.message)) messages.push(error.message); });
  return messages;
}

test("/tools stays English and reports no hydration warning", async ({ page }) => {
  const warnings = watchHydration(page);
  await page.goto("/tools");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("button", { name: "العربية" })).toBeVisible();
  expect(warnings).toEqual([]);
});

test("/tools?lang=ar becomes Arabic with lang and dir set", async ({ page }) => {
  const warnings = watchHydration(page);
  await page.goto("/tools?lang=ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("button", { name: "English" })).toBeVisible();
  expect(warnings).toEqual([]);
});

test("an unknown lang value stays English", async ({ page }) => {
  const warnings = watchHydration(page);
  await page.goto("/tools?lang=xx");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(warnings).toEqual([]);
});

test("the in-app toggle still switches back to English after ?lang=ar", async ({ page }) => {
  await page.goto("/tools?lang=ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("button", { name: "العربية" })).toBeVisible();
});
