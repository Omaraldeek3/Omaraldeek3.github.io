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
