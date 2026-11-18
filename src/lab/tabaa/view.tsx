import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Tabaa lives on its own site, tabaa.omardeek.tech. This page presents it and
 *  opens it. The class names are Cut Studio's: the pages share a layout. */
export const TABAA_URL = "https://tabaa.omardeek.tech";
const REPO = "https://github.com/Omaraldeek3/tabaa";

const features: [string, string][] = [
  ["200 original templates, no repeats", "٢٠٠ قالب أصلي بلا تكرار"],
  ["An ornate frame for every template", "إطار مزخرف خاص بكل قالب"],
  ["Wedding and occasion invitations", "دعوات أعراس ومناسبات"],
  ["Posters, menus and business cards", "بوسترات وقوائم طعام وكروت أعمال"],
  ["Product labels, greetings, certificates", "ملصقات منتجات وتهاني وشهادات"],
  ["Similar-template search before you edit", "بحث عن قوالب مشابهة قبل التعديل"],
  ["Fill in fields, switch colours and font", "حقول جاهزة وتبديل الألوان والخط"],
  ["CMYK PDF with bleed and crop marks", "PDF بألوان CMYK وهامش وعلامات قص"],
  ["Arabic text outlined, no fonts needed", "النص العربي مسارات بلا حاجة لخطوط"],
  ["No account, no uploads", "بلا حساب ولا رفع ملفات"],
];

export function TabaaView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{t.tabaaText}</p>
      <a className="button button-live" href={TABAA_URL}>
        {t.tabaaCta} <span aria-hidden="true">↗</span>
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
