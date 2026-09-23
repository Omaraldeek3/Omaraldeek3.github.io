import { test, expect } from "@playwright/test";
import config from "../next.config";

test("no static export branch remains", () => {
  expect(config).not.toHaveProperty("output");
  expect(config).not.toHaveProperty("trailingSlash");
});

test("the old tools path redirects into the lab", async () => {
  const redirects = await config.redirects!();
  const tools = redirects.find(r => r.source === "/tools");
  expect(tools?.destination).toBe("/ar/lab/cut-studio");
  expect(tools?.permanent).toBe(true);
});
