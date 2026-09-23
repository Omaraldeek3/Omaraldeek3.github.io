import { copy, profile } from "@/content/site";
import { SystemScene } from "@/ui/system-scene";
import { Bidi } from "@/ui/bidi";
import type { Locale } from "@/content/locales";
import { automationFacts, systems } from "./systems";

/** Real systems, documented from their own sources. Nothing here is a
 *  mock-up: every station and every system names the tool that runs it. */
function validUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function AiAutomationView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const channel = validUrl(profile.links.youtube);
  return (
    <div className="factory-view">
      <ul className="auto-facts">
        {automationFacts.map(fact => (
          <li key={fact.label.en}>
            <b>{fact.value[locale]}</b>
            <span>{fact.label[locale]}</span>
          </li>
        ))}
      </ul>

      <section className="auto-block" aria-labelledby="factory-heading">
        <p className="section-label">{t.factoryLabel}</p>
        <h2 id="factory-heading" className="auto-heading">
          {t.factoryTitle}
        </h2>
        <p className="auto-intro">{t.factoryIntro}</p>
        <SystemScene labels={t.stations.map(station => station.code)} rtl={locale === "ar"} />
        <ol className="station-list">
          {t.stations.map((station, index) => (
            <li className="station" key={station.code}>
              <span className="station-code mono" dir="ltr">
                {station.code}
              </span>
              <div className="station-body">
                <span className="station-index mono" dir="ltr" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{station.title}</h3>
                <p>
                  <Bidi text={station.text} />
                </p>
                <div className="station-tags">
                  {station.tags.map(tag => (
                    <span key={tag} dir="ltr">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="auto-block" aria-labelledby="systems-heading">
        <p className="section-label">{t.systemsLabel}</p>
        <h2 id="systems-heading" className="auto-heading">
          {t.systemsTitle}
        </h2>
        <p className="auto-intro">{t.systemsIntro}</p>
        <div className="system-grid">
          {systems.map((system, index) => (
            <article className="system-card glow-card" key={system.code} data-code={system.code}>
              <header className="system-card-head">
                <span className="system-code mono" dir="ltr">
                  {String(index + 2).padStart(2, "0")} · {system.code}
                </span>
                <span className="system-cadence">{system.cadence[locale]}</span>
              </header>
              <h3>{system.title[locale]}</h3>
              <p className="system-summary">
                <Bidi text={system.summary[locale]} />
              </p>
              <ol className="system-flow" aria-label={t.systemsFlow}>
                {system.flow[locale].map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <details className="system-details">
                <summary>{t.systemsHow}</summary>
                <ul>
                  {system.details[locale].map(line => (
                    <li key={line}>
                      <Bidi text={line} />
                    </li>
                  ))}
                </ul>
                <div className="station-tags">
                  {system.tags.map(tag => (
                    <span key={tag} dir="ltr">
                      {tag}
                    </span>
                  ))}
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>

      <aside className="oversight">
        <h2>{t.oversightTitle}</h2>
        <p>
          <Bidi text={t.oversightText} />
        </p>
        <div className="station-tags">
          {t.oversightTags.map(tag => (
            <span key={tag} dir="ltr">
              {tag}
            </span>
          ))}
        </div>
      </aside>

      {channel && (
        <p className="factory-channel">
          <a href={channel} target="_blank" rel="noopener noreferrer">
            {t.watchChannel} <span aria-hidden="true">↗</span>
          </a>
        </p>
      )}
    </div>
  );
}
