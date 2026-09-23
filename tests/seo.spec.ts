import { test, expect } from "@playwright/test";
import { profile } from "../src/content/site";

test("each locale carries its own title and a description", async ({ page }) => {
  await page.goto("/ar");
  const arabic = await page.title();
  await expect(page.locator("meta[name='description']")).toHaveCount(1);
  await page.goto("/en");
  expect(await page.title()).not.toBe(arabic);
  await expect(page.locator("meta[name='description']")).toHaveCount(1);
});

test("a lab page carries its own title", async ({ page }) => {
  await page.goto("/ar");
  const home = await page.title();
  await page.goto("/ar/lab/ai-automation");
  expect(await page.title()).not.toBe(home);
});

test("hreflang appears only when a site url is configured", async ({ page }) => {
  await page.goto("/ar");
  const alternates = page.locator("link[rel='alternate'][hreflang]");
  await expect(alternates).toHaveCount(profile.siteUrl ? 2 : 0);
});

test("sitemap and robots are served and list the real routes", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const body = await sitemap.text();
  expect(body).toContain("/ar/lab/ai-automation");
  expect(body).toContain("/tools");
  expect(body).toContain("/ar/lab/saas-panel");
  expect(body).toContain("/ar/studies/nabd");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("/api/");
});
