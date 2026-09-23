import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { validateContact } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

const json = (body: object, status: number, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "cache-control": "no-store", ...headers } });

export async function POST(request: Request) {
  const limit = rateLimit(`contact:${clientIp(request)}`, LIMIT);
  if (!limit.ok)
    return json({ error: "rate-limited" }, 429, {
      "retry-after": String(limit.retryAfterSeconds),
    });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid-body" }, 400);
  }

  const parsed = validateContact(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const to = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.CONTACT_API_KEY;

  // No delivery service is wired up yet, so the route says so with a 503 and
  // the form shows "not enabled". It never reports a send that did not happen.
  if (!to || !apiKey) return json({ error: "not-configured" }, 503);

  return json({ error: "not-configured" }, 503);
}
