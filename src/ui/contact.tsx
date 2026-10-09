import { Section } from "./section";
import { copy, profile } from "@/content/site";
import type { Locale } from "@/content/locales";

export function Contact({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const form = t.contactForm;

  return (
    <Section id="contact" index="05 / 05" label={t.contactLabel} title={t.contactTitle}>
      <div className="contact-channels">
        {profile.whatsapp && (
          <a href={`https://wa.me/${profile.whatsapp}`}>{t.whatsapp}</a>
        )}
        {profile.email && <a href={`mailto:${profile.email}`}>{t.email}</a>}
        {!profile.whatsapp && !profile.email && (
          <p className="mono contact-pending">{t.pendingContact}</p>
        )}
      </div>

      <p id="contact-unavailable" className="contact-pending mono">
        {form.errorDisabled}
      </p>
      {/* The API has no delivery provider yet, so availability cannot be inferred
          from environment keys. Keep this disabled until delivery is implemented. */}
      <form className="contact-form" aria-describedby="contact-unavailable">
        <label>
          {form.nameLabel}
          <input name="name" autoComplete="name" disabled />
        </label>
        <label>
          {form.emailLabel}
          <input name="email" type="email" autoComplete="email" disabled />
        </label>
        <label>
          {form.messageLabel}
          <textarea name="message" rows={5} disabled />
        </label>
        <button className="button button-live" type="submit" disabled>
          {form.submit}
        </button>
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
