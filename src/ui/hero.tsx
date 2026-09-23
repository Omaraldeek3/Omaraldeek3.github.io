import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";
import { HeroInk } from "./hero-ink";

// Type only. The animated production line moved to the factory page, where the
// six stations it draws are named right underneath it. What moves here is the
// red plate behind the headline, which HeroInk knocks out of register.
export function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <HeroInk>
      <div className="shell">
        <p className="hero-eyebrow mono">{t.heroEyebrow}</p>
        <div className="hero-plate">
          <div className="hero-ink-ghost" aria-hidden="true">
            {t.heroLines.map(line => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <h1 className="hero-headline">
            {t.heroLines.map(line => (
              <span key={line}>{line}</span>
            ))}
          </h1>
        </div>
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
    </HeroInk>
  );
}
