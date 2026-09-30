import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Sira lives on its own site, sira.omardeek.tech. This page presents it and
 *  opens it in the reader's language. The class names are Cut Studio's: the
 *  two pages are laid out the same way. */
export const SIRA_URL = "https://sira.omardeek.tech";
const REPO = "https://github.com/Omaraldeek3/sira";

const features: [string, string][] = [
  ["Two linked versions, Arabic and English", "نسختان مرتبطتان، عربية وإنجليزية"],
  ["Shared dates, links and section order", "تواريخ وروابط وترتيب أقسام مشترك"],
  ["Real right-to-left layout", "اتجاه من اليمين لليسار صحيح فعلاً"],
  ["Classic template, safe for ATS", "قالب كلاسيكي مناسب لأنظمة الفرز"],
  ["Modern template with a sidebar", "قالب حديث بشريط جانبي"],
  ["Six colours, five Arabic type pairs", "ستة ألوان وخمسة خطوط عربية"],
  ["Personal details per version", "بيانات شخصية لكل نسخة على حدة"],
  ["Free PDF from the browser", "PDF مجاني من المتصفح"],
  ["No account, no server", "بلا حساب ولا خادم"],
];

export function SiraView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{t.siraText}</p>
      <a className="button button-live" href={`${SIRA_URL}/${locale}`}>
        {t.siraCta} <span aria-hidden="true">↗</span>
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
