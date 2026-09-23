import { test, expect } from "@playwright/test";
import { rateLimit, resetRateLimit } from "../src/lib/rate-limit";

test.beforeEach(() => resetRateLimit());

test("requests under the limit are allowed and count down", () => {
  const o = { limit: 3, windowMs: 60_000 };
  expect(rateLimit("a", o, 0)).toMatchObject({ ok: true, remaining: 2 });
  expect(rateLimit("a", o, 1)).toMatchObject({ ok: true, remaining: 1 });
  expect(rateLimit("a", o, 2)).toMatchObject({ ok: true, remaining: 0 });
});

test("the request over the limit is refused with a retry delay", () => {
  const o = { limit: 2, windowMs: 60_000 };
  rateLimit("b", o, 0);
  rateLimit("b", o, 0);
  const blocked = rateLimit("b", o, 10_000);
  expect(blocked.ok).toBe(false);
  expect(blocked.remaining).toBe(0);
  expect(blocked.retryAfterSeconds).toBe(50);
});

test("keys do not interfere with each other", () => {
  const o = { limit: 1, windowMs: 60_000 };
  expect(rateLimit("c", o, 0).ok).toBe(true);
  expect(rateLimit("d", o, 0).ok).toBe(true);
  expect(rateLimit("c", o, 0).ok).toBe(false);
});

test("the window rolls over", () => {
  const o = { limit: 1, windowMs: 1_000 };
  expect(rateLimit("e", o, 0).ok).toBe(true);
  expect(rateLimit("e", o, 500).ok).toBe(false);
  expect(rateLimit("e", o, 1_001).ok).toBe(true);
});
