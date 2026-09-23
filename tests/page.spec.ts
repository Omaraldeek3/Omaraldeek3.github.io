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
    const factory = page.locator(".lab-card[data-slug='ai-automation']");
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

test("every lab card is live and opens its work", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator(".lab-card[data-status='building']")).toHaveCount(0);
  for (const work of labWorks)
    await expect(page.locator(`.lab-card[data-slug='${work.slug}'] a.lab-open`)).toHaveAttribute("href", `/ar/lab/${work.slug}`);
});

test("every field card links into the lab", async ({ page }) => {
  await page.goto("/ar");
  const hrefs = await page.locator(".field-card").evaluateAll(cards =>
    cards.map(card => card.getAttribute("href")));
  for (const href of hrefs) expect(href).toMatch(/^\/ar\/lab\/[a-z0-9-]+$/);
});

// The first redesign shipped a mid-sized headline that read as timid. The
// headline is the whole hero now, so its size is worth holding to.
test("the headline is set at display size on a desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ar");
  const size = await page.locator("h1").evaluate(el =>
    parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(80);
});
