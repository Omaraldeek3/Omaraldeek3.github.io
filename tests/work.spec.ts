import { test, expect } from "@playwright/test";
import { copy, projects } from "../src/content/site";

/*
 * The three design studies' own pages (/work/<slug>) and their previews.
 * Their stylesheet once went away with the old visual layer and nothing
 * noticed: these checks fail if the pages lose their layout again.
 */

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: a study's page is laid out, not raw text`, async ({ page }) => {
    for (const project of projects) {
      await page.goto(`/${locale}/work/${project.slug}`);
      await expect(page.locator("h1")).toHaveText(project[locale].name);
      // The study sits in its own framed panel, and the case notes are cards.
      const frame = page.locator(".work-frame");
      await expect(frame).toBeVisible();
      expect(await frame.evaluate(el => getComputedStyle(el).paddingTop)).not.toBe("0px");
      await expect(page.locator(".work-case article")).toHaveCount(3);
      expect(await page.locator(".work-case-grid").evaluate(el => getComputedStyle(el).display)).toBe("grid");
      // The phone-sized copy really is phone-sized.
      const [desktop, phone] = await Promise.all([
        page.locator(".showcase-desktop").boundingBox(),
        page.locator(".showcase-mobile").boundingBox(),
      ]);
      expect(phone!.width).toBeLessThan(desktop!.width / 2);
    }
  });
}

test("the next study is a clear, finger-sized link", async ({ page }) => {
  await page.goto("/ar/work/finjan");
  const next = page.getByRole("navigation", { name: copy.ar.nextProject }).getByRole("link");
  await expect(next).toHaveAttribute("href", "/ar/work/forma");
  const box = await next.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(24);
});

test("study photos are cropped to their frame, never stretched", async ({ page }) => {
  await page.goto("/en/work/forma");
  const fit = await page.locator(".interior-image img").first().evaluate(el => getComputedStyle(el).objectFit);
  expect(fit).toBe("cover");
});

test("the mock browser bar's address fits inside the bar", async ({ page }) => {
  await page.goto("/en/work/madar");
  const { text, bar } = await page.locator(".work-frame .preview-browser").evaluate(el => ({
    text: parseFloat(getComputedStyle(el).fontSize),
    bar: el.getBoundingClientRect().height,
  }));
  expect(text).toBeLessThan(bar);
});

test("a study's preview page keeps the site's spacing around its notice", async ({ page }) => {
  await page.goto("/ar/work/finjan/preview");
  const notice = page.locator(".demo-notice");
  await expect(notice.locator("h1")).toBeVisible();
  const { left, right } = await notice.evaluate(el => {
    const box = el.getBoundingClientRect();
    return { left: box.left, right: innerWidth - box.right };
  });
  expect(left).toBeGreaterThan(8);
  expect(right).toBeGreaterThan(8);
  expect(await page.locator(".demo-columns").evaluate(el => getComputedStyle(el).display)).toBe("grid");
});

test("study cards are named by their title, not by the mock site inside them", async ({ page }) => {
  await page.goto("/ar/lab/design-studies");
  const first = page.locator("a.study").first();
  await expect(first.locator(".study-frame")).toHaveAttribute("aria-hidden", "true");
  const name = await first.evaluate(el =>
    [...el.querySelectorAll(".study-meta")].map(meta => meta.textContent).join(" ").trim(),
  );
  await expect(first).toHaveAccessibleName(new RegExp(projects[0].ar.name));
  await expect(first).not.toHaveAccessibleName(/\.concept/);
  expect(name.length).toBeLessThan(80);
});
