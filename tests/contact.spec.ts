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

test("the contact form renders in both locales", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator("#contact form")).toBeVisible();
    await expect(page.locator("#contact input[name='email']")).toBeVisible();
    await expect(page.locator("#contact textarea[name='message']")).toBeVisible();
  }
});

test("unset contact channels are hidden, not faked", async ({ page }) => {
  await page.goto("/ar");
  const channels = page.locator(".contact-channels");
  await expect(channels.locator("a[href^='https://wa.me/']")).toHaveCount(0);
  await expect(channels.locator("a[href^='mailto:']")).toHaveCount(0);
  await expect(channels).toContainText(copy.ar.pendingContact);
});

test("an empty submission shows a message, never a false success", async ({ page }) => {
  await page.goto("/ar");
  await page.locator("#contact button[type='submit']").click();
  const alert = page.locator("#contact [role='alert']");
  await expect(alert).toBeVisible();
  // Which refusal it is depends on whether this run already tripped the rate
  // limit. What must never happen is a success message for an empty form.
  const form = copy.ar.contactForm;
  await expect(alert).not.toHaveText(form.sent);
  await expect(alert).toHaveClass(/contact-problem/);
  expect([form.errorValidation, form.errorRate]).toContain(await alert.textContent());
});
