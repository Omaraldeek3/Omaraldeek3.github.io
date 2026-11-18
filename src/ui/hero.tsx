import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

export function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="hero" data-scene="hero">
      <div className="hero-giant" aria-hidden="true">
        <span>{locale === "ar" ? "مرحباً، أنا عمر" : "HI, I'M OMAR"}</span>
      </div>

      {/* Dot matrix and one warm light. Both decorative, both behind the type. */}
      <div className="hero-ground" aria-hidden="true" />

      <div className="shell hero-stage">
        <div className="hero-corner-start">
          <p className="hero-badge">{t.heroBadge}</p>
          <h1 className="hero-headline">
            {t.heroLines.map(line => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero-lead">{t.heroLead}</p>
          <div className="hero-actions">
            <a className="button button-live magnetic" href="#lab">
              {t.labLabel}
            </a>
            <a className="button button-quiet magnetic" href="#contact">
              {t.discuss}
            </a>
          </div>
        </div>

        <div className="hero-corner-end" aria-hidden="true">
          <div className="hero-chips-stack">
            {t.heroChips.map(chip => (
              <span className="hero-chip" key={chip.text}>
                <b>{chip.mark}</b>
                {chip.text}
              </span>
            ))}
          </div>
          <p className="hero-scroll mono">{t.scrollCue}</p>
        </div>
      </div>
    </section>
  );
}
