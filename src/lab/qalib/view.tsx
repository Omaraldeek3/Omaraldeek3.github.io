import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Qalib lives on its own site, qalib.omardeek.tech. This page presents it and
 *  opens it. The class names are Cut Studio's: the pages share a layout. */
export const QALIB_URL = "https://qalib.omardeek.tech";
const REPO = "https://github.com/Omaraldeek3/qalib";

const features: [string, string][] = [
  ["312 website designs", "٣١٢ تصميم موقع"],
  ["26 styles, 12 designs each", "٢٦ أسلوباً، ١٢ تصميماً في كل منها"],
  ["Every design in Arabic and English", "كل تصميم بالعربية والإنجليزية"],
  ["A live demo for every design", "معاينة حية لكل تصميم"],
  ["A detailed prompt for Claude Code", "برومبت مفصّل لـ Claude Code"],
  ["An interactive style driven by scroll and pointer", "أسلوب تفاعلي يتحرك مع التمرير والمؤشر"],
  ["Restaurants, clinics, shops, hotels and more", "مطاعم وعيادات ومتاجر وفنادق وغيرها"],
  ["Search and filter by style", "بحث وتصفية حسب الأسلوب"],
  ["No account, nothing to install", "بلا حساب ولا تثبيت"],
];

export function QalibView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{t.qalibText}</p>
      <a className="button button-live" href={QALIB_URL}>
        {t.qalibCta} <span aria-hidden="true">↗</span>
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
