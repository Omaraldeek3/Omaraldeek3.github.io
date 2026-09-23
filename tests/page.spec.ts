import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";
import { labWorks } from "../src/lab/registry";

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: the page leads with Omar, not with a tool`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(copy[locale].heroLines[0]);
  });

  test(`${locale}: five fields and every lab work render`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator(".field-card")).toHaveCount(5);
    await expect(page.locator(".lab-card")).toHaveCount(labWorks.length);
  });

  test(`${locale}: Cut Studio sits inside the lab`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("#lab")).toContainText("Cut Studio");
  });

  test(`${locale}: the factory is presented as a real running system`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const factory = page.locator(".lab-card[data-slug='shorts-factory']");
    await expect(factory).toHaveAttribute("data-status", "live");
    await expect(factory).toContainText(copy[locale].labLive);
  });

  test(`${locale}: no horizontal overflow at any width`, async ({ page }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      for (const id of ["lab", "process", "about", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(overflows, `${id} at ${width}`).toBe(false);
      }
    }
  });
}

test("a work still being built says so instead of pretending", async ({ page }) => {
  await page.goto("/ar");
  const building = page.locator(".lab-card[data-status='building']");
  await expect(building).toHaveCount(1);
  await expect(building).toContainText(copy.ar.labSoon);
  await expect(building.locator("a")).toHaveCount(0);
});

test("every field card links into the lab", async ({ page }) => {
  await page.goto("/ar");
  const hrefs = await page.locator(".field-card").evaluateAll(cards =>
    cards.map(card => card.getAttribute("href")));
  for (const href of hrefs) expect(href).toMatch(/^\/ar\/lab\/[a-z0-9-]+$/);
});
