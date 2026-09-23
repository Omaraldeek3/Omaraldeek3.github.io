import type { Locale } from "@/content/locales";
import { MotifArt } from "./motif";
import { readableOn, type Study } from "./studies";

/** One imagined business's landing page, drawn in its own palette and face.
 *  Every size inside is in container units, so the same page renders as a
 *  thumbnail in the gallery and full width on the study's own page.
 *  `full` adds everything below the fold and makes it a real document with
 *  headings; a thumbnail stays silent decoration. */
export function Concept({ study, locale, full = false }: { study: Study; locale: Locale; full?: boolean }) {
  const c = study[locale];
  const { palette } = study;
  const style = {
    "--c-bg": palette.bg,
    "--c-surface": palette.surface,
    "--c-ink": palette.ink,
    "--c-muted": palette.muted,
    "--c-accent": palette.accent,
    "--c-accent2": palette.accent2,
    "--c-on-accent": readableOn(palette.accent),
    "--c-radius": study.radius >= 999 ? "999px" : `${study.radius / 10}cqi`,
    "--c-card-radius": study.radius >= 999 ? "2.4cqi" : `${study.radius / 10}cqi`,
  } as React.CSSProperties;
  const Title = full ? "h2" : "p";
  const Sub = full ? "h3" : "p";
  const [first, second] = c.headline.split("\n");

  return (
    <div
      className="concept"
      data-layout={study.layout}
      data-face={study.face}
      data-motif={study.motif}
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={style}
      aria-hidden={full ? undefined : true}
    >
      <div className="c-page">
        <div className="c-nav">
          <span className="c-logo">
            {c.name}
            <i />
          </span>
          <span className="c-links">
            {c.nav.map(item => (
              <span key={item}>{item}</span>
            ))}
          </span>
          <span className="c-btn small">{c.cta}</span>
        </div>

        <div className="c-hero">
          <div className="c-copy">
            <span className="c-eyebrow">{c.tagline}</span>
            <Title className="c-title">
              {first}
              {second && (
                <>
                  <br />
                  <em>{second}</em>
                </>
              )}
            </Title>
            <p className="c-lead">{c.lead}</p>
            <span className="c-actions">
              <span className="c-btn">{c.cta}</span>
              <span className="c-btn ghost">{c.cta2}</span>
            </span>
          </div>
          <div className="c-art">
            <MotifArt motif={study.motif} />
            {study.layout === "bento" && (
              <span className="c-tiles">
                {c.stats.map(([value, label]) => (
                  <span className="c-tile" key={label}>
                    <b>{value}</b>
                    <small>{label}</small>
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>

        {full && (
          <>
            <div className="c-features">
              {c.features.map(([title, text], index) => (
                <div className="c-feature" key={title}>
                  <span className="c-index">{String(index + 1).padStart(2, "0")}</span>
                  <Sub>{title}</Sub>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <div className="c-stats">
              {c.stats.map(([value, label]) => (
                <div key={label}>
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="c-band">
              <p className="c-quote">“{c.quote}”</p>
              <span className="c-btn">{c.cta}</span>
            </div>
            <div className="c-foot">
              <span className="c-logo">
                {c.name}
                <i />
              </span>
              <span>{c.type}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
