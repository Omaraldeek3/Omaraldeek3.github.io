import { test, expect } from "@playwright/test";

test.describe("without javascript", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of ["ar", "en"] as const) {
    test(`${locale}: every section is still readable`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("h1")).toBeVisible();
      for (const id of ["lab", "process", "about", "contact"])
        await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(".lab-card").first()).toBeVisible();
      await expect(page.locator(".field-card")).toHaveCount(5);
    });
  }

  test("the factory stations are readable without scripts", async ({ page }) => {
    await page.goto("/ar/lab/ai-automation");
    await expect(page.locator(".station")).toHaveCount(6);
  });

  test("the design studies are readable without scripts", async ({ page }) => {
    await page.goto("/ar/lab/design-studies");
    await expect(page.locator(".study")).toHaveCount(20);
  });

  test("the locale switch is a plain link", async ({ page }) => {
    await page.goto("/ar");
    await page.locator(".locale-switch").click();
    await expect(page).toHaveURL(/\/en$/);
  });
});

test("exactly one h1 and no skipped heading level", async ({ page }) => {
  for (const path of ["/ar", "/en", "/ar/lab/ai-automation"]) {
    await page.goto(path);
    await expect(page.locator("h1"), path).toHaveCount(1);
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3")].map(h => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++)
      expect(levels[i] - levels[i - 1], `${path} at heading ${i}`).toBeLessThanOrEqual(1);
  }
});

test("keyboard focus reaches the nav and the contact form", async ({ page }) => {
  await page.goto("/ar");
  const seen: string[] = [];
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => document.activeElement?.tagName ?? ""));
  }
  expect(seen).toContain("A");
  expect(seen.some(tag => ["INPUT", "TEXTAREA", "BUTTON"].includes(tag))).toBe(true);
});

test("every image and canvas is labelled or explicitly decorative", async ({ page }) => {
  for (const path of ["/ar", "/ar/lab/design-studies", "/ar/lab/ai-automation"]) {
    await page.goto(path);
    const unlabelled = await page.evaluate(() =>
      [...document.querySelectorAll("img, canvas")].filter(
        el =>
          !el.getAttribute("alt") &&
          el.getAttribute("aria-hidden") !== "true" &&
          !el.getAttribute("aria-label"),
      ).length);
    expect(unlabelled, path).toBe(0);
  }
});

test("no console errors on the main routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  for (const path of [
    "/ar", "/en",
    "/ar/lab/cut-studio", "/ar/lab/ai-automation", "/ar/lab/design-studies",
    "/ar/work/finjan",
  ]) {
    await page.goto(path);
    await page.waitForTimeout(400);
  }
  expect(errors).toEqual([]);
});
