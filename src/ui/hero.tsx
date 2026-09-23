import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";
import { HeroScene } from "./hero-scene";

export function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="hero">
      <HeroScene labels={t.stations.map(station => station.code)} rtl={locale === "ar"} />
      <div className="shell hero-copy">
        <p className="hero-eyebrow mono">{t.heroEyebrow}</p>
        <h1 className="hero-headline">
          {t.heroLines.map(line => (
            <span key={line}>{line}</span>
          ))}
        </h1>
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
    </section>
  );
}
