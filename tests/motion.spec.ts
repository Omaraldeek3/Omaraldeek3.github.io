import { test, expect } from "@playwright/test";

test("the hero renders a canvas marked decorative", async ({ page }) => {
  await page.goto("/ar");
  const canvas = page.locator("canvas.hero-scene");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
});

test("reduced motion leaves a still frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar");
  const canvas = page.locator("canvas.hero-scene");
  await expect(canvas).toBeVisible();
  const first = await canvas.screenshot();
  await page.waitForTimeout(700);
  expect(Buffer.compare(first, await canvas.screenshot())).toBe(0);
});

test("without reduced motion the scene actually animates", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ar");
  const canvas = page.locator("canvas.hero-scene");
  await expect(canvas).toBeVisible();
  const first = await canvas.screenshot();
  await page.waitForTimeout(700);
  expect(Buffer.compare(first, await canvas.screenshot())).not.toBe(0);
});

test("the headline stays readable over the scene", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toBeVisible();
  const box = await page.locator("h1").boundingBox();
  expect(box!.width).toBeGreaterThan(0);
});

test("the scene does not throw on any viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/ar");
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
});
