import type { Locale } from "../content/locales";

export type LabStatus = "live" | "building";

export type LabWork = {
  slug: string;
  field: string;
  status: LabStatus;
  /** Shown on the card's plate. Decorative, hence aria-hidden where it renders. */
  glyph: string;
  /** The kind tag, kept in Latin on purpose so it reads the same either way. */
  kind: string;
  title: Record<Locale, string>;
  blurb: Record<Locale, string>;
  /** A real count for the card's corner, or omitted when there is none to give. */
  count?: Record<Locale, string>;
};

/** The single extension point for the lab. A new work is one entry here plus
 *  its own folder under src/lab; nothing else in the site needs to change. */
export const labWorks: LabWork[] = [
  {
    slug: "shorts-factory",
    field: "systems",
    status: "live",
    glyph: "⚙",
    kind: "AUTOMATION",
    count: { ar: "٦ محطات", en: "6 stations" },
    title: { ar: "مصنع الشورتس", en: "The Shorts factory" },
    blurb: {
      ar: "قناة شورتس عربية وأخرى إنجليزية يديرهما خط إنتاج بنيته من البداية للنهاية: جدولة، كتابة، فحص، صوت، مونتاج، نشر. يعمل كل يوم.",
      en: "An Arabic Shorts channel and an English one, both run by a pipeline I built end to end: scheduling, writing, checking, voice, render, publish. It runs every day.",
    },
  },
  {
    slug: "cut-studio",
    field: "code",
    status: "live",
    glyph: "✂",
    kind: "WEB TOOL",
    count: { ar: "٧ أدوات", en: "7 tools" },
    title: { ar: "Cut Studio", en: "Cut Studio" },
    blurb: {
      ar: "سبع أدوات ليزر وتصميم تعمل كلها داخل متصفحك، بلا حساب وبلا رفع ملفات. صنعتها لعملي وتركتها مجانية.",
      en: "Seven laser and design tools that run entirely in your browser, with no account and no uploads. I built them for my own work and left them free.",
    },
  },
  {
    slug: "design-studies",
    field: "design",
    status: "live",
    glyph: "◈",
    kind: "DESIGN",
    count: { ar: "٣ دراسات", en: "3 studies" },
    title: { ar: "دراسات التصميم", en: "Design studies" },
    blurb: {
      ar: "ثلاث دراسات أبني فيها اتجاهاً بصرياً كاملاً لنشاط متخيَّل، من الفكرة إلى واجهة تعمل. دراسات لا مشاريع عملاء.",
      en: "Three studies where I build a full visual direction for an imagined business, from idea to a working interface. Studies, not client projects.",
    },
  },
  {
    slug: "saas-panel",
    field: "saas",
    status: "building",
    glyph: "▤",
    kind: "SAAS",
    title: { ar: "لوحة SaaS", en: "SaaS panel" },
    blurb: {
      ar: "واجهة منتج مصغّرة ببيانات حقيقية: أضف صفاً وسيبقى بعد أن تغادر.",
      en: "A miniature product surface on real data: add a row and it is still there after you leave.",
    },
  },
];

export function getLabWork(slug: string): LabWork | undefined {
  return labWorks.find(work => work.slug === slug);
}
