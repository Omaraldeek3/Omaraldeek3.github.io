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
    count: { ar: "٢٩ أداة", en: "29 tools" },
    title: { ar: "Cut Studio", en: "Cut Studio" },
    blurb: {
      ar: "٢٩ أداة للّيزر والطباعة والتصميم تعمل داخل متصفحك: تحويل الصور إلى فيكتور، ورسم تصميم من وصف بأي نموذج صور، وإزالة خلفية الصور، ومعاينة التصميم على المنتج، وتكبير الصور بالذكاء الاصطناعي، وكتابة عربية بخطوط حرف. بلا حساب وبلا رفع ملفات، صنعتها لورشتي وتركتها مجانية.",
      en: "Twenty-nine laser, print and design tools that run in your browser: image to vector, design from a description with any image model, photo background removal, product mockups, AI upscaling, Arabic lettering in Harf's fonts. No account, no uploads; built for my own workshop and left free.",
    },
  },
  {
    slug: "sira",
    field: "code",
    status: "live",
    glyph: "✎",
    kind: "WEB TOOL",
    title: { ar: "سيرة", en: "Sira" },
    blurb: {
      ar: "منشئ سيرة ذاتية مجاني يُبقي نسختك العربية والإنجليزية متطابقتين: تكتب كل نص بلغتين، وتطبع كل نسخة PDF نظيفاً من متصفحك. بلا حساب، وبياناتك لا تغادر جهازك.",
      en: "A free CV builder that keeps your Arabic and English CVs in step: write each line in both languages and print each version to a clean PDF from your browser. No account, and your data never leaves your device.",
    },
  },
  {
    slug: "harf",
    field: "design",
    status: "live",
    glyph: "ح",
    kind: "WEB TOOL",
    count: { ar: "٤٣٦ خطاً", en: "436 fonts" },
    title: { ar: "حرف", en: "Harf" },
    blurb: {
      ar: "مساحة مجانية لمعاينة الخطوط العربية والإنجليزية ومقارنتها: اكتب جملتك وشاهدها بمئات الخطوط، ثم نزّل الخط مع رخصته أو صدّر النص مسارات SVG جاهزة لتصميمك.",
      en: "A free place to preview and compare Arabic and English fonts: type your line, see it in hundreds of typefaces, then download the font with its licence or export the text as SVG outlines ready for your design.",
    },
  },
  {
    slug: "naqsh",
    field: "design",
    status: "live",
    glyph: "✦",
    kind: "WEB TOOL",
    count: { ar: "٤٨٠ تصميماً", en: "480 designs" },
    title: { ar: "نقش", en: "Naqsh" },
    blurb: {
      ar: "مكتبة واستوديو SVG مفتوح المصدر يبدأ بالزخارف العربية والإسلامية والنباتية: شبكات هندسية وأرابيسك ووردات وإطارات، تخصّصها وتصدّرها من متصفحك بلا حساب.",
      en: "An open-source SVG library and studio that starts with Arabic, Islamic and floral ornament: geometric grids, arabesque, rosettes and frames you customise and export from your browser, no account.",
    },
  },
  {
    slug: "qalib",
    field: "design",
    status: "live",
    glyph: "ق",
    kind: "DESIGN LIBRARY",
    count: { ar: "٣٢٤ تصميماً", en: "324 designs" },
    title: { ar: "قالب", en: "Qalib" },
    blurb: {
      ar: "مكتبة تصاميم مواقع وتطبيقات بالعربية والإنجليزية: ٢٧ أسلوباً من الكلاسيكي إلى البكسل وواجهات الأدوات، لـ٣٣ نوعاً من الأعمال لا يتكرر محتواها، ولكل تصميم معاينة حية وبرومبت مفصّل يبني الموقع نفسه مع Claude Code.",
      en: "A library of Arabic and English website and app designs: 27 styles from classic to pixel and tool interfaces, for 33 kinds of business whose demo content doesn't repeat, each design with a live demo and a detailed prompt that builds the same site with Claude Code.",
    },
  },
  {
    slug: "shakl",
    field: "design",
    status: "live",
    glyph: "ش",
    kind: "3D LIBRARY",
    count: { ar: "٥٣ تصميماً", en: "53 designs" },
    title: { ar: "شكل", en: "Shakl" },
    blurb: {
      ar: "مكتبة تصاميم خشبية ثلاثية الأبعاد للقص بالليزر بلا تكرار: قوالب عملية للمكتب والمحل والبيت، من حامل الجوال وحامل رمز QR ورف البهارات ومدرج العرض إلى قطار التروس، مع بيوت وصناديق وفوانيس. تعاينها مجسّمة وتغيّر مقاساتها ثم تنزّل ملفات القص SVG بمقياس ١:١، بلا حساب.",
      en: "A library of 3D wooden designs for laser cutting, none repeated: practical templates for the desk, the shop and the home, from a phone stand, a QR code stand, a spice rack and counter display steps to a gear train, with houses, boxes and lanterns. Preview in 3D, resize, then download 1:1 SVG cutting files, no account.",
    },
  },
  {
    slug: "organizer",
    field: "code",
    status: "live",
    glyph: "▦",
    kind: "DESKTOP APP",
    title: { ar: "منظّم الاستوديو", en: "Smart File Organizer" },
    blurb: {
      ar: "تطبيق ويندوز يرتّب ملفات CorelDRAW وPhotoshop وIllustrator في أرشيف حسب العميل ثم الشهر، ويفهم الاسم العربي والإنجليزي للعميل نفسه. يعمل محلياً بالكامل ويمكن التراجع عن كل عملية.",
      en: "A Windows app that files CorelDRAW, Photoshop and Illustrator work into an archive by client, then month, and knows a client's Arabic and English names are the same client. Fully local, and every run can be undone.",
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
