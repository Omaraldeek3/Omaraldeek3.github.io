import { test, expect } from "@playwright/test";
import { validateContact } from "../src/lib/validate";
import { clientIp } from "../src/lib/client-ip";

const good = { name: "Omar", email: "a@b.co", message: "I need an automation system for orders." };

test("a complete submission passes and is trimmed", () => {
  const result = validateContact({ ...good, name: "  Omar  " });
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.value.name).toBe("Omar");
});

test("missing or malformed fields are refused", () => {
  expect(validateContact(null).ok).toBe(false);
  expect(validateContact("nope").ok).toBe(false);
  expect(validateContact({}).ok).toBe(false);
  expect(validateContact({ ...good, name: "" }).ok).toBe(false);
  expect(validateContact({ ...good, email: "not-an-email" }).ok).toBe(false);
  expect(validateContact({ ...good, message: "too short" }).ok).toBe(false);
  expect(validateContact({ ...good, name: 42 }).ok).toBe(false);
});

test("oversized fields are refused rather than truncated", () => {
  expect(validateContact({ ...good, message: "x".repeat(5001) }).ok).toBe(false);
  expect(validateContact({ ...good, name: "x".repeat(201) }).ok).toBe(false);
});

test("clientIp takes the first forwarded hop and falls back safely", () => {
  const withHeader = (headers: Record<string, string>) => new Request("https://x.dev", { headers });
  expect(clientIp(withHeader({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  expect(clientIp(withHeader({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  expect(clientIp(withHeader({}))).toBe("unknown");
});
