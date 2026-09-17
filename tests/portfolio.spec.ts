import { test, expect } from "@playwright/test";
const baseURL = process.env.PORTFOLIO_TEST_URL || "http://localhost:3000";

for (const locale of ["ar", "en"]) {
  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`${locale} responsive ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".work-card")).toHaveCount(3);
      for (const id of ["work", "services", "process", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }
}

test("language switch preserves project route; all concepts have real details", async ({ page }) => {
  for (const slug of ["finjan", "forma", "madar"]) {
    await page.goto(`/ar/work/${slug}`);
    await expect(page.locator("h1")).toBeVisible();
    await page.locator(".language-switch").click();
    await expect(page).toHaveURL(`/en/work/${slug}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".project-disclosure").first()).toContainText("not a client project");
    await page.getByRole("link", { name: "Open local preview" }).click();
    await expect(page.locator(".demo-page")).toBeVisible();
  }
});

test("mobile menu traps focus, closes on Escape and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar");
  const trigger = page.getByRole("button", { name: "فتح القائمة" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator("a").last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("reduced motion removes sticky stacking and FAQ works by keyboard", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator(".work-card").first()).toHaveCSS("position", "relative");
  const question = page.locator(".faq-list summary").first();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq-list details").first()).toHaveAttribute("open", "");
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("brief validates input and downloads locally without submitting", async ({ page }) => {
  await page.goto("/en");
  await page.locator(".brief > summary").click();
  await page.getByRole("button", { name: "Download project brief" }).click();
  await expect(page.locator("#brief-name:invalid")).toHaveCount(1);
  await page.getByLabel("Your name or project name").fill("Sample project");
  await page.getByLabel("What would you like to build?").fill("A bilingual website for a small local business.");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download project brief" }).click();
  expect((await download).suggestedFilename()).toBe("project-brief.txt");
  await expect(page.getByRole("status")).toContainText("No information has been sent");
});

test("touch navigation and local demo actions work", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(`${baseURL}/en`);
  await page.getByRole("button", { name: "Open menu" }).tap();
  await page.getByRole("dialog").getByRole("link", { name: /Work/ }).tap();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto(`${baseURL}/en/work/finjan/preview`);
  await page.getByRole("link", { name: "Explore our coffee" }).tap();
  await expect(page).toHaveURL(/#demo-section-1$/);
  await expect(page.locator("#demo-section-1")).toContainText("Espresso");
  await context.close();
});

test("server content works without JavaScript and unknown projects return 404", async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/ar`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".work-card")).toHaveCount(3);
  await page.locator(".brief > summary").click();
  await expect(page.locator("#brief-name")).toBeDisabled();
  const response = await request.get("/en/work/missing-project");
  expect(response.status()).toBe(404);
  await context.close();
});

test("English does not download the full Arabic font for a language label", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  const arabicFont = await page.evaluate(() => performance.getEntriesByType("resource").filter(e => /noto_sans_arabic|tajawal_arabic/.test(e.name)));
  expect(arabicFont).toHaveLength(0);
  await expect(page.locator(".language-switch")).toBeVisible();
});

test("mobile hero stays static during scrolling and work previews are not clipped", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar");
  await expect(page.locator(".composition-cards")).toHaveCSS("transform", "none");
  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(page.locator(".composition-cards")).toHaveCSS("transform", "none");
  await expect(page.locator(".work-card").first()).toHaveCSS("position", "relative");
  const clipped = await page.locator(".work-preview").evaluateAll(nodes => nodes.filter(node => node.scrollHeight > node.clientHeight + 2).length);
  expect(clipped).toBe(0);
});

test("project details and previews fit the narrowest supported phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of ["ar", "en"]) {
    for (const project of ["finjan", "forma", "madar"]) {
      for (const suffix of ["", "/preview"]) {
        await page.goto(`/${locale}/work/${project}${suffix}`);
        await expect(page.locator("h1")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  }
});
