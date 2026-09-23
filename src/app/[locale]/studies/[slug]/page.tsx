import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/content/site";
import { isLocale, locales } from "@/content/locales";
import { Concept } from "@/lab/design-studies/concept";
import { categoryNames, getStudy, readableOn, studies, type Face } from "@/lab/design-studies/studies";

export function generateStaticParams() {
  return locales.flatMap(locale => studies.map(study => ({ locale, slug: study.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/studies/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const study = getStudy(slug);
  if (!study || !isLocale(locale)) return {};
  const c = study[locale];
  return { title: `${c.name} — ${c.type}`, description: c.idea };
}

const faceNames: Record<Face, string> = {
  grotesk: "Space Grotesk",
  serif: "Serif · Georgia",
  rounded: "Manrope",
  condensed: "Condensed",
  mono: "JetBrains Mono",
};

export default async function StudyPage({ params }: PageProps<"/[locale]/studies/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const index = studies.findIndex(study => study.slug === slug);
  if (index < 0) notFound();
  const study = studies[index];
  const next = studies[(index + 1) % studies.length];
  const c = study[locale];
  const t = copy[locale];
  const swatches = [
    ["bg", study.palette.bg],
    ["surface", study.palette.surface],
    ["ink", study.palette.ink],
    ["muted", study.palette.muted],
    ["accent", study.palette.accent],
    ["accent 2", study.palette.accent2],
  ] as const;

  return (
    <main id="main" className="lab-page study-page">
      <div className="shell">
        <Link className="back-link" href={`/${locale}/lab/design-studies`}>
          ← {t.studyBack}
        </Link>
        <p className="study-disclosure mono">{t.concept}</p>
        <div className="study-head">
          <div>
            <p className="section-label">
              {study.number} · {categoryNames[study.category][locale]}
            </p>
            <h1 className="lab-page-title">{c.name}</h1>
            <p className="lab-page-blurb">{c.type}</p>
          </div>
          <p className="study-idea">{c.idea}</p>
        </div>

        <section className="study-board" aria-label={t.studyIdentity}>
          <div className="board-cell board-palette">
            <h2>{t.studyPalette}</h2>
            <ul>
              {swatches.map(([name, value]) => (
                <li key={name}>
                  <span style={{ background: value }} />
                  <b dir="ltr">{value}</b>
                  <small dir="ltr">{name}</small>
                </li>
              ))}
            </ul>
          </div>
          <div className="board-cell board-type" data-face={study.face} style={{ "--c-ink": study.palette.ink, "--c-bg": study.palette.surface, "--c-accent": study.palette.accent } as React.CSSProperties}>
            <h2>{t.studyFace}</h2>
            <p className="type-big">Aa أب</p>
            <p className="type-line">{t.studySample}</p>
            <small dir="ltr">{faceNames[study.face]}{locale === "ar" ? " · Tajawal" : ""}</small>
          </div>
          <div
            className="board-cell board-parts concept-tokens"
            style={{
              "--c-bg": study.palette.bg,
              "--c-surface": study.palette.surface,
              "--c-ink": study.palette.ink,
              "--c-muted": study.palette.muted,
              "--c-accent": study.palette.accent,
              "--c-accent2": study.palette.accent2,
              "--c-on-accent": readableOn(study.palette.accent),
              "--c-radius": study.radius >= 999 ? "999px" : `${study.radius}px`,
            } as React.CSSProperties}
          >
            <h2>{t.studyComponents}</h2>
            <div className="parts-row">
              <span className="part-btn">{c.cta}</span>
              <span className="part-btn ghost">{c.cta2}</span>
            </div>
            <div className="part-card">
              <b>{c.features[0][0]}</b>
              <span>{c.features[0][1]}</span>
            </div>
            <div className="parts-row">
              {c.nav.map(item => (
                <span className="part-chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="study-live" aria-label={t.studyPage}>
          <div className="study-browser" dir="ltr">
            <i />
            <i />
            <i />
            <span>{study.slug}.concept</span>
          </div>
          <Concept study={study} locale={locale} full />
        </section>

        <section className="study-decisions">
          <h2>{t.studyDecisions}</h2>
          <ol>
            {c.points.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        </section>

        <nav className="study-next" aria-label={t.studyNext}>
          <span className="mono">{t.studyNext}</span>
          <Link href={`/${locale}/studies/${next.slug}`}>
            {next[locale].name} <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
