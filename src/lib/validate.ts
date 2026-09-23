export type ContactInput = { name: string; email: string; message: string };
export type ValidationResult =
  | { ok: true; value: ContactInput }
  | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Rejects rather than truncates: a message that is too long is a mistake
 *  worth telling the sender about, not something to quietly cut in half. */
export function validateContact(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "invalid-body" };
  const body = raw as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 1 || name.length > 200) return { ok: false, error: "invalid-name" };
  if (email.length > 320 || !EMAIL.test(email)) return { ok: false, error: "invalid-email" };
  if (message.length < 20 || message.length > 5000) return { ok: false, error: "invalid-message" };

  return { ok: true, value: { name, email, message } };
}
