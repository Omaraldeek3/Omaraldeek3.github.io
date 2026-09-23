import Link from "next/link";
import { Section } from "./section";
import { copy } from "@/content/site";
import { labWorks } from "@/lab/registry";
import type { Locale } from "@/content/locales";

export function LabSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <Section id="lab" index="02 / 05" label={t.labLabel} title={t.labTitle} intro={t.labIntro}>
      <div className="lab-grid">
        {labWorks.map(work => (
          <article key={work.slug} className="lab-card" data-slug={work.slug} data-status={work.status}>
            <div className="lab-shot">
              <p className="lab-status">{work.status === "live" ? t.labLive : t.labSoon}</p>
              <span className="lab-kind" dir="ltr">
                {work.kind}
              </span>
              <span aria-hidden="true">{work.glyph}</span>
            </div>
            <div className="lab-body">
              <h3>
                {work.title[locale]}
                {work.count && <span className="lab-count">{work.count[locale]}</span>}
              </h3>
              <p>{work.blurb[locale]}</p>
              {work.status === "live" && (
                <Link className="lab-open" href={`/${locale}/lab/${work.slug}`}>
                  {t.labOpen} <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
