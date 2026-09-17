import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale, locales, projects, profile } from "@/content/site";
import { SitePreview, DemoContent } from "@/components/preview";
import type { Metadata } from "next";
export function generateStaticParams() { return locales.flatMap(locale => projects.map(project => ({ locale, slug: project.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params; const p = projects.find(p => p.slug === slug);
  if (!isLocale(locale) || !p) return {};
  const title = `${p[locale].name} — ${copy[locale].preview}`;
  return { title, description: copy[locale].previewNotice, robots: { index: false, follow: true }, openGraph: { title, description: copy[locale].previewNotice }, twitter: { card: "summary", title, description: copy[locale].previewNotice }, ...(profile.siteUrl ? { alternates: { canonical: `/${locale}/work/${slug}/preview`, languages: { ar: `/ar/work/${slug}/preview`, en: `/en/work/${slug}/preview` } } } : {}) };
}
export default async function PreviewPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params; const project = projects.find(p => p.slug === slug);
  if (!isLocale(locale) || !project) notFound();
  const t = copy[locale];
  return <main id="main" className="demo-page"><div className="demo-notice wrap" id="top"><Link href={`/${locale}/work/${slug}`}>← {t.backProject}</Link><h1>{project[locale].name} — {t.preview}</h1><p>{t.previewNotice}</p></div><SitePreview project={project} locale={locale} priority interactive /><DemoContent project={project} locale={locale} /></main>;
}
