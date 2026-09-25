import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";

test("the nav holds the four section links and no Cut Studio entry", async ({ page }) => {
  await page.goto("/ar");
  const nav = page.locator("nav");
  await expect(nav).not.toContainText("Cut Studio");
  // Each link carries the locale, so it leads home from any page. The phone
  // menu repeats the same four links.
  for (const id of ["#lab", "#process", "#about", "#contact"]) {
    await expect(nav.locator(`.nav-links a[href='/ar${id}']`)).toHaveCount(1);
    await expect(nav.locator(`.nav-menu a[href='/ar${id}']`)).toHaveCount(1);
  }
});

test("on a phone the section links sit behind a menu that closes after a choice", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar");
  await expect(page.locator(".nav-links")).toBeHidden();
  const menu = page.locator(".nav-menu");
  await menu.locator("summary").click();
  await menu.locator("a[href='/ar#contact']").click();
  await expect(page).toHaveURL(/\/ar#contact$/);
  await expect(menu).not.toHaveAttribute("open", "");
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
