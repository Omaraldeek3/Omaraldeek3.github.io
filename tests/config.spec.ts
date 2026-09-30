import { test, expect } from "@playwright/test";
import config from "../next.config";

test("no static export branch remains", () => {
  expect(config).not.toHaveProperty("output");
  expect(config).not.toHaveProperty("trailingSlash");
});

test("a bare cut-studio path lands on the lab page", async () => {
  const redirects = await config.redirects!();
  const entry = redirects.find(r => r.source === "/cut-studio");
  expect(entry?.destination).toBe("/ar/lab/cut-studio");
  expect(entry?.permanent).toBe(true);
});

test("the old toolkit path sends visitors to Cut Studio's own site", async () => {
  const redirects = await config.redirects!();
  expect(redirects.find(r => r.source === "/tools")?.destination).toBe("https://cutstudio.omardeek.tech/ar");
});
