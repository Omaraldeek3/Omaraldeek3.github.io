import Link from "next/link";
import { copy, projects } from "@/content/site";
import { SitePreview } from "@/components/preview";
import type { Locale } from "@/content/locales";

export function DesignStudiesView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <div className="studies-view">
      <p className="study-disclosure mono">{t.concept}</p>
      <div className="studies-grid">
        {projects.map(project => (
          <Link
            className="study"
            key={project.slug}
            href={`/${locale}/work/${project.slug}`}
          >
            <div className={`study-frame ${project.theme}`}>
              <SitePreview
                project={project}
                locale={locale}
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
      </div>
    </div>
  );
}
