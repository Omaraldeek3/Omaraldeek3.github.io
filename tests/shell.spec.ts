import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";

test("the nav holds the four section links and no Cut Studio entry", async ({ page }) => {
  await page.goto("/ar");
  const nav = page.locator("nav");
  await expect(nav).not.toContainText("Cut Studio");
  // Each link carries the locale, so it leads home from any page.
  for (const id of ["#lab", "#process", "#about", "#contact"])
    await expect(nav.locator(`a[href='/ar${id}']`)).toHaveCount(1);
});

test("the locale switch keeps you on the same page", async ({ page }) => {
  await page.goto("/ar");
  await page.locator(".locale-switch").click();
  await expect(page).toHaveURL(/\/en$/);
  await page.locator(".locale-switch").click();
  await expect(page).toHaveURL(/\/ar$/);
});

test("a skip link comes first in tab order", async ({ page }) => {
  await page.goto("/ar");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#main");
});

test("the footer names Omar and carries the year", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}`);
    const footer = page.locator("footer");
    await expect(footer).toContainText(String(new Date().getFullYear()));
    await expect(footer).toContainText(copy[locale].footerNote);
  }
});
