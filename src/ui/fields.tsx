import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

// Design is a field of its own here, not a quality sprinkled over the others,
// because there is real design work in the lab to point at.
export function Fields({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="shell" aria-label={t.fieldsLabel}>
      <p className="section-label">{t.fieldsLabel}</p>
      <div className="fields-grid" style={{ marginBlockStart: "1.25rem" }}>
        {t.fields.map(field => (
          <Link
            key={field.title}
            className="field-card"
            href={`/${locale}/lab/${field.slug}`}
          >
            <h3>{field.title}</h3>
            <p>{field.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
