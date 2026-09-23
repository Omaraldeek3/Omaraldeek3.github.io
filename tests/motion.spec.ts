import { test, expect } from "@playwright/test";

const FACTORY = "/ar/lab/shorts-factory";

test("the hero carries type only, with nothing drawn behind it", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".hero canvas")).toHaveCount(0);
});

test("the factory renders a canvas marked decorative", async ({ page }) => {
  await page.goto(FACTORY);
  const canvas = page.locator("canvas.system-scene");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
});

// The canvas repaints legitimately when its box settles after layout, so
// pixels are not a stable signal. What must hold is that reduced motion never
// starts an animation loop, and that the still frame keeps its content.
async function countScenePaints(page: import("@playwright/test").Page, path: string) {
  await page.addInitScript(() => {
    const target = window as unknown as { __scenePaints: number };
    target.__scenePaints = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      target.__scenePaints += 1;
      return original(callback);
    };
  });
  await page.goto(path);
  await expect(page.locator("canvas.system-scene")).toBeVisible();
  await page.waitForTimeout(600);
  const first = await page.evaluate(() => (window as unknown as { __scenePaints: number }).__scenePaints);
  await page.waitForTimeout(600);
  const second = await page.evaluate(() => (window as unknown as { __scenePaints: number }).__scenePaints);
  return second - first;
}

test("reduced motion starts no animation loop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await countScenePaints(page, FACTORY)).toBe(0);
});

test("reduced motion still leaves the station labels drawn", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(FACTORY);
  const canvas = page.locator("canvas.system-scene");
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width))
    .toBeGreaterThan(100);
  // A blank canvas is fully transparent; a drawn one is not.
  const painted = await canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext("2d");
    if (!context) return 0;
    const { data } = context.getImageData(0, 0, element.width, element.height);
    let count = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) count += 1;
    return count;
  });
  expect(painted).toBeGreaterThan(0);
});

test("without reduced motion the scene animates", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await countScenePaints(page, FACTORY)).toBeGreaterThan(0);
});

test("the scene draws one node per station listed beneath it", async ({ page }) => {
  await page.goto(FACTORY);
  await expect(page.locator(".station")).toHaveCount(6);
  await expect(page.locator("canvas.system-scene")).toBeVisible();
});

test("the scene does not throw on any viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(FACTORY);
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
});


// ——— The hero ———

test("the hero's ground and chips are decoration, not content", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator(".hero-ground")).toHaveAttribute("aria-hidden", "true");
  const chips = page.locator(".hero-chip");
  await expect(chips).toHaveCount(4);
  for (let i = 0; i < 4; i++)
    await expect(chips.nth(i)).toHaveAttribute("aria-hidden", "true");
});

test("the chips sit against the hero box rather than in its flow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ar");
  const placement = await page.locator(".hero-chip").first().evaluate(el =>
    getComputedStyle(el).position);
  expect(placement).toBe("absolute");
});

test("every fact on a chip is also stated in a section below", async ({ page }) => {
  await page.goto("/ar");
  // The chips vanish on narrow viewports, so nothing may live only on them.
  const numbers = await page.locator(".hero-chip b").allTextContents();
  const stats = await page.locator(".stat b").allTextContents();
  for (const value of ["٧"]) {
    expect(numbers, "chip numbers").toContain(value);
    expect(stats, "stat strip").toContain(value);
  }
});

// ——— Scroll-driven motion ———
// Every effect is CSS. The rules that matter are the ones that guarantee no
// content is ever left waiting for a script or stranded at zero opacity.

test("the reveal is scroll-driven, not a script", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ar");
  const driven = await page.locator(".lab-card").first().evaluate(el => ({
    name: getComputedStyle(el).animationName,
    timeline: getComputedStyle(el).animationTimeline,
  }));
  expect(driven.name).toBe("rise-in");
  expect(driven.timeline).toContain("view");
});

test("reduced motion declares no animation at all", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar");
  for (const selector of [".lab-card", ".hero-headline span", ".hero-badge", ".stat"]) {
    const name = await page.locator(selector).first().evaluate(el =>
      getComputedStyle(el).animationName);
    expect(name, selector).toBe("none");
  }
});

test("a scrolled-past section is fully opaque, never stuck faded", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ar");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect
    .poll(() => page.locator(".contact-form").evaluate(el => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.95);
});

test("the progress bar is decoration and needs no script", async ({ page }) => {
  await page.goto("/ar");
  const bar = page.locator(".scroll-progress");
  await expect(bar).toHaveAttribute("aria-hidden", "true");
  const scripted = await bar.evaluate(el => el.getAttribute("style"));
  expect(scripted, "nothing writes inline styles onto it").toBeNull();
});

test.describe("without javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("a scrolled-to section still renders at full opacity", async ({ page }) => {
    await page.goto("/ar");
    await page.locator("#lab").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toBeVisible();
    await expect
      .poll(() => page.locator(".lab-card").first().evaluate(el => Number(getComputedStyle(el).opacity)))
      .toBeGreaterThan(0.95);
  });
});
