import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";

test("a malformed submission is refused with 400", async ({ request }) => {
  const response = await request.post("/api/contact", {
    data: { name: "", email: "x", message: "" },
  });
  expect(response.status()).toBe(400);
});

test("a body that is not json is refused with 400", async ({ request }) => {
  const response = await request.post("/api/contact", {
    headers: { "content-type": "application/json" },
    data: "not json at all",
  });
  expect(response.status()).toBe(400);
});

test("a valid submission is refused with 503 while no mailer is configured", async ({ request }) => {
  const response = await request.post("/api/contact", {
    data: { name: "Omar", email: "a@b.co", message: "A long enough message body for the check." },
  });
  expect(response.status()).toBe(503);
  expect((await response.json()).error).toBe("not-configured");
});

test("a flood is rate limited with 429 and a retry header", async ({ request }) => {
  const payload = { name: "Flood", email: "f@b.co", message: "This is a long enough message body." };
  let limited = false;
  for (let i = 0; i < 12; i++) {
    const response = await request.post("/api/contact", { data: payload });
    if (response.status() === 429) {
      expect(response.headers()["retry-after"]).toBeDefined();
      limited = true;
      break;
    }
  }
  expect(limited).toBe(true);
});

test("unavailable contact delivery is disclosed before entering data in both locales", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator("#contact form")).toBeVisible();
    const notice = page.locator("#contact-unavailable");
    await expect(notice).toBeVisible();
    await expect(notice).toHaveText(copy[locale].contactForm.errorDisabled);
    await expect(page.locator("#contact form")).toHaveAttribute("aria-describedby", "contact-unavailable");
    await expect(page.locator("#contact input[name='name']")).toBeDisabled();
    await expect(page.locator("#contact input[name='email']")).toBeDisabled();
    await expect(page.locator("#contact textarea[name='message']")).toBeDisabled();
    await expect(page.locator("#contact button[type='submit']")).toBeDisabled();
  }
});

test("unset contact channels are hidden, not faked", async ({ page }) => {
  await page.goto("/ar");
  const channels = page.locator(".contact-channels");
  await expect(channels.locator("a[href^='https://wa.me/']")).toHaveCount(0);
  await expect(channels.locator("a[href^='mailto:']")).toHaveCount(0);
  await expect(channels).toContainText(copy.ar.pendingContact);
});

test("unavailable delivery remains disabled without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/ar");
  await expect(page.locator("#contact-unavailable")).toHaveText(copy.ar.contactForm.errorDisabled);
  await expect(page.locator("#contact button[type='submit']")).toBeDisabled();
  await context.close();
});
