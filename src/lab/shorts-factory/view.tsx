import { copy, profile } from "@/content/site";
import type { Locale } from "@/content/locales";

/** A real system, documented from its own stations. Nothing here is a mock-up:
 *  every station names the tool that actually runs it. */
function validUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function ShortsFactoryView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const channel = validUrl(profile.links.youtube);
  return (
    <div className="factory-view">
      <ol className="station-list">
        {t.stations.map((station, index) => (
          <li className="station" key={station.code}>
            <span className="station-code mono" dir="ltr">
              {station.code}
            </span>
            <div className="station-body">
              <span className="station-index mono" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2>{station.title}</h2>
              <p>{station.text}</p>
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

      <aside className="oversight">
        <h2>{t.oversightTitle}</h2>
        <p>{t.oversightText}</p>
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
