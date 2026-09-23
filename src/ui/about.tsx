import { Section } from "./section";
import { copy, profile } from "@/content/site";
import type { Locale } from "@/content/locales";

export function About({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <Section id="about" label={t.aboutLabel} title={t.aboutTitle}>
      <p className="about-text">{t.heroLead}</p>
      <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        {profile.location[locale]}
      </p>
    </Section>
  );
}
