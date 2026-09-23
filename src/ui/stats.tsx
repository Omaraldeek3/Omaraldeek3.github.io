import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Four counts, every one of them countable in the lab: seven tools, six
 *  stations, two channels, three studies. Nothing here is a round number
 *  chosen for effect. */
export function Stats({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <div className="stats">
      <div className="shell stats-grid">
        {t.stats.map(stat => (
          <div className="stat" key={stat.label}>
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
