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
    slug: "ai-automation",
    field: "systems",
    status: "live",
    glyph: "⚙",
    kind: "AI AUTOMATION",
    count: { ar: "٩ أنظمة", en: "9 systems" },
    title: { ar: "أنظمة الأتمتة بالذكاء الاصطناعي", en: "AI automation systems" },
    blurb: {
      ar: "مصنع شورتس عربي وإنجليزي يعمل كل يوم، وحوله ثمانية أنظمة بنيتها: تعلّم من الأرقام، ومواضيع بمصادر، ونشر على أربع منصات، وتحكّم من المحادثة، وحارس ليلي.",
      en: "A Shorts factory for an Arabic and an English channel that runs every day, and eight systems I built around it: learning from the numbers, sourced topics, four-platform publishing, chat control and a night watch.",
    },
  },
  {
    slug: "cut-studio",
    field: "code",
    status: "live",
    glyph: "✂",
    kind: "WEB TOOL",
    count: { ar: "٢٣ أداة", en: "23 tools" },
    title: { ar: "Cut Studio", en: "Cut Studio" },
    blurb: {
      ar: "٢٣ أداة للّيزر والطباعة والتصميم تعمل داخل متصفحك: تحويل الصور إلى فيكتور، وتكبيرها بالذكاء الاصطناعي، وكتابة عربية جاهزة للقص. بلا حساب وبلا رفع ملفات، صنعتها لورشتي وتركتها مجانية.",
      en: "Twenty-three laser, print and design tools that run in your browser: image to vector, AI upscaling, Arabic lettering ready to cut. No account, no uploads; built for my own workshop and left free.",
    },
  },
  {
    slug: "design-studies",
    field: "design",
    status: "live",
    glyph: "◈",
    kind: "DESIGN",
    count: { ar: "٢٠ دراسة", en: "20 studies" },
    title: { ar: "دراسات التصميم", en: "Design studies" },
    blurb: {
      ar: "عشرون دراسة أبني فيها هوية بصرية كاملة لنشاط متخيَّل: ألوان وخطوط وواجهة تعمل. دراسات لا مشاريع عملاء.",
      en: "Twenty studies where I build a full visual identity for an imagined business: colour, type and a working interface. Studies, not client projects.",
    },
  },
  {
    slug: "saas-panel",
    field: "saas",
    status: "live",
    glyph: "▤",
    kind: "SAAS",
    count: { ar: "٤ تطبيقات", en: "4 apps" },
    title: { ar: "أنظمة SaaS", en: "SaaS systems" },
    blurb: {
      ar: "أربعة تطبيقات أعمال في لوحة واحدة: علاقات العملاء، والفواتير، والحجوزات، والمخزون. أضف صفاً وسيبقى بعد أن تغادر.",
      en: "Four business apps in one panel: a CRM, invoicing, bookings and inventory. Add a row and it is still there after you leave.",
    },
  },
];

export function getLabWork(slug: string): LabWork | undefined {
  return labWorks.find(work => work.slug === slug);
}
