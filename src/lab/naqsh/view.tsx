import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Naqsh lives on its own site, naqsh.omardeek.tech. This page presents it and
 *  opens it. The class names are Cut Studio's: the pages share a layout. */
export const NAQSH_URL = "https://naqsh.omardeek.tech";
const REPO = "https://github.com/Omaraldeek3/naqsh-svg-studio";

const features: [string, string][] = [
  ["384 ornamental compositions", "٣٨٤ تكويناً زخرفياً"],
  ["Islamic geometry and arabesque", "هندسة إسلامية وأرابيسك"],
  ["Floral motifs, rosettes and frames", "زخارف نباتية ووردات وإطارات"],
  ["Borders and dividers", "فواصل وحواف"],
  ["Customise colour and stroke", "تخصيص اللون والخط"],
  ["Compose in the studio", "تركيب في الاستوديو"],
  ["Export clean SVG", "تصدير SVG نظيف"],
  ["13,000+ interface icons too", "أكثر من ١٣ ألف أيقونة واجهات"],
  ["No account, no uploads", "بلا حساب ولا رفع ملفات"],
];

export function NaqshView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const index = locale === "ar" ? 1 : 0;
  return (
    <div className="studio-view">
      <ol className="studio-tools">
        {features.map((names, position) => (
          <li key={names[0]}>
            <span className="mono" dir="ltr">{String(position + 1).padStart(2, "0")}</span>
            <span>{names[index]}</span>
          </li>
        ))}
      </ol>
      <p className="studio-text">{t.naqshText}</p>
      <a className="button button-live" href={NAQSH_URL}>
        {t.naqshCta} <span aria-hidden="true">↗</span>
      </a>
      <p className="studio-small mono">
        <a href={REPO}>{t.siraSource}</a>
      </p>
      <p>
        <Link href={`/${locale}`}>{t.backTop}</Link>
      </p>
    </div>
  );
}
