import Link from "next/link";
import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";

/** Cut Studio lives on its own site, cutstudio.omardeek.tech, with a page for
 *  every tool. This page presents it and opens it in the reader's language. */
export const CUT_STUDIO_URL = "https://cutstudio.omardeek.tech";

// In Cut Studio's own order: the working tools first, the ready-made templates last.
const tools: [string, string][] = [
  ["Image to vector", "تحويل صورة إلى فيكتور"], ["AI upscaler", "تكبير الصور بالذكاء الاصطناعي"], ["Arabic lettering", "الكتابة العربية"],
  ["Contour & offset", "الكونتور والإزاحة"], ["Vector cleanup", "تنظيف الفيكتور"], ["Resize & repeat", "المقاس والتكرار"],
  ["Material nesting", "ترتيب القطع"], ["Box maker", "صانع الصناديق"], ["Living hinge", "المفصل المرن"], ["Grille patterns", "نقوش التهوية"],
  ["Engraving prep", "تجهيز صور الحفر"], ["Power & speed test", "بطاقة اختبار القوة والسرعة"], ["Fit test", "اختبار التعشيق"], ["CNC prep", "تجهيز CNC"],
  ["Feeds & speeds", "السرعات والتغذية"], ["Poster tiling", "تقسيم البوستر"], ["Print sheet", "ورقة الطباعة"], ["Resolution & DPI", "الدقة والـDPI"],
  ["Job quote", "عرض السعر"], ["Product templates", "قوالب المنتجات"], ["Polygon box", "صندوق مضلع"], ["Tags & keychains", "الميداليات والبطاقات"],
  ["Trophy base", "قاعدة الدروع"], ["Gear maker", "صانع التروس"], ["Jigsaw puzzle", "صانع البازل"], ["Ruler maker", "صانع المساطر"],
];
export const cutStudioToolCount = tools.length;

export function CutStudioView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const index = locale === "ar" ? 1 : 0;
  return (
    <div className="studio-view">
      <ol className="studio-tools">
        {tools.map((names, position) => (
          <li key={names[0]}>
            <span className="mono" dir="ltr">
              {String(position + 1).padStart(2, "0")}
            </span>
            <span>{names[index]}</span>
          </li>
        ))}
      </ol>
      <p className="studio-text">{t.toolsText}</p>
      <a className="button button-live" href={`${CUT_STUDIO_URL}/${locale}`}>
        {t.toolsCta} <span aria-hidden="true">↗</span>
      </a>
      <p className="studio-small mono">{t.toolsSmallPrint}</p>
      <p>
        <Link href={`/${locale}`}>{t.backTop}</Link>
      </p>
    </div>
  );
}
