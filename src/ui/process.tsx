import { Section } from "./section";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

export function Process({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <Section id="process" label={t.processLabel} title={t.principlesTitle}>
      <ol className="process-list">
        {t.principles.map((principle, index) => (
          <li key={principle}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <p style={{ margin: "0.5rem 0 0" }}>{principle}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
