import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Shakl lives on its own site, shakl.omardeek.tech. This page presents it and
 *  opens it. The class names are Cut Studio's: the pages share a layout. */
export const SHAKL_URL = "https://shakl.omardeek.tech";
const REPO = "https://github.com/Omaraldeek3/shakl-3d-library";

const features: [string, string][] = [
  ["1,024 procedural wooden models", "١٠٢٤ نموذجاً خشبياً إجرائياً"],
  ["Houses, boxes, lanterns and decor", "بيوت وصناديق وفوانيس وديكور"],
  ["Live 3D preview", "معاينة حية ثلاثية الأبعاد"],
  ["Set width, depth and height", "تحديد العرض والعمق والارتفاع"],
  ["Parts follow your board thickness", "القطع تتبع سماكة خشبك"],
  ["Laser kerf compensation", "تعويض عرض قطع الليزر"],
  ["Download 1:1 SVG cutting files", "تنزيل ملفات قص SVG بمقياس ١:١"],
  ["No account, no uploads", "بلا حساب ولا رفع ملفات"],
];

export function ShaklView({ locale }: { locale: Locale }) {
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
      <p className="studio-text">{t.shaklText}</p>
      <a className="button button-live" href={SHAKL_URL}>
        {t.shaklCta} <span aria-hidden="true">↗</span>
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
