import { test, expect, type Page } from "@playwright/test";
import { copy } from "../src/content/site";
import { toolIds } from "../src/toolkit/copy";
const baseURL = process.env.PORTFOLIO_TEST_URL || "http://localhost:3000";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}
// trailingSlash in the static export may add "/" before the query or the hash.
const toolsHref = (locale: string) => locale === "ar" ? /^\/tools\/?\?lang=ar$/ : /^\/tools\/?$/;
const sectionHref = (locale: string, id: string) => new RegExp(`^/${locale}/?#${id}$`);

// §7.2 #1: every width, both directions, no document overflow, no console errors.
for (const locale of ["ar", "en"] as const) {
  for (const width of [375, 768, 1440]) {
    test(`${locale} home at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = watchErrors(page);
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.locator("h1")).toBeVisible();
      for (const id of ["code", "systems-flow", "cut-studio", "studies", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      // The studies strip scrolls on its own only below 1025px.
      const stripScrolls = await page.locator(".studies-strip").evaluate(node => node.scrollWidth > node.clientWidth);
      expect(stripScrolls).toBe(width < 1025);
      expect(errors).toEqual([]);
    });
  }
}

// §7.2 #2: every nav link is absolute, in both locales and in the mobile dialog.
for (const locale of ["ar", "en"] as const) {
  test(`${locale} nav links are absolute`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    const desktop = page.locator(".desktop-nav a");
    await expect(desktop).toHaveCount(4);
    for (const [index, id] of ["code", "design", "systems"].entries()) await expect(desktop.nth(index)).toHaveAttribute("href", sectionHref(locale, id));
    await expect(desktop.nth(3)).toHaveAttribute("href", toolsHref(locale));
    await expect(page.locator(".nav-contact")).toHaveAttribute("href", sectionHref(locale, "contact"));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: copy[locale].menu }).click();
    const mobile = page.getByRole("dialog").locator("nav a");
    await expect(mobile).toHaveCount(4);
    for (const [index, id] of ["code", "design", "systems"].entries()) await expect(mobile.nth(index)).toHaveAttribute("href", sectionHref(locale, id));
    await expect(mobile.nth(3)).toHaveAttribute("href", toolsHref(locale));
  });
}

// §7.2 #3: study page, home, Cut Studio, then back.
test("study to home to Cut Studio and back keeps Arabic", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = watchErrors(page);
  await page.goto("/ar/work/forma/");
  await page.locator(".desktop-nav").getByRole("link", { name: copy.ar.nav[2] }).click();
  await expect(page).toHaveURL(/\/ar\/?#systems$/);
  await expect(page.locator("#systems")).toBeInViewport();
  await page.locator(".desktop-nav").getByRole("link", { name: /Cut Studio/ }).click();
  await expect(page).toHaveURL(/\/tools\/?\?lang=ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goBack();
  await expect(page).toHaveURL(/\/ar\/?#systems$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(errors).toEqual([]);
});

// §7.2 #4 and #5: the factory and the tool list are server content.
test("without JavaScript the factory has six stations and Buzz sits outside the list", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`${baseURL}/${locale}`);
    const stations = page.locator("#systems-flow ol > li");
    await expect(stations).toHaveCount(6);
    for (const [index, station] of copy[locale].stations.entries()) {
      for (const tag of station.tags) await expect(stations.nth(index)).toContainText(tag);
    }
    const aside = page.locator("#systems-flow aside");
    await expect(aside).toContainText("Buzz");
    await expect(page.locator("#systems-flow ol aside")).toHaveCount(0);
    await expect(page.locator("#cut-studio .studio-tools > li")).toHaveCount(toolIds.length);
    await expect(page.locator("#studies .study")).toHaveCount(3);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.locator(".brief > summary").click();
  await expect(page.locator("#brief-name")).toBeDisabled();
  await context.close();
});

// §7.2 #6 and #8: reduced motion runs nothing, and empty contacts render no links.
test("reduced motion has no packet and no running animations; empty profile renders no contact links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // The server cannot know the preference, so this also guards against a
  // hydration mismatch in any component that reads it.
  const errors = watchErrors(page);
  await page.goto("/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await expect(page.locator("#systems-flow .factory-packet")).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
  const contact = page.locator("#contact");
  await expect(contact.locator('a[href^="https://wa.me/"]')).toHaveCount(0);
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(contact.locator("a[target=_blank]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

// §7.2 #7: reflow at a 720px viewport (a 1440 layout at 200%) and a short screen.
// This is reflow, not browser zoom; real zoom is checked by hand (§11.2).
for (const [width, height] of [[720, 900], [1280, 600]]) {
  test(`factory stays readable at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/ar");
    for (const station of await page.locator("#systems-flow .station").all()) {
      await station.scrollIntoViewIfNeeded();
      await expect(station.locator("h3")).toBeVisible();
      await expect(station.locator(".station-text")).toBeVisible();
    }
    const sticky = await page.locator("#systems-flow, #systems-flow *").evaluateAll(nodes => nodes.filter(node => getComputedStyle(node).position === "sticky").length);
    expect(sticky).toBe(0);
  });
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
  await page.getByRole("dialog").getByRole("link", { name: /Systems/ }).tap();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto(`${baseURL}/en/work/finjan/preview`);
  await page.getByRole("link", { name: "Explore our coffee" }).tap();
  await expect(page).toHaveURL(/#demo-section-1$/);
  await expect(page.locator("#demo-section-1")).toContainText("Espresso");
  await context.close();
});

test("unknown projects return 404", async ({ request }) => {
  const response = await request.get("/en/work/missing-project");
  expect(response.status()).toBe(404);
});

test("English does not download the full Arabic font for a language label", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  const arabicFont = await page.evaluate(() => performance.getEntriesByType("resource").filter(e => /noto_sans_arabic|tajawal_arabic/.test(e.name)));
  expect(arabicFont).toHaveLength(0);
  await expect(page.locator(".language-switch")).toBeVisible();
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
