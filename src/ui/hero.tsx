import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

export function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="hero">
      {/* Dot matrix and one warm light. Both decorative, both behind the type. */}
      <div className="hero-ground" aria-hidden="true" />

      {/* Each chip repeats a fact a section below also states, so a narrow
          viewport can drop them without losing anything. */}
      {t.heroChips.map(chip => (
        <span className="hero-chip" key={chip.text} aria-hidden="true">
          <b>{chip.mark}</b>
          {chip.text}
        </span>
      ))}

      <p className="hero-badge">{t.heroBadge}</p>
      <h1 className="hero-headline">
        {t.heroLines.map(line => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      <p className="hero-rotator" aria-hidden="true">
        <span>{t.heroRotatorLead}</span>
        <span className="hero-rotator-window">
          <span className="hero-rotator-track">
            {[...t.heroRotator, t.heroRotator[0]].map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </span>
        </span>
      </p>
      <p className="hero-lead">{t.heroLead}</p>
      <div className="hero-actions">
        <a className="button button-live magnetic" href="#lab">
          {t.labLabel}
        </a>
        <a className="button button-quiet magnetic" href="#contact">
          {t.discuss}
        </a>
      </div>
      <p className="hero-scroll mono" aria-hidden="true">
        {t.scrollCue}
      </p>
    </section>
  );
}
