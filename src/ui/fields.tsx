import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

// Design is a field of its own here, not a quality sprinkled over the others,
// because there is real design work in the lab to point at. The five are set
// as a numbered contents page: each row opens the work that proves it.
export function Fields({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="fields">
      <div className="shell">
        <h2 className="section-label">{t.fieldsLabel}</h2>
        <div className="fields-grid">
          {t.fields.map((field, index) => (
            <Link
              key={field.title}
              className="field-card"
              href={`/${locale}/lab/${field.slug}`}
            >
              <span className="field-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{field.title}</h3>
              <p>{field.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
