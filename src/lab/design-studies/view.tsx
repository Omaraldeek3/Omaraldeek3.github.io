import Link from "next/link";
import { copy, projects } from "@/content/site";
import { SitePreview } from "@/components/preview";
import type { Locale } from "@/content/locales";
import { Concept } from "./concept";
import { StudyFilter } from "./filter";
import { categories, categoryNames, originalCategories, studies } from "./studies";

export function DesignStudiesView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const counts = new Map<string, number>();
  for (const category of [...Object.values(originalCategories), ...studies.map(study => study.category)])
    counts.set(category, (counts.get(category) ?? 0) + 1);
  const digits = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US");

  return (
    <div className="studies-view">
      <p className="study-disclosure mono">{t.concept}</p>
      <StudyFilter
        all={t.studiesAll}
        label={t.studiesFilter}
        options={categories.map(key => ({
          key,
          label: categoryNames[key][locale],
          count: counts.get(key) ?? 0,
        }))}
      >
        {projects.map((project, index) => (
          <Link
            className="study"
            key={project.slug}
            href={`/${locale}/work/${project.slug}`}
            data-category={originalCategories[project.slug]}
          >
            {/* A picture of the study: the meta below names the card, so the mock
                site's text stays out of the link's accessible name. */}
            <div className={`study-frame ${project.theme}`} aria-hidden="true">
              {/* The first card's photo is the largest thing on a phone screen. */}
              <SitePreview
                project={project}
                locale={locale}
                priority={index === 0}
                imageSizes="(max-width: 1024px) 88vw, 30vw"
              />
            </div>
            <div className="study-meta">
              <span className="mono" dir="ltr">
                {project.number}
              </span>
              <h2>{project[locale].name}</h2>
              <p>{project[locale].type}</p>
            </div>
          </Link>
        ))}
        {studies.map(study => (
          <Link
            className="study"
            key={study.slug}
            href={`/${locale}/studies/${study.slug}`}
            data-category={study.category}
          >
            <div className="study-frame concept-frame" aria-hidden="true">
              <Concept study={study} locale={locale} />
            </div>
            <div className="study-meta">
              <span className="mono" dir="ltr">
                {study.number}
              </span>
              <h2>{study[locale].name}</h2>
              <p>{study[locale].type}</p>
              <span className="study-swatches" aria-hidden="true">
                {[study.palette.bg, study.palette.ink, study.palette.accent, study.palette.accent2].map((color, index) => (
                  <i key={index} style={{ background: color }} />
                ))}
              </span>
            </div>
          </Link>
        ))}
      </StudyFilter>
      <p className="studies-count mono">
        {digits.format(projects.length + studies.length)} · {t.studiesCount}
      </p>
    </div>
  );
}
