export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

type Window = { count: number; startedAt: number };

// In-process storage. On a serverless host this is a limit per running
// instance, not a global one, which is enough to blunt a contact-form flood.
// A shared store would be needed before this guards anything valuable.
const windows = new Map<string, Window>();

export function resetRateLimit(): void {
  windows.clear();
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult {
  const existing = windows.get(key);

  if (!existing || now - existing.startedAt >= options.windowMs) {
    windows.set(key, { count: 1, startedAt: now });
    return { ok: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= options.limit) {
    const elapsed = now - existing.startedAt;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((options.windowMs - elapsed) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: options.limit - existing.count, retryAfterSeconds: 0 };
}
