import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** The organizer is a Windows desktop app, so this page presents it and
 *  links to its repository. The class names are Cut Studio's: the pages share a layout. */
export const ORGANIZER_URL = "https://github.com/Omaraldeek3/file-orgnizor";

const features: [string, string][] = [
  ["CDR, CDT, PSD, PSB and AI files", "ملفات CDR وCDT وPSD وPSB وAI"],
  ["Archive by client, then month", "أرشيف حسب العميل ثم الشهر"],
  ["Arabic and English client names matched", "مطابقة اسم العميل بالعربية والإنجليزية"],
  ["Month from the file name or date", "الشهر من اسم الملف أو تاريخه"],
  ["Preview before anything moves", "معاينة قبل أي نقل"],
  ["Safe copy by default", "نسخ آمن افتراضياً"],
  ["Undo any run", "تراجع عن أي عملية"],
  ["Background assistant for new files", "مساعد تلقائي للملفات الجديدة"],
  ["Fully local, nothing uploaded", "محلي بالكامل بلا رفع"],
];

export function OrganizerView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{t.organizerText}</p>
      <a className="button button-live" href={ORGANIZER_URL}>
        {t.organizerCta} <span aria-hidden="true">↗</span>
      </a>
      <p className="studio-small mono">
        <a href={ORGANIZER_URL}>{t.siraSource}</a>
      </p>
      <p>
        <Link href={`/${locale}`}>{t.backTop}</Link>
      </p>
    </div>
  );
}
