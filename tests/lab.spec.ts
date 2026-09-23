import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";
import { toolIds } from "../src/toolkit/copy";
import { studies } from "../src/lab/design-studies/studies";
import { systems } from "../src/lab/ai-automation/systems";

for (const slug of ["ai-automation", "cut-studio", "design-studies", "saas-panel"]) {
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

test("the automation page lists the factory's six real stations with their tools", async ({ page }) => {
  await page.goto("/ar/lab/ai-automation");
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
  await expect(page.locator(".study")).toHaveCount(3 + studies.length);
  await expect(page.locator(".study-disclosure")).toContainText(copy.ar.concept);
});

test("a study detail page comes back to the lab, not to an old section", async ({ page }) => {
  await page.goto("/ar/work/finjan");
  await expect(page.locator(".back-link")).toHaveAttribute("href", "/ar/lab/design-studies");
});

test("the automation page documents every system around the factory", async ({ page }) => {
  await page.goto("/en/lab/ai-automation");
  await expect(page.locator(".system-card")).toHaveCount(systems.length);
  const details = page.locator(".system-details").first();
  await details.locator("summary").click();
  await expect(details.locator("li").first()).toBeVisible();
});

test("the old factory address redirects to the automation page", async ({ page }) => {
  await page.goto("/en/lab/shorts-factory");
  await expect(page).toHaveURL(/\/en\/lab\/ai-automation$/);
});

test("no copy shows its bidi brackets", async ({ page }) => {
  await page.goto("/ar/lab/ai-automation");
  expect(await page.locator("main").innerText()).not.toMatch(/\[[A-Za-z]/);
});

test("a design study opens with its identity board and its page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/ar/lab/design-studies");
  await page.locator(`.study[href='/ar/studies/${studies[0].slug}']`).click();
  await expect(page).toHaveURL(new RegExp(`/ar/studies/${studies[0].slug}$`));
  await expect(page.locator("h1")).toHaveText(studies[0].ar.name);
  await expect(page.locator(".board-palette li")).toHaveCount(6);
  await expect(page.locator(".study-live .concept")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the studies filter narrows the gallery by field", async ({ page }) => {
  await page.goto("/en/lab/design-studies");
  await page.locator(".study-filter button", { hasText: "Food" }).click();
  const expected = studies.filter(study => study.category === "food").length + 1;
  await expect(page.locator(".study:visible")).toHaveCount(expected);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".study:visible")).toHaveCount(3 + studies.length);
});

test("every study page is served in both locales", async ({ request }) => {
  for (const study of studies)
    for (const locale of ["ar", "en"])
      expect((await request.get(`/${locale}/studies/${study.slug}`)).status(), study.slug).toBe(200);
});

test("the saas panel keeps a new lead after a reload", async ({ page }) => {
  await page.goto("/en/lab/saas-panel#crm");
  await page.getByRole("button", { name: /New lead/ }).click();
  await page.getByLabel("Name").fill("Test Lead");
  await page.getByLabel("Value").fill("4200");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator(".sp-lead", { hasText: "Test Lead" })).toBeVisible();
  await page.reload();
  await expect(page.locator(".sp-lead", { hasText: "Test Lead" })).toBeVisible();
});

test("the saas panel refuses a double booking", async ({ page }) => {
  await page.goto("/en/lab/saas-panel#bookings");
  const add = async () => {
    await page.getByRole("button", { name: /New booking/ }).click();
    await page.getByLabel("Name").fill("Overlap");
    await page.getByLabel("Start").fill("17:00");
    await page.getByRole("button", { name: "Save" }).click();
  };
  await add();
  await expect(page.locator(".sp-booking", { hasText: "Overlap" })).toHaveCount(1);
  await add();
  await expect(page.locator(".sp-problem")).toContainText("overlaps");
});

test("the saas panel switches apps from the sidebar and the hash", async ({ page }) => {
  await page.goto("/ar/lab/saas-panel");
  await expect(page.locator(".sp-kpi").first()).toBeVisible();
  for (const [hash, selector] of [["invoices", ".sp-table"], ["inventory", ".sp-stock-table"], ["crm", ".sp-board"], ["bookings", ".sp-calendar"]] as const) {
    await page.goto(`/ar/lab/saas-panel#${hash}`);
    await expect(page.locator(selector)).toBeVisible();
  }
});

test("an unknown slug is a 404", async ({ page }) => {
  expect((await page.goto("/ar/lab/nope"))?.status()).toBe(404);
});

test("the CDR route is reachable on this runtime", async ({ request }) => {
  expect((await request.get("/api/tools/cdr")).status()).toBe(200);
});
