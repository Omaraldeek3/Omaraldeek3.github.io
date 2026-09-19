export type Locale = "ar" | "en";
export const locales: Locale[] = ["ar", "en"];
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

// Edit personal details here. Use international digits only for WhatsApp.
// Leave missing values empty: the UI never creates a fake contact link.
export const profile = {
  name: { ar: "عمر الديك", en: "Omar Aldeek" },
  whatsapp: "",
  email: "",
  siteUrl: "", // Your real production origin, e.g. https://your-domain.com
  location: { ar: "من فلسطين، إلى كل مكان", en: "From Palestine, to everywhere" },
  // Every value is a full https URL; an empty value renders nothing.
  links: {
    github: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    instagram: "",
    x: "",
    behance: "",
  },
};

// Copy for the v2 home page. Arabic is the source; English is an adaptation.
// Latin words inside an Arabic sentence are written between square brackets and
// rendered as <bdi>…</bdi> by `isolated()` in src/components/sections.tsx, so
// punctuation stays put in RTL. Plain text only: never HTML.
export const copy = {
  ar: {
    title: "عمر الديك — مبرمج · مصمّم · باني أنظمة أتمتة",
    description: "عمر الديك، من فلسطين. أصمّم واجهات وقطعًا تُقصّ بالليزر، أبني مواقع وتطبيقات ويب، وأشغّل مصنعًا مؤتمتًا لمقاطع الشورتس بالعربية والإنجليزية.",
    skip: "انتقل إلى المحتوى", menu: "فتح القائمة", close: "إغلاق القائمة", navigation: "التنقل الرئيسي",
    wordmarkLine: "برمجة · تصميم · أنظمة", nav: ["البرمجة", "التصميم", "الأنظمة", "Cut Studio"],
    free: "مجاني", discuss: "تواصل",
    heroEyebrow: "مبرمج · مصمّم · باني أنظمة أتمتة",
    heroLines: ["أرسم الشكل.", "أكتب الكود.", "وأبني النظام الذي يُكمل العمل."],
    heroLead: "عمر الديك، من فلسطين. أصمّم واجهات وقطعًا تُقصّ بالليزر، أبني مواقع وتطبيقات ويب، وأشغّل مصنعًا مؤتمتًا لمقاطع الشورتس بالعربية والإنجليزية.",
    heroCtaTools: "جرّب Cut Studio مجانًا", heroCtaFactory: "كيف يعمل المصنع", heroScroll: "مرّر لتتبع الخط",
    layersLabel: "ثلاث طبقات، ملف واحد",
    layers: [
      { id: "code", tag: "LAYER 01 · CODE", title: "البرمجة", text: "مواقع وتطبيقات ويب بـ [Next.js] و [React] و [TypeScript]. أبنيها سريعة، ثنائية اللغة، وتعمل على الهاتف أولًا.", proof: "هذا الموقع نفسه، و [Cut Studio]", proofHref: "#cut-studio" },
      { id: "design", tag: "LAYER 02 · ENGRAVE", title: "التصميم", text: "تصميم بصري وواجهات، وتصميم للتصنيع والقص بالليزر: من الفيكتور النظيف إلى قطع تُركّب.", proof: "دراسات تصميم", proofHref: "#studies" },
      { id: "systems", tag: "LAYER 03 · SYSTEMS", title: "الأنظمة", text: "أنظمة أتمتة تربط الأدوات ببعضها وتعمل على جدول. أوضح مثال: مصنع شورتس يعمل كل يوم.", proof: "ادخل المصنع", proofHref: "#systems-flow" },
    ],
    factoryLabel: "نظام حقيقي، يعمل الآن", factoryTitle: "مصنع الشورتس.",
    factoryIntro: "قناة شورتس عربية وأخرى إنجليزية، يديرهما خط إنتاج بنيته من البداية للنهاية. هذه محطاته بالترتيب.",
    stations: [
      { code: "PLAN", title: "التخطيط", text: "[n8n] يجدول العمل ويشغّل كل خطوة في وقتها.", tags: ["n8n"] },
      { code: "WRITE", title: "الكتابة", text: "نموذج لغوي يكتب النص، ونموذج ثانٍ جاهز إن تعثّر الأول.", tags: ["LLM"] },
      { code: "CHECK", title: "الفحص", text: "مدقّق يرفض النص إن خالف الطول أو المدة المتوقعة أو قواعد البداية، ويطلب إعادة الكتابة.", tags: ["validator"] },
      { code: "VOICE", title: "الصوت", text: "التعليق الصوتي عبر [ElevenLabs] أو [edge-tts] أو [Gemini]، حسب الإعداد.", tags: ["ElevenLabs", "edge-tts", "Gemini"] },
      { code: "RENDER", title: "المونتاج", text: "[MoneyPrinterTurbo] يركّب الفيديو على خادم [VPS].", tags: ["MoneyPrinterTurbo", "VPS"] },
      { code: "PUBLISH", title: "النشر", text: "الفيديو الجاهز يُنشر على يوتيوب، وعلى تيك توك في الخط العربي.", tags: ["YouTube", "TikTok"] },
    ],
    oversightTitle: "وعلى الجانب: فريق مراجعة",
    oversightText: "فريق من وكلاء الذكاء الاصطناعي على [Buzz]، خادم دردشة مستضاف ذاتيًا، يراجع العمل على النظام.",
    oversightTags: ["Buzz", "AI agents"], watchChannel: "شاهد القناة",
    toolsLabel: "أداة مجانية", toolsTitle: "[Cut Studio] — ورشة الليزر في متصفحك.",
    toolsText: "أدوات صنعتها لعملي في القص والحفر بالليزر، وأتركها مجانية لكل من يحتاجها. بلا حساب، وملفات [SVG] و [DXF] والصور تُعالج على جهازك.",
    toolsCta: "افتح Cut Studio",
    toolsSmallPrint: "الواجهة بالعربية والإنجليزية. تحويل ملفات [CDR] متاح فقط عند تشغيل الأداة محليًا.",
    studiesLabel: "دراسات", studiesTitle: "دراسات تصميم.",
    studiesIntro: "ثلاث تجارب أبني فيها اتجاهًا بصريًا كاملًا لنشاط متخيَّل، من الفكرة إلى واجهة تعمل.",
    principlesTitle: "أبني ما أستخدمه.",
    principles: ["أبدأ بالمشكلة، لا بالشكل.", "أجعل ما أبنيه يعمل على الهاتف وباللغتين.", "وأترك الأداة مفيدة لغيري أيضًا."],
    contactTitle: "عندك فكرة تحتاج شكلًا، أو كودًا، أو نظامًا؟",
    whatsapp: "تواصل عبر واتساب", email: "أرسل بريدًا", pendingContact: "بيانات التواصل ستُضاف قريبًا. يمكنك الآن تجهيز موجز مشروعك والاحتفاظ به.",
    prepare: "جهّز موجز مشروعك", briefTitle: "لنرتّب فكرتك.", briefHelp: "هذا الموجز يُحفظ على جهازك فقط، ولا يُرسل إلى أي جهة.",
    nameLabel: "اسمك أو اسم المشروع", ideaLabel: "ماذا تريد أن نبني؟", briefSubmit: "حمّل موجز المشروع", briefError: "أدخل الاسم ووصفًا لا يقل عن 10 أحرف.",
    briefDone: "تم تجهيز ملف الموجز للتحميل. لم يتم إرسال أي بيانات.",
    briefNeedsJS: "يتطلب حفظ الموجز محليًا تشغيل JavaScript. الحقول معطّلة حاليًا، ولن تُرسل أي بيانات.",
    backTop: "إلى الأعلى",
    backWork: "العودة إلى الأعمال", goal: "الهدف", solution: "الحل التصميمي", delivered: "الأجزاء المنفذة", preview: "المعاينة", openPreview: "افتح المعاينة المحلية", nextProject: "المشروع التالي", projectDetails: "عن المشروع", previewNotice: "هذه معاينة تصميمية محلية. العلامة والمحتوى توضيحيان، ولا يوجد نشاط تجاري أو حجز أو شراء فعلي.", backProject: "العودة إلى تفاصيل المشروع",
    concept: "نموذج تجريبي — ليس مشروع عميل",
  },
  en: {
    title: "Omar Aldeek — Developer · Designer · Automation builder",
    description: "Omar Aldeek, from Palestine. I design interfaces and laser-cut parts, build web apps and sites, and run an automated factory for Arabic and English Shorts.",
    skip: "Skip to content", menu: "Open menu", close: "Close menu", navigation: "Main navigation",
    wordmarkLine: "CODE · DESIGN · SYSTEMS", nav: ["Code", "Design", "Systems", "Cut Studio"],
    free: "Free", discuss: "Contact",
    heroEyebrow: "Developer · Designer · Automation builder",
    heroLines: ["I draw the shape.", "I write the code.", "I build the system that carries it on."],
    heroLead: "Omar Aldeek, from Palestine. I design interfaces and laser-cut parts, build web apps and sites, and run an automated factory for Arabic and English Shorts.",
    heroCtaTools: "Try Cut Studio, free", heroCtaFactory: "See how the factory works", heroScroll: "Scroll to follow the line",
    layersLabel: "Three layers, one file",
    layers: [
      { id: "code", tag: "LAYER 01 · CODE", title: "Code", text: "Web apps and sites in Next.js, React and TypeScript. Fast, bilingual, and built for the phone first.", proof: "This site, and Cut Studio", proofHref: "#cut-studio" },
      { id: "design", tag: "LAYER 02 · ENGRAVE", title: "Design", text: "Visual and interface design, plus design for fabrication and laser cutting: from clean vectors to parts that fit together.", proof: "Design studies", proofHref: "#studies" },
      { id: "systems", tag: "LAYER 03 · SYSTEMS", title: "Systems", text: "Automation that connects tools and runs on a schedule. The clearest example is a Shorts factory that runs every day.", proof: "Step into the factory", proofHref: "#systems-flow" },
    ],
    factoryLabel: "A real system, running now", factoryTitle: "The Shorts factory.",
    factoryIntro: "An Arabic Shorts channel and an English one, run by a production line I built end to end. These are its stations, in order.",
    stations: [
      { code: "PLAN", title: "Plan", text: "n8n schedules the work and runs every step on time.", tags: ["n8n"] },
      { code: "WRITE", title: "Write", text: "A language model writes the script, with a second model ready if the first one fails.", tags: ["LLM"] },
      { code: "CHECK", title: "Check", text: "A validator rejects a script that breaks the length, predicted duration or hook rules, and asks for a rewrite.", tags: ["validator"] },
      { code: "VOICE", title: "Voice", text: "Narration by ElevenLabs, edge-tts or Gemini, depending on the setting.", tags: ["ElevenLabs", "edge-tts", "Gemini"] },
      { code: "RENDER", title: "Render", text: "MoneyPrinterTurbo assembles the video on a VPS.", tags: ["MoneyPrinterTurbo", "VPS"] },
      { code: "PUBLISH", title: "Publish", text: "The finished video goes out to YouTube, and to TikTok on the Arabic line.", tags: ["YouTube", "TikTok"] },
    ],
    oversightTitle: "Alongside: a review team",
    oversightText: "A team of AI agents on Buzz, a self-hosted chat, reviews the work on the system.",
    oversightTags: ["Buzz", "AI agents"], watchChannel: "Watch the channel",
    toolsLabel: "A free tool", toolsTitle: "Cut Studio — a laser workshop in your browser.",
    toolsText: "Tools I built for my own laser cutting and engraving work, free for anyone who needs them. No account, and SVG, DXF and image files are processed on your device.",
    toolsCta: "Open Cut Studio",
    toolsSmallPrint: "Arabic and English interface. CDR conversion is only available when the toolkit runs locally.",
    studiesLabel: "Studies", studiesTitle: "Design studies.",
    studiesIntro: "Three exercises in building a full visual direction for an imagined business, from idea to a working interface.",
    principlesTitle: "I build what I use.",
    principles: ["Start from the problem, not the look.", "Make it work on a phone, in both languages.", "And leave the tool useful to others, too."],
    contactTitle: "Have an idea that needs a shape, code, or a system?",
    whatsapp: "Chat on WhatsApp", email: "Send an email", pendingContact: "Contact details will be added soon. For now, you can prepare a project brief and keep a copy.",
    prepare: "Prepare your project brief", briefTitle: "Let's shape your idea.", briefHelp: "This brief is saved on your device only. It isn't sent anywhere.",
    nameLabel: "Your name or project name", ideaLabel: "What would you like to build?", briefSubmit: "Download project brief", briefError: "Add a name and a description of at least 10 characters.",
    briefDone: "Your brief is ready to download. No information has been sent.",
    briefNeedsJS: "Saving a brief locally requires JavaScript. The fields are disabled and no information will be sent.",
    backTop: "Back to top",
    backWork: "Back to work", goal: "The goal", solution: "Design approach", delivered: "What was built", preview: "Preview", openPreview: "Open local preview", nextProject: "Next project", projectDetails: "About the project", previewNotice: "A local design concept. The brand and content are illustrative; no real business, booking or purchase is available.", backProject: "Back to project details",
    concept: "Design concept — not a client project",
  },
};

