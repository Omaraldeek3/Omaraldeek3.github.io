import Link from "next/link";
import { Section } from "./section";
import { copy } from "@/content/site";
import { labWorks } from "@/lab/registry";
import type { Locale } from "@/content/locales";

export function LabSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <Section id="lab" label={t.labLabel} title={t.labTitle}>
      <p style={{ color: "var(--text-secondary)", maxInlineSize: "54ch", marginBlockEnd: "2rem" }}>
        {t.labIntro}
      </p>
      <div className="lab-grid">
        {labWorks.map(work => (
          <article key={work.slug} className="lab-card" data-slug={work.slug} data-status={work.status}>
            <p className="lab-status">{work.status === "live" ? t.labLive : t.labSoon}</p>
            <h3>{work.title[locale]}</h3>
            <p>{work.blurb[locale]}</p>
            {work.status === "live" && (
              <Link className="lab-open" href={`/${locale}/lab/${work.slug}`}>
                {t.labOpen} <span aria-hidden="true">↗</span>
              </Link>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
