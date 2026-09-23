import { test, expect } from "@playwright/test";

const NAMES = [
  "--surface-0", "--surface-1", "--surface-2",
  "--text-primary", "--text-secondary", "--text-muted",
  "--live", "--warn", "--border", "--border-strong",
  "--font-ar", "--font-en", "--font-mono",
];

const readTokens = (names: string[]) =>
  names.map(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim());

test("every token resolves in both colour schemes", async ({ page }) => {
  for (const scheme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ar");
    const values = await page.evaluate(readTokens, NAMES);
    values.forEach((value, index) => expect(value, `${NAMES[index]} in ${scheme}`).not.toBe(""));
  }
});

test("the palette actually changes between schemes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/ar");
  const dark = await page.evaluate(readTokens, ["--surface-0", "--text-primary"]);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/ar");
  const light = await page.evaluate(readTokens, ["--surface-0", "--text-primary"]);
  expect(dark[0]).not.toBe(light[0]);
  expect(dark[1]).not.toBe(light[1]);
});

test("the page background follows the surface token", async ({ page }) => {
  await page.goto("/ar");
  const [background, surface] = await page.evaluate(() => [
    getComputedStyle(document.body).backgroundColor,
    getComputedStyle(document.documentElement).getPropertyValue("--surface-0").trim(),
  ]);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
  expect(surface).not.toBe("");
});

test("each language resolves to its own font stack", async ({ page }) => {
  await page.goto("/ar");
  const arabic = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  await page.goto("/en");
  const latin = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(arabic).not.toBe("");
  expect(latin).not.toBe("");
  expect(arabic).not.toBe(latin);
});

test("body text meets AA contrast on both surfaces in both schemes", async ({ page }) => {
  for (const scheme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ar");
    const ratios = await page.evaluate(() => {
      const value = (name: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const channel = (hex: string) => {
        const n = hex.replace("#", "");
        const full = n.length === 3 ? n.split("").map(c => c + c).join("") : n;
        return [0, 2, 4].map(i => {
          const c = parseInt(full.slice(i, i + 2), 16) / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
      };
      const luminance = (hex: string) => {
        const [r, g, b] = channel(hex);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a: string, b: string) => {
        const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
        return (x + 0.05) / (y + 0.05);
      };
      const pairs: [string, string][] = [
        ["--text-primary", "--surface-0"],
        ["--text-primary", "--surface-1"],
        ["--text-secondary", "--surface-0"],
        ["--text-secondary", "--surface-1"],
        ["--text-muted", "--surface-0"],
        ["--text-muted", "--surface-1"],
        ["--live", "--surface-0"],
        ["--live", "--surface-1"],
        ["--warn", "--surface-0"],
      ];
      return pairs.map(([fg, bg]) => ({ pair: `${fg} on ${bg}`, ratio: ratio(value(fg), value(bg)) }));
    });
    for (const { pair, ratio } of ratios)
      expect(ratio, `${pair} in ${scheme}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("no horizontal overflow at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/ar");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
