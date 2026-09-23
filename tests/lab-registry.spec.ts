import { test, expect } from "@playwright/test";
import { labWorks, getLabWork } from "../src/lab/registry";
import { copy } from "../src/content/site";
import { locales } from "../src/content/locales";

test("every field points at a registered work", () => {
  for (const locale of locales)
    for (const field of copy[locale].fields)
      expect(getLabWork(field.slug), field.slug).toBeDefined();
});

test("five fields in each locale", () => {
  for (const locale of locales) expect(copy[locale].fields).toHaveLength(5);
});

test("slugs are unique and url safe", () => {
  const slugs = labWorks.map(w => w.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
});

test("every work is titled and described in both locales", () => {
  for (const work of labWorks)
    for (const locale of locales) {
      expect(work.title[locale].trim(), `${work.slug}.title.${locale}`).not.toBe("");
      expect(work.blurb[locale].trim(), `${work.slug}.blurb.${locale}`).not.toBe("");
    }
});

test("the three real works are live and only the saas panel is pending", () => {
  expect(getLabWork("shorts-factory")?.status).toBe("live");
  expect(getLabWork("cut-studio")?.status).toBe("live");
  expect(getLabWork("design-studies")?.status).toBe("live");
  expect(getLabWork("saas-panel")?.status).toBe("building");
});

test("an unknown slug resolves to undefined", () => {
  expect(getLabWork("nope")).toBeUndefined();
});

test("both locales expose exactly the same copy keys", () => {
  const keys = (l: "ar" | "en") => Object.keys(copy[l]).sort();
  expect(keys("ar")).toEqual(keys("en"));
});

test("no copy string is empty in either locale", () => {
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") expect(value.trim(), path).not.toBe("");
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (value && typeof value === "object")
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
  };
  for (const locale of locales) walk(copy[locale], locale);
});
