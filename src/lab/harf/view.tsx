import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Harf lives on its own site, harf.omardeek.tech. This page presents it and
 *  opens it. The class names are Cut Studio's: the pages share a layout. */
export const HARF_URL = "https://harf.omardeek.tech";
const REPO = "https://github.com/Omaraldeek3/harf";

const features: [string, string][] = [
  ["236 Arabic font families", "236 عائلة خط عربية"],
  ["395 English font families", "395 عائلة خط إنجليزية"],
  ["Live preview of your own text", "معاينة مباشرة لنصك أنت"],
  ["Compare two to four fonts", "مقارنة بين خطين إلى أربعة"],
  ["Your computer's fonts too", "خطوط جهازك أيضاً"],
  ["Download a family with its licence", "تنزيل العائلة مع رخصتها"],
  ["SVG export as real outlines", "تصدير SVG بمسارات حقيقية"],
  ["Favourites saved in the browser", "مفضلة محفوظة في المتصفح"],
  ["No account, no uploads", "بلا حساب ولا رفع ملفات"],
];

export function HarfView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{t.harfText}</p>
      <a className="button button-live" href={HARF_URL}>
        {t.harfCta} <span aria-hidden="true">↗</span>
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