export const projects = [
  {
    slug: "finjan", number: "01", theme: "coffee", label: "FINJAN", year: "2026",
    ar: { name: "فنجان", type: "موقع مقهى مختص", summary: "مساحة رقمية دافئة، تشبه أول رشفة قهوة في صباح هادئ.", goal: "استكشاف حضور رقمي لمقهى مختص يروي قصة المكان ويقدّم منتجاته في تجربة سهلة.", solution: "درجات بنية وكريمية، عناوين واسعة وصور قريبة من تفاصيل القهوة. تكوين يترك مساحة للحكاية والمنتج معًا.", parts: ["صفحة افتتاحية متجاوبة", "عرض توضيحي لقائمة القهوة", "قسم قصة المقهى", "تجربة عربية وإنجليزية"], tags: ["تصميم واجهات", "تطوير", "مقهى"] },
    en: { name: "Finjan", type: "Specialty coffee website", summary: "A warm digital space, like the first sip of coffee on a quiet morning.", goal: "Explore a digital home for a specialty café, bringing its story and coffee into one easy experience.", solution: "Coffee brown and cream, generous type, and close-up coffee photography. A composition that gives both the story and the product room to breathe.", parts: ["Responsive homepage", "Illustrative coffee menu", "Café story section", "Arabic and English experience"], tags: ["UI design", "Development", "Coffee"] },
  },
  {
    slug: "forma", number: "02", theme: "interior", label: "FORMA", year: "2026",
    ar: { name: "فورما", type: "استوديو تصميم داخلي", summary: "حين تصبح المساحة لغة. تجربة هادئة تترك التصميم يتحدث.", goal: "إنشاء تصور لمعرض معماري يعطي المساحات والصور أولوية، مع تعريف واضح بفلسفة الاستوديو.", solution: "شبكة تحريرية، ألوان حجرية، وتوازن بين الصور الكبيرة والهوامش. عناوين بسيطة ترافق المعاينات دون أن تزاحمها.", parts: ["واجهة معرض معماري", "عرض أعمال بصري", "قسم فلسفة التصميم", "تخطيط متجاوب باللغتين"], tags: ["اتجاه فني", "تصميم واجهات", "تطوير"] },
    en: { name: "Forma", type: "Interior design studio", summary: "When space becomes a language. A quiet experience that lets design speak.", goal: "Create an architectural portfolio concept that gives space and imagery priority while clearly expressing a studio's philosophy.", solution: "An editorial grid, stone tones, and a balance of large images and generous margins. Restrained headlines accompany the work without competing with it.", parts: ["Architectural portfolio interface", "Visual project showcase", "Design philosophy section", "Bilingual responsive layouts"], tags: ["Art direction", "UI design", "Development"] },
  },
  {
    slug: "madar", number: "03", theme: "business", label: "MADAR", year: "2026",
    ar: { name: "مدار", type: "موقع شركة خدمات", summary: "فكرة مؤسسية أكثر إنسانية. وضوح يمنح العمل مساحة للنمو.", goal: "تصوّر موقع لشركة خدمات يجعل فهم عرضها والتنقل بين معلوماتها بسيطًا لأصحاب المشاريع.", solution: "أزرق عميق مع مساحات فاتحة وشبكة هندسية واضحة. التسلسل البصري يشرح الفكرة ثم يوجّه نحو تفاصيل الخدمات.", parts: ["صفحة تعريف بالشركة", "عرض منظم للخدمات", "قسم منهجية العمل", "واجهات مهيأة للهاتف"], tags: ["تصميم مواقع", "تطوير", "أعمال"] },
    en: { name: "Madar", type: "Business services website", summary: "A more human business presence. Clarity that gives ideas room to grow.", goal: "Imagine a service company's website that makes its offer and information easy for business owners to understand.", solution: "Deep blue, light surfaces and a clear geometric grid. A visual hierarchy introduces the idea before guiding visitors into the services.", parts: ["Company introduction page", "Structured service overview", "Process section", "Mobile-ready interfaces"], tags: ["Web design", "Development", "Business"] },
  },
];
export type Project = (typeof projects)[number];
