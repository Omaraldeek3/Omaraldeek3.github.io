import Link from "next/link";
import { Section } from "./section";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

// Design is a field of its own here, not a quality sprinkled over the others,
// because there is real design work in the lab to point at. Every card opens
// the work that proves its field.
export function Fields({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <Section id="fields" index="01 / 05" label={t.fieldsLabel} title={t.fieldsTitle}>
      <div className="fields-grid">
        {t.fields.map((field, index) => (
          <Link
            key={field.title}
            className="field-card"
            href={`/${locale}/lab/${field.slug}`}
          >
            <span className="field-index mono" dir="ltr" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{field.title}</h3>
            <p>{field.text}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
