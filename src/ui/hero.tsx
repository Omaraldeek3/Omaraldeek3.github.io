import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

// Type only. The animated production line moved to the factory page, where the
// six stations it draws are named right underneath it.
export function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="hero">
      <div className="shell">
        <p className="hero-eyebrow mono">{t.heroEyebrow}</p>
        <h1 className="hero-headline">
          {t.heroLines.map(line => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <div className="hero-foot">
          <p className="hero-lead">{t.heroLead}</p>
          <div className="hero-actions">
            <a className="button button-live" href="#lab">
              {t.labLabel}
            </a>
            <a className="button button-quiet" href="#contact">
              {t.discuss}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
