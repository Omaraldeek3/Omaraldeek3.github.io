import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** The header sits on one side and the numbered spine on the other, so the
 *  steps read as a line rather than as three loose columns. */
export function Process({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section id="process" className="section">
      <div className="shell process-split">
        <div>
          <div className="section-head">
            <p className="section-label">{t.processLabel}</p>
            <p className="section-index mono" dir="ltr" aria-hidden="true">
              03 / 05
            </p>
          </div>
          <h2 className="section-title">{t.principlesTitle}</h2>
          <p className="section-intro">{t.processIntro}</p>
        </div>
        <ol className="process-list">
          {t.principles.map((principle, index) => (
            <li key={principle}>
              <span className="process-mark mono" dir="ltr" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="process-card">
                <p>{principle}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
