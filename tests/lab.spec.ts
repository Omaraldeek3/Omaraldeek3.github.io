import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";
import { toolIds } from "../src/toolkit/copy";

for (const slug of ["shorts-factory", "cut-studio", "design-studies"]) {
  test(`${slug} opens in both locales with no page error`, async ({ page }) => {
    for (const locale of ["ar", "en"] as const) {
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(`/${locale}/lab/${slug}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(errors, `${slug} ${locale}`).toEqual([]);
    }
  });
}

test("the factory page lists all six real stations with their tools", async ({ page }) => {
  await page.goto("/ar/lab/shorts-factory");
  await expect(page.locator(".station")).toHaveCount(6);
  await expect(page.locator(".station-code")).toHaveText([
    "PLAN", "WRITE", "CHECK", "VOICE", "RENDER", "PUBLISH",
  ]);
  await expect(page.locator(".station-list")).toContainText("n8n");
  await expect(page.locator(".oversight")).toContainText("Buzz");
});

test("the cut studio page opens the workshop at its own path", async ({ page }) => {
  await page.goto("/ar/lab/cut-studio");
  const open = page.getByRole("link", { name: new RegExp(copy.ar.toolsCta) });
  await expect(open).toHaveAttribute("href", "/tools?lang=ar");
  await expect(page.locator(".studio-tools li")).toHaveCount(toolIds.length);
});

test("the workshop itself still loads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/tools");
  await expect(page.locator(".toolkit")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the design studies page links every study and says they are studies", async ({ page }) => {
  await page.goto("/ar/lab/design-studies");
  await expect(page.locator(".study")).toHaveCount(3);
  await expect(page.locator(".study-disclosure")).toContainText(copy.ar.concept);
});

test("a study detail page comes back to the lab, not to an old section", async ({ page }) => {
  await page.goto("/ar/work/finjan");
  await expect(page.locator(".back-link")).toHaveAttribute("href", "/ar/lab/design-studies");
});

test("a work still being built is not served as a page", async ({ page }) => {
  expect((await page.goto("/ar/lab/saas-panel"))?.status()).toBe(404);
});

test("an unknown slug is a 404", async ({ page }) => {
  expect((await page.goto("/ar/lab/nope"))?.status()).toBe(404);
});

test("the CDR route is reachable on this runtime", async ({ request }) => {
  expect((await request.get("/api/tools/cdr")).status()).toBe(200);
});
