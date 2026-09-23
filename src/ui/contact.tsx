"use client";

import { useState } from "react";
import { Section } from "./section";
import { copy, profile } from "@/content/site";
import type { Locale } from "@/content/locales";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const form = t.contactForm;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setStatus("sending");
    setMessage(form.sending);

    let response: Response;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      setStatus("error");
      setMessage(form.errorServer);
      return;
    }

    if (response.ok) {
      setStatus("sent");
      setMessage(form.sent);
      return;
    }

    setStatus("error");
    setMessage(
      response.status === 400 ? form.errorValidation
      : response.status === 429 ? form.errorRate
      : response.status === 503 ? form.errorDisabled
      : form.errorServer,
    );
  }

  return (
    <Section id="contact" label={t.contactLabel} title={t.contactTitle}>
      <div className="contact-channels">
        {profile.whatsapp && (
          <a href={`https://wa.me/${profile.whatsapp}`}>{t.whatsapp}</a>
        )}
        {profile.email && <a href={`mailto:${profile.email}`}>{t.email}</a>}
        {!profile.whatsapp && !profile.email && (
          <p className="mono contact-pending">{t.pendingContact}</p>
        )}
      </div>

      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <noscript>
          <p className="contact-pending mono">{form.needsJs}</p>
        </noscript>
        <label>
          {form.nameLabel}
          <input name="name" autoComplete="name" />
        </label>
        <label>
          {form.emailLabel}
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          {form.messageLabel}
          <textarea name="message" rows={5} />
        </label>
        <button className="button button-live" type="submit" disabled={status === "sending"}>
          {status === "sending" ? form.sending : form.submit}
        </button>
        {message && (
          <p role="alert" className={status === "sent" ? "contact-ok" : "contact-problem"}>
            {message}
          </p>
        )}
      </form>

      <details className="contact-faq">
        <summary>{t.faqTitle}</summary>
        {t.faq.map(item => (
          <div key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </details>
    </Section>
  );
}
