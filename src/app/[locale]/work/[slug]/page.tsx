import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale, locales, profile, projects } from "@/content/site";
import { SitePreview } from "@/components/preview";
import { Arrow, Contact, Footer } from "@/components/sections";

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
  return <><main id="main" className="project-page"><section className="project-hero wrap" id="top"><Link className="back-link" href={`/${locale}#work`}>← {t.backWork}</Link><div className="project-title-row"><div><span className="project-disclosure">{t.concept}</span><h1>{p.name}<span>.</span></h1><p>{p.summary}</p></div><div><span className="mono">{project.year} / {project.number}</span><p>{p.type}</p><div className="tags">{p.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></div></section><div className={`project-large-preview wrap ${project.theme}`}><SitePreview project={project} locale={locale} priority /></div><section className="case-study wrap"><span className="eyebrow">{t.projectDetails}</span><div><article><span className="mono">01 /</span><h2>{t.goal}</h2><p>{p.goal}</p></article><article><span className="mono">02 /</span><h2>{t.solution}</h2><p>{p.solution}</p></article><article><span className="mono">03 /</span><h2>{t.delivered}</h2><ul>{p.parts.map(part => <li key={part}>{part}</li>)}</ul></article></div></section><section className="preview-section wrap"><div className="preview-section-heading"><h2>{t.preview}</h2><Link className="button button-mint" href={`/${locale}/work/${slug}/preview`}>{t.openPreview}<Arrow /></Link></div><div className={`responsive-showcase ${project.theme}`}><div className="showcase-desktop"><SitePreview project={project} locale={locale} /></div><div className="showcase-mobile"><SitePreview project={project} locale={locale} /></div></div></section><section className="next-project wrap"><span className="eyebrow">{t.nextProject}</span><Link href={`/${locale}/work/${next.slug}`}>{next[locale].name}<Arrow /></Link></section><Contact locale={locale} /></main><Footer locale={locale} /></>;
}
