import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale, locales, profile, projects } from "@/content/site";
import { SitePreview } from "@/components/preview";
import "../../../work.css";

const Arrow = () => <span aria-hidden="true">↗</span>;

export function generateStaticParams() { return locales.flatMap(locale => projects.map(project => ({ locale, slug: project.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!isLocale(locale) || !project) return {};
  const p = project[locale];
  const title = `${p.name} — ${p.type}`;
  return { title, description: p.summary, openGraph: { title, description: p.summary, locale: locale === "ar" ? "ar_PS" : "en_US", type: "article" }, twitter: { card: "summary", title, description: p.summary }, ...(profile.siteUrl ? { alternates: { canonical: `/${locale}/work/${slug}`, languages: { ar: `/ar/work/${slug}`, en: `/en/work/${slug}` } } } : {}) };
}
export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const index = projects.findIndex(p => p.slug === slug);
  if (!isLocale(locale) || index < 0) notFound();
  const project = projects[index], p = project[locale], t = copy[locale], next = projects[(index + 1) % projects.length];
  return (
    <main id="main" className="lab-page study-page work-page">
      <div className="shell">
        <Link className="back-link" href={`/${locale}/lab/design-studies`}>
          ← {t.backWork}
        </Link>
        <p className="study-disclosure mono">{t.concept}</p>
        <div className="study-head">
          <div>
            <p className="section-label">
              <bdi dir="ltr">
                {project.number} · {project.year}
              </bdi>
            </p>
            <h1 className="lab-page-title">{p.name}</h1>
            <p className="lab-page-blurb">{p.type}</p>
          </div>
          <div>
            <p className="study-idea">{p.summary}</p>
            <ul className="work-tags">
              {p.tags.map(tag => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`work-frame ${project.theme}`}>
          <SitePreview project={project} locale={locale} priority />
        </div>

        <section className="work-case" aria-labelledby="work-case-title">
          <h2 className="section-label" id="work-case-title">
            {t.projectDetails}
          </h2>
          <div className="work-case-grid">
            <article>
              <span className="mono" dir="ltr">01</span>
              <h3>{t.goal}</h3>
              <p>{p.goal}</p>
            </article>
            <article>
              <span className="mono" dir="ltr">02</span>
              <h3>{t.solution}</h3>
              <p>{p.solution}</p>
            </article>
            <article>
              <span className="mono" dir="ltr">03</span>
              <h3>{t.delivered}</h3>
              <ul>
                {p.parts.map(part => (
                  <li key={part}>{part}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="work-preview" aria-labelledby="work-preview-title">
          <div className="work-preview-head">
            <h2 id="work-preview-title">{t.preview}</h2>
            <Link className="button button-live" href={`/${locale}/work/${slug}/preview`}>
              {t.openPreview}
              <Arrow />
            </Link>
          </div>
          {/* The same study twice more, at desktop and phone size: a picture
              of the layouts, so it stays out of the reading order. */}
          <div className={`work-showcase ${project.theme}`} aria-hidden="true" inert>
            <div className="showcase-desktop">
              <SitePreview project={project} locale={locale} />
            </div>
            <div className="showcase-mobile">
              <SitePreview project={project} locale={locale} imageSizes="30vw" />
            </div>
          </div>
        </section>

        <nav className="study-next" aria-label={t.nextProject}>
          <span className="mono">{t.nextProject}</span>
          <Link href={`/${locale}/work/${next.slug}`}>
            {next[locale].name} <Arrow />
          </Link>
        </nav>
      </div>
    </main>
  );
}
