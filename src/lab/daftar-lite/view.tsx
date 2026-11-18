import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Daftar Lite lives on its own site, daftar.systems. This page presents it
 *  and opens it. The source is private (it runs a real shop's books), so
 *  there is no repository link. Class names are Cut Studio's: shared layout. */
export const DAFTAR_URL = "https://daftar.systems";

const features: [string, string][] = [
  ["Photograph the day's page; AI reads it", "صوّر صفحة اليوم، والذكاء الاصطناعي يقرؤها"],
  ["One A5 notebook page covers the whole day", "صفحة دفتر A5 واحدة تغطي اليوم كله"],
  ["You review every line before it is saved", "تراجع كل سطر قبل أن يُحفظ"],
  ["Branches, each with its own cash box", "فروع، لكل فرع صندوقه"],
  ["Credit sales, purchases and expenses", "مبيعات آجلة ومشتريات ومصاريف"],
  ["Receipt and payment vouchers, cheques", "سندات قبض وصرف، وشيكات"],
  ["Cash, bank and card balances in one view", "أرصدة الصندوق والبنك والبطاقة في مكان واحد"],
  ["Payroll, advances and attendance", "رواتب وسلف وحضور"],
  ["A monthly profit page from stock counts", "صفحة ربح الشهر من جرد البضاعة"],
  ["Installs on iPhone and Android, in Arabic", "يُثبَّت على الآيفون والأندرويد، بالعربية"],
];

const text = {
  ar: "بنيته لأن أصحاب المحلات الصغيرة لا يحتاجون برنامج محاسبة، يحتاجون أن يعرفوا أين ذهب المال اليوم. الورقة التي يكتبونها أصلاً كل مساء صارت هي المدخل: تُصوَّر، تُقرأ، تُراجع، فيُقفل الصندوق. يعمل الآن في محل حقيقي، ويُباع كاشتراك شهري.",
  en: "I built it because small shop owners don't need accounting software; they need to know where today's money went. The paper they already fill in every evening became the way in: photographed, read, reviewed, and the box is closed. It runs a real shop now, and is sold as a monthly subscription.",
};
const cta = { ar: "افتح دفتر", en: "Open Daftar" };
const install = { ar: "طريقة تثبيته على الجوال", en: "How to install it on a phone" };

export function DaftarLiteView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{text[locale]}</p>
      <a className="button button-live" href={DAFTAR_URL}>
        {cta[locale]} <span aria-hidden="true">↗</span>
      </a>
      <p className="studio-small mono">
        <a href={`${DAFTAR_URL}/install`}>{install[locale]}</a>
      </p>
      <p>
        <Link href={`/${locale}`}>{t.backTop}</Link>
      </p>
    </div>
  );
}
