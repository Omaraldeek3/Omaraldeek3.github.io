import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";
import { Stats } from "./stats";

const CARD_TAGS = ["NEXT · TS", "VECTOR · CAD", "AI · N8N", "WEBHOOK · FALLBACK", "CRM · INVOICES · BOOKINGS · STOCK"];

export function Fields({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const isAr = locale === "ar";

  return (
    <section id="fields" className="section kin-light-stage" data-scene="fields">
      <div className="shell kin-light-shell">
        <div className="section-head kin-light-head">
          <p className="section-label">{t.fieldsLabel}</p>
          <p className="section-index mono" dir="ltr" aria-hidden="true">
            01 / 05
          </p>
        </div>

        <h2 className="section-title kin-light-title">
          {t.fieldsTitle.split("\n")[0]}
          {t.fieldsTitle.includes("\n") && (
            <>
              {"\n"}
              <em>{t.fieldsTitle.split("\n")[1]}</em>
            </>
          )}
        </h2>

        <div className="kin-window-stage">
          <svg
            className="kin-window-connectors"
            viewBox="0 0 1200 540"
            fill="none"
            aria-hidden="true"
          >
            <path d="M250 110 H365 L420 175" />
            <path d="M950 110 H835 L780 175" />
            <path d="M250 370 H365 L420 305" />
            <path d="M950 370 H835 L780 305" />
            <circle cx="250" cy="110" r="4" />
            <circle cx="950" cy="110" r="4" />
            <circle cx="250" cy="370" r="4" />
            <circle cx="950" cy="370" r="4" />
          </svg>

          {/* The transparent rounded viewport cuts a pitch-black window into the
              light silver stage so the z-index: 1 3D point cloud shines inside it. */}
          <div className="kin-window" aria-hidden="true">
            <div className="kin-window-bar">
              <span className="kin-window-dot">
                <i />
                {isAr ? "نظام عمر" : "Omar OS"}
              </span>
              <span className="kin-window-chips mono" dir="ltr">
                <span>Cut Studio · ⌘S</span>
                <span>Factory · L</span>
              </span>
            </div>

            <div className="kin-window-aperture">
              <p className="kin-window-caption">
                {isAr ? (
                  <>
                    كل أدواتي وأنظمتي،
                    <br />
                    في مكان واحد هادئ.
                  </>
                ) : (
                  <>
                    Everything I build,
                    <br />
                    in one quiet place.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="fields-grid">
            {t.fields.map((field, index) => (
              <Link
                key={field.title}
                className="field-card glow-card"
                href={`/${locale}/lab/${field.slug}`}
              >
                <div className="field-card-top" aria-hidden="true">
                  <span className="field-index mono" dir="ltr">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="field-tag mono" dir="ltr">
                    {CARD_TAGS[index]}
                  </span>
                </div>
                <h3>{field.title}</h3>
                <p>{field.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="kin-command-dock">
          <div className="kin-dock-bar" aria-hidden="true">
            <span className="kin-dock-prompt">
              {isAr
                ? "برمجة مواقع · تصميم للقص بالليزر · أنظمة أتمتة بالذكاء الاصطناعي..."
                : "Ask Omar OS... web apps, laser tools, AI automation systems"}
            </span>
            <span className="kin-dock-keys mono" dir="ltr">
              <span>29 TOOLS</span>
              <span>9 SYSTEMS</span>
              <span>⌘K</span>
            </span>
          </div>
          <Stats locale={locale} />
        </div>
      </div>
    </section>
  );
}
