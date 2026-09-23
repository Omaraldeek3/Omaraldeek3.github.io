import { test, expect } from "@playwright/test";
import {
  isLocale,
  oppositeLocale,
  hasLocalePrefix,
  localisedPath,
  defaultLocale,
  locales,
} from "../src/content/locales";

test("list and default", () => {
  expect([...locales]).toEqual(["ar", "en"]);
  expect(defaultLocale).toBe("ar");
});

test("isLocale accepts only supported values", () => {
  expect(isLocale("ar")).toBe(true);
  expect(isLocale("en")).toBe(true);
  expect(isLocale("fr")).toBe(false);
  expect(isLocale("AR")).toBe(false);
  expect(isLocale("")).toBe(false);
});

test("oppositeLocale flips the pair", () => {
  expect(oppositeLocale("ar")).toBe("en");
  expect(oppositeLocale("en")).toBe("ar");
});

test("hasLocalePrefix matches a whole segment, never a prefix of a word", () => {
  expect(hasLocalePrefix("/ar")).toBe(true);
  expect(hasLocalePrefix("/en/lab")).toBe(true);
  expect(hasLocalePrefix("/arabic")).toBe(false);
  expect(hasLocalePrefix("/lab")).toBe(false);
  expect(hasLocalePrefix("/")).toBe(false);
});

test("localisedPath sends everything to Arabic by default", () => {
  expect(localisedPath("/")).toBe("/ar");
  expect(localisedPath("/lab")).toBe("/ar/lab");
  expect(localisedPath("/lab/cut-studio")).toBe("/ar/lab/cut-studio");
  expect(localisedPath("/lab", "en")).toBe("/en/lab");
});
