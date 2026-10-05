import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/content/site";
import { isLocale, locales } from "@/content/locales";
import { getLabWork, labWorks } from "@/lab/registry";
import { AiAutomationView } from "@/lab/ai-automation/view";
import { CutStudioView } from "@/lab/cut-studio/view";
import { DesignStudiesView } from "@/lab/design-studies/view";
import { SaasPanelView } from "@/lab/saas-panel/view";
import { SiraView } from "@/lab/sira/view";
import { HarfView } from "@/lab/harf/view";
import { NaqshView } from "@/lab/naqsh/view";
import { QalibView } from "@/lab/qalib/view";
import { ShaklView } from "@/lab/shakl/view";
import { OrganizerView } from "@/lab/organizer/view";

export function generateStaticParams() {
  return locales.flatMap(locale =>
    labWorks
      .filter(work => work.status === "live")
      .map(work => ({ locale, slug: work.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/lab/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const work = getLabWork(slug);
  if (!work || !isLocale(locale)) return {};
  return { title: work.title[locale], description: work.blurb[locale] };
}

export default async function LabPage({ params }: PageProps<"/[locale]/lab/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const work = getLabWork(slug);
  // A work still being built has no page. It is listed honestly in the lab
  // instead of being dressed up as finished.
  if (!work || work.status !== "live") notFound();
  const t = copy[locale];

  return (
    <main id="main" className="lab-page" data-work={work.slug}>
      <div className="shell">
        <Link className="back-link" href={`/${locale}#lab`}>
          ← {t.labLabel}
        </Link>
        <p className="section-label">{t.labLive}</p>
        <h1 className="lab-page-title">{work.title[locale]}</h1>
        <p className="lab-page-blurb">{work.blurb[locale]}</p>
        {work.slug === "ai-automation" && <AiAutomationView locale={locale} />}
        {work.slug === "cut-studio" && <CutStudioView locale={locale} />}
        {work.slug === "design-studies" && <DesignStudiesView locale={locale} />}
        {work.slug === "saas-panel" && <SaasPanelView locale={locale} />}
        {work.slug === "sira" && <SiraView locale={locale} />}
        {work.slug === "harf" && <HarfView locale={locale} />}
        {work.slug === "naqsh" && <NaqshView locale={locale} />}
        {work.slug === "qalib" && <QalibView locale={locale} />}
        {work.slug === "shakl" && <ShaklView locale={locale} />}
        {work.slug === "organizer" && <OrganizerView locale={locale} />}
      </div>
    </main>
  );
}
