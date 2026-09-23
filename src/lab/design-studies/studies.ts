import type { Locale } from "@/content/locales";

export const categories = ["food", "health", "money", "culture", "places", "services", "tech"] as const;
export type Category = (typeof categories)[number];

export const categoryNames: Record<Category, Record<Locale, string>> = {
  food: { ar: "طعام وضيافة", en: "Food & hospitality" },
  health: { ar: "صحة ورياضة", en: "Health & sport" },
  money: { ar: "مال وأعمال", en: "Money & business" },
  culture: { ar: "ثقافة وفنون", en: "Culture & arts" },
  places: { ar: "أماكن وسفر", en: "Places & travel" },
  services: { ar: "خدمات", en: "Services" },
  tech: { ar: "تقنية وتعليم", en: "Tech & learning" },
};

export type Layout = "split" | "center" | "editorial" | "poster" | "bento";
export type Face = "grotesk" | "serif" | "rounded" | "condensed" | "mono";
export type Motif =
  | "pulse" | "leaf" | "sun" | "lines" | "rings" | "arches" | "blocks" | "stripes"
  | "dots" | "columns" | "route" | "rays" | "stitch" | "grid" | "waves" | "frames" | "sound";

export type Palette = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
};

type StudyCopy = {
  name: string;
  type: string;
  tagline: string;
  headline: string;
  lead: string;
  cta: string;
  cta2: string;
  nav: [string, string, string];
  features: [string, string][];
  stats: [string, string][];
  quote: string;
  /** Why it looks the way it does, in one or two sentences. */
  idea: string;
  /** The design decisions, one per line. */
  points: string[];
};

export type Study = {
  slug: string;
  number: string;
  category: Category;
  layout: Layout;
  face: Face;
  motif: Motif;
  /** Corner radius in the study's own components, in px. */
  radius: number;
  palette: Palette;
  ar: StudyCopy;
  en: StudyCopy;
};

export const studies: Study[] = [
  {
    slug: "nabd",
    number: "04",
    category: "health",
    layout: "split",
    face: "grotesk",
    motif: "pulse",
    radius: 14,
    palette: { bg: "#f2f8f7", surface: "#ffffff", ink: "#0e2a2b", muted: "#557170", accent: "#0f9b9b", accent2: "#ff7a59" },
    ar: {
      name: "نبض", type: "عيادة أسنان وعائلة", tagline: "رعاية هادئة لكل العائلة",
      headline: "ابتسامة مطمئنة،\nمن أول زيارة.", lead: "مواعيد في دقيقة، وأطباء يشرحون قبل أن يبدؤوا، وعيادة لا تشبه العيادات.",
      cta: "احجز موعدك", cta2: "تعرّف على الأطباء", nav: ["الخدمات", "الأطباء", "الأسعار"],
      features: [["حجز فوري", "اختر الطبيب والوقت من هاتفك."], ["شرح قبل العلاج", "خطة مكتوبة وتكلفة واضحة."], ["أطفال بلا خوف", "غرفة وألعاب وطبيبة أطفال."]],
      stats: [["١٢", "سنة خبرة"], ["٤٫٩", "تقييم المراجعين"], ["٢٠ د", "متوسط الانتظار"]],
      quote: "أول مرة يخرج ابني من عند طبيب الأسنان مبتسماً.",
      idea: "الخوف هو ما يمنع الناس من الحجز، فالهوية كلها تهدئة: أخضر مائي، ومساحات بيضاء واسعة، وخط نبض يتحول إلى ابتسامة.",
      points: ["لون تركوازي هادئ مع برتقالي دافئ للأزرار فقط", "زوايا مستديرة متوسطة: ودودة دون أن تكون طفولية", "زر الحجز حاضر في كل شاشة"],
    },
    en: {
      name: "Nabd", type: "Family dental clinic", tagline: "CALM CARE FOR THE WHOLE FAMILY",
      headline: "A reassured smile,\nfrom the first visit.", lead: "Book in a minute, meet dentists who explain before they start, in a clinic that doesn't feel like one.",
      cta: "Book a visit", cta2: "Meet the dentists", nav: ["Services", "Dentists", "Pricing"],
      features: [["Instant booking", "Pick the dentist and time from your phone."], ["Explained first", "A written plan and a clear price."], ["Kids, unafraid", "A playroom and a children's dentist."]],
      stats: [["12", "years of care"], ["4.9", "patient rating"], ["20 min", "average wait"]],
      quote: "The first time my son left the dentist smiling.",
      idea: "Fear is what stops people booking, so the whole identity calms: water green, generous white space, and a pulse line that turns into a smile.",
      points: ["Calm teal, with warm orange kept for buttons only", "Medium radius: friendly without looking childish", "The booking button is present on every screen"],
    },
  },
  {
    slug: "zaytoun",
    number: "05",
    category: "food",
    layout: "editorial",
    face: "serif",
    motif: "leaf",
    radius: 2,
    palette: { bg: "#f4efdf", surface: "#fbf7ea", ink: "#2b3113", muted: "#6a6a48", accent: "#5f7119", accent2: "#c49a22" },
    ar: {
      name: "زيتون", type: "زيت زيتون من المعصرة", tagline: "عصرة أولى على البارد · موسم ٢٠٢٦",
      headline: "من الشجرة\nإلى مائدتك.", lead: "زيت من كروم عائلية في جبال فلسطين، يُقطف باليد ويُعصر خلال ساعات.",
      cta: "اطلب الموسم", cta2: "قصة الكروم", nav: ["المتجر", "المعصرة", "وصفات"],
      features: [["قطاف يدوي", "لا آلات تجرح الحبة."], ["عصر في يومه", "حموضة أقل من ٠٫٣٪."], ["تعبئة معتمة", "زجاج داكن يحفظ النكهة."]],
      stats: [["٣", "أجيال في الكرم"], ["٤٠٠", "شجرة معمّرة"], ["٠٫٣٪", "حموضة قصوى"]],
      quote: "طعم يذكّرني بزيت جدتي.",
      idea: "منتج عمره قرون يحتاج لغة مطبوعات لا لغة تطبيقات: خط بزوائد، وأعمدة تحريرية، وورقة زيتون ذهبية واحدة.",
      points: ["زيتوني عميق وذهبي على ورق كريمي", "خط بزوائد للعناوين يوحي بالعراقة", "زوايا حادة كملصق زجاجة قديم"],
    },
    en: {
      name: "Zaytoun", type: "Estate olive oil", tagline: "FIRST COLD PRESS · HARVEST 2026",
      headline: "From the tree\nto your table.", lead: "Oil from family groves in the hills of Palestine, picked by hand and pressed within hours.",
      cta: "Order the harvest", cta2: "The groves", nav: ["Shop", "The press", "Recipes"],
      features: [["Hand picked", "No machine bruises the fruit."], ["Pressed same day", "Acidity under 0.3%."], ["Dark glass", "Bottled to keep the flavour."]],
      stats: [["3", "generations"], ["400", "ancient trees"], ["0.3%", "max acidity"]],
      quote: "It tastes like my grandmother's oil.",
      idea: "A product centuries old wants the language of print, not of apps: a serif face, editorial columns and a single golden olive leaf.",
      points: ["Deep olive and gold on cream paper", "A serif for headlines, for age and craft", "Sharp corners, like an old bottle label"],
    },
  },
  {
    slug: "rihla",
    number: "06",
    category: "places",
    layout: "poster",
    face: "grotesk",
    motif: "sun",
    radius: 999,
    palette: { bg: "#1f1236", surface: "#2c1a4a", ink: "#fff3e4", muted: "#c9b6da", accent: "#ff8a3d", accent2: "#ffd166" },
    ar: {
      name: "رحلة", type: "وكالة رحلات ومغامرات", tagline: "رحلات صغيرة بمجموعات صغيرة",
      headline: "الغروب\nلا يُحجز مرتين.", lead: "رحلات لعشرة أشخاص فقط، إلى أماكن لا تصلها الحافلات الكبيرة.",
      cta: "اختر رحلتك", cta2: "التقويم", nav: ["الوجهات", "التقويم", "عنّا"],
      features: [["مجموعات صغيرة", "عشرة مسافرين كحد أقصى."], ["دليل محلي", "من أهل المكان نفسه."], ["سعر شامل", "لا مفاجآت عند الوصول."]],
      stats: [["٣٢", "وجهة"], ["١٠", "مسافرين بالرحلة"], ["٩٨٪", "يعودون معنا"]],
      quote: "رأيت وادي رم كما لم أره في الصور.",
      idea: "السفر شعور قبل أن يكون جدولاً: بنفسجي الليل، وبرتقالي الشمس الغاربة، وعنوان ضخم كملصق رحلة قديم.",
      points: ["تدرّج الغروب هو العلامة نفسها", "عنوان بحجم الملصق يملأ الشاشة", "أزرار كبسولية ناعمة كالأفق"],
    },
    en: {
      name: "Rihla", type: "Small-group travel", tagline: "SMALL TRIPS, SMALL GROUPS",
      headline: "A sunset\nyou can't book twice.", lead: "Trips for ten people at most, to places the big coaches never reach.",
      cta: "Choose a trip", cta2: "Calendar", nav: ["Destinations", "Calendar", "About"],
      features: [["Small groups", "Ten travellers at most."], ["Local guides", "People from the place itself."], ["One price", "No surprises on arrival."]],
      stats: [["32", "destinations"], ["10", "per group"], ["98%", "travel again"]],
      quote: "I saw Wadi Rum the way photos never showed it.",
      idea: "Travel is a feeling before it is a schedule: night violet, the orange of a setting sun, and a headline as big as an old travel poster.",
      points: ["The sunset gradient is the brand itself", "A poster-sized headline fills the screen", "Soft capsule buttons, like the horizon"],
    },
  },
  {
    slug: "qalam",
    number: "07",
    category: "culture",
    layout: "editorial",
    face: "serif",
    motif: "lines",
    radius: 0,
    palette: { bg: "#fbf6ec", surface: "#ffffff", ink: "#1a1a1a", muted: "#6c6356", accent: "#a3161a", accent2: "#1a1a1a" },
    ar: {
      name: "قلم", type: "مكتبة ودار نشر مستقلة", tagline: "مكتبة الحيّ منذ ١٩٨٤",
      headline: "كتاب واحد\nقد يغيّر السنة.", lead: "نختار كل كتاب على الرف بأنفسنا، ونكتب لك لماذا يستحق وقتك.",
      cta: "رشّح لي كتاباً", cta2: "نادي القراءة", nav: ["الرفوف", "النادي", "ننشر"],
      features: [["اختيار يدوي", "ملاحظة بخط البائع على كل كتاب."], ["نادي شهري", "كتاب ونقاش كل خميس."], ["توصيل مغلّف", "بورق الجرائد القديمة."]],
      stats: [["٤٠", "سنة على الرف"], ["٨٠٠٠", "عنوان"], ["١٢٠", "عضو في النادي"]],
      quote: "المكتبة الوحيدة التي تعرف ما أحب قبل أن أطلبه.",
      idea: "واجهة تُقرأ كصفحة كتاب: أسطر مسطّرة، وأحمر الحبر للتصحيح، ولا شيء يلمع بلا سبب.",
      points: ["حبر أسود وأحمر تصحيح على ورق عاجي", "خط بزوائد وحجم قراءة مريح", "زوايا حادة تماماً كحافة الصفحة"],
    },
    en: {
      name: "Qalam", type: "Independent bookshop", tagline: "THE NEIGHBOURHOOD BOOKSHOP SINCE 1984",
      headline: "One book\ncan change a year.", lead: "We choose every book on the shelf ourselves, and tell you why it deserves your time.",
      cta: "Recommend me a book", cta2: "Reading club", nav: ["Shelves", "Club", "We publish"],
      features: [["Chosen by hand", "A handwritten note on every book."], ["Monthly club", "A book and a talk every Thursday."], ["Wrapped delivery", "In old newspaper."]],
      stats: [["40", "years of shelves"], ["8,000", "titles"], ["120", "club members"]],
      quote: "The only shop that knows what I like before I ask.",
      idea: "An interface that reads like a book page: ruled lines, a proofreader's red, and nothing that shines without a reason.",
      points: ["Black ink and proofing red on ivory", "A serif at a comfortable reading size", "Perfectly square corners, like a page edge"],
    },
  },
  {
    slug: "sahm",
    number: "08",
    category: "money",
    layout: "bento",
    face: "grotesk",
    motif: "rings",
    radius: 18,
    palette: { bg: "#0b1020", surface: "#141b35", ink: "#eef1ff", muted: "#8d99c2", accent: "#6d7bff", accent2: "#33d6a6" },
    ar: {
      name: "سهم", type: "محفظة رقمية للمستقلين", tagline: "مالك، في لوحة واحدة",
      headline: "اقبض أسرع.\nوادّخر دون أن تفكّر.", lead: "فواتير بعملات متعددة، وتحويل فوري، وقاعدة ادخار تعمل وحدها مع كل دفعة.",
      cta: "افتح حساباً", cta2: "شاهد العرض", nav: ["الحساب", "البطاقة", "الأسعار"],
      features: [["فواتير بعملتك", "أرسلها بالدولار، استلمها بالشيكل."], ["ادخار تلقائي", "١٠٪ من كل دفعة إلى جانب."], ["بطاقة افتراضية", "لكل اشتراك بطاقته."]],
      stats: [["٣٠ ث", "لفتح الحساب"], ["٠٫٥٪", "رسوم التحويل"], ["٢٤/٧", "دعم بالعربية"]],
      quote: "أول مرة أعرف أين يذهب مالي كل شهر.",
      idea: "المال يحتاج ثقة ووضوحاً: خلفية ليلية هادئة، وأرقام كبيرة مقروءة، وبطاقات بنتو ترتّب كل شيء في نظرة.",
      points: ["نيلي عميق مع أخضر للأرقام الموجبة فقط", "شبكة بنتو: كل بطاقة معلومة واحدة", "أرقام بخط عريض وأحرف ثابتة العرض"],
    },
    en: {
      name: "Sahm", type: "Wallet for freelancers", tagline: "YOUR MONEY, ON ONE SCREEN",
      headline: "Get paid faster.\nSave without thinking.", lead: "Multi-currency invoices, instant transfers, and a savings rule that runs with every payment.",
      cta: "Open an account", cta2: "Watch the demo", nav: ["Account", "Card", "Pricing"],
      features: [["Invoice in any currency", "Send in dollars, receive in shekels."], ["Automatic saving", "10% of every payment, set aside."], ["Virtual cards", "One card per subscription."]],
      stats: [["30 s", "to open"], ["0.5%", "transfer fee"], ["24/7", "support"]],
      quote: "The first time I know where my money goes each month.",
      idea: "Money needs trust and clarity: a calm night background, big legible numbers, and bento tiles that sort everything at a glance.",
      points: ["Deep indigo, with green kept for positive numbers", "A bento grid: one fact per tile", "Bold, tabular figures"],
    },
  },
  {
    slug: "athar",
    number: "09",
    category: "culture",
    layout: "center",
    face: "serif",
    motif: "arches",
    radius: 0,
    palette: { bg: "#efe5d6", surface: "#f8f1e6", ink: "#3a2418", muted: "#7b6352", accent: "#b1522a", accent2: "#2f5d62" },
    ar: {
      name: "أثر", type: "متحف للتراث والذاكرة", tagline: "معرض دائم · القدس القديمة",
      headline: "كل حجر\nيحفظ حكاية.", lead: "ثلاثة آلاف قطعة من البيوت والأسواق، ودليل صوتي يرويها بأصوات أصحابها.",
      cta: "احجز تذكرة", cta2: "جولة افتراضية", nav: ["المعارض", "زوروا", "الأرشيف"],
      features: [["دليل صوتي", "حكايات مسجّلة من أصحابها."], ["أرشيف مفتوح", "صور ووثائق للباحثين."], ["ورش للأطفال", "كل سبت صباحاً."]],
      stats: [["٣٠٠٠", "قطعة"], ["١٢", "قاعة"], ["٤٠", "ساعة تسجيلات"]],
      quote: "خرجت أعرف عن حارتي أكثر مما عرفت في عمري.",
      idea: "الأقواس لغة المدينة القديمة، فصارت إطار كل صورة وكل زر. الطين والتيراكوتا والأخضر العتيق من حجارتها.",
      points: ["ألوان الحجر والطين والنحاس القديم", "القوس شكل متكرر للإطارات", "عناوين بزوائد متوسطة تحترم النص الطويل"],
    },
    en: {
      name: "Athar", type: "Heritage museum", tagline: "PERMANENT EXHIBITION · OLD CITY",
      headline: "Every stone\nkeeps a story.", lead: "Three thousand objects from homes and markets, and an audio guide told in their owners' voices.",
      cta: "Book a ticket", cta2: "Virtual tour", nav: ["Exhibitions", "Visit", "Archive"],
      features: [["Audio guide", "Stories recorded by their owners."], ["Open archive", "Photos and papers for researchers."], ["Kids' workshops", "Every Saturday morning."]],
      stats: [["3,000", "objects"], ["12", "halls"], ["40 h", "of recordings"]],
      quote: "I left knowing more about my street than I had in my life.",
      idea: "Arches are the old city's language, so they frame every image and every button. Clay, terracotta and old green come from its stones.",
      points: ["The colours of stone, clay and aged copper", "The arch as a recurring frame", "A moderate serif that respects long text"],
    },
  },
  {
    slug: "bayt",
    number: "10",
    category: "places",
    layout: "split",
    face: "grotesk",
    motif: "blocks",
    radius: 4,
    palette: { bg: "#f1f1ee", surface: "#ffffff", ink: "#14191d", muted: "#5b646d", accent: "#1d5e73", accent2: "#e2ae36" },
    ar: {
      name: "بيت", type: "منصة عقارات سكنية", tagline: "شقق مُتحقَّق منها في رام الله",
      headline: "بيتك التالي،\nبلا وسيط غامض.", lead: "كل إعلان زرناه بأنفسنا، بصور حقيقية ومساحات مقاسة وسعر نهائي.",
      cta: "ابحث عن بيت", cta2: "أعلن عن عقارك", nav: ["شراء", "إيجار", "أحياء"],
      features: [["زيارة موثّقة", "فريقنا زار كل شقة."], ["مخطط بالأبعاد", "المساحة الحقيقية لا التقديرية."], ["دليل الحي", "مدارس وخدمات حول البيت."]],
      stats: [["١٢٠٠", "شقة مُتحقَّق منها"], ["٣٥", "حياً"], ["٠", "إعلانات مكررة"]],
      quote: "الشقة كانت تماماً كما في الصور. هذا نادر.",
      idea: "العقار قرار كبير يحتاج وضوح المخطط الهندسي: رمادي الخرسانة، وأزرق بترولي، وأصفر علامات الورشة للتنبيهات.",
      points: ["شبكة صارمة كالمخططات المعمارية", "أزرق بترولي للثقة وأصفر للتنبيه", "صور كبيرة، ونص قليل ودقيق"],
    },
    en: {
      name: "Bayt", type: "Home listings platform", tagline: "VERIFIED HOMES IN RAMALLAH",
      headline: "Your next home,\nno murky middleman.", lead: "We visited every listing ourselves: real photos, measured rooms and a final price.",
      cta: "Find a home", cta2: "List your property", nav: ["Buy", "Rent", "Neighbourhoods"],
      features: [["Verified visit", "Our team saw every flat."], ["Measured plan", "Real area, not an estimate."], ["Area guide", "Schools and services nearby."]],
      stats: [["1,200", "verified homes"], ["35", "neighbourhoods"], ["0", "duplicate listings"]],
      quote: "The flat was exactly as in the photos. That's rare.",
      idea: "A home is a big decision that needs the clarity of a floor plan: concrete grey, petrol blue, and site-marking yellow for alerts.",
      points: ["A strict grid, like architectural drawings", "Petrol blue for trust, yellow for alerts", "Large photos and little, precise text"],
    },
  },
  {
    slug: "nukhba",
    number: "11",
    category: "health",
    layout: "poster",
    face: "condensed",
    motif: "stripes",
    radius: 0,
    palette: { bg: "#0d0d0d", surface: "#1b1b1b", ink: "#ffffff", muted: "#a1a1a1", accent: "#d4ff3a", accent2: "#ff3b3b" },
    ar: {
      name: "نخبة", type: "نادي تدريب قوة", tagline: "مفتوح ٢٤ ساعة",
      headline: "لا أعذار.\nفقط تكرار آخر.", lead: "برامج قوة مكتوبة لك، ومدرّب يراجع أرقامك كل أسبوع.",
      cta: "أول حصة مجاناً", cta2: "البرامج", nav: ["البرامج", "المدرّبون", "الاشتراك"],
      features: [["برنامج شخصي", "مكتوب لهدفك ووقتك."], ["متابعة أسبوعية", "أرقامك تُراجع وتُعدَّل."], ["مفتوح دائماً", "ادخل ببطاقتك متى شئت."]],
      stats: [["٢٤/٧", "مفتوح"], ["٦", "مدرّبين"], ["٣٠٠+", "متدرّب"]],
      quote: "رفعت ضعف وزني في ستة أشهر.",
      idea: "طاقة خام: أسود وأخضر فسفوري كإضاءة القاعة، وخطوط مائلة كشريط التحذير، وعنوان ضيق عريض يصرخ.",
      points: ["تباين عالٍ جداً للقراءة من بعيد", "خط ضيق عريض بأحرف كبيرة", "خطوط مائلة تعطي حركة ثابتة"],
    },
    en: {
      name: "Nukhba", type: "Strength training club", tagline: "OPEN 24 HOURS",
      headline: "No excuses.\nJust one more rep.", lead: "Strength programmes written for you, and a coach who reviews your numbers every week.",
      cta: "First session free", cta2: "Programmes", nav: ["Programmes", "Coaches", "Join"],
      features: [["Your programme", "Written for your goal and time."], ["Weekly review", "Numbers checked and adjusted."], ["Always open", "Your card, any hour."]],
      stats: [["24/7", "open"], ["6", "coaches"], ["300+", "members"]],
      quote: "I lifted double my weight in six months.",
      idea: "Raw energy: black and a fluorescent green like the gym lights, hazard-tape diagonals, and a condensed headline that shouts.",
      points: ["Very high contrast, legible from across a room", "A bold condensed face in capitals", "Diagonal stripes give motion at rest"],
    },
  },
  {
    slug: "sukkar",
    number: "12",
    category: "food",
    layout: "center",
    face: "rounded",
    motif: "dots",
    radius: 24,
    palette: { bg: "#fff0f3", surface: "#ffffff", ink: "#4a1b2c", muted: "#8f6577", accent: "#ff5a89", accent2: "#ffb300" },
    ar: {
      name: "سُكّر", type: "مخبز حلويات", tagline: "تُخبز كل صباح في السابعة",
      headline: "قطعة صغيرة\nمن يوم سعيد.", lead: "كعك وحلويات بزبدة حقيقية، تُخبز صباحاً وتنفد قبل المساء.",
      cta: "اطلب علبة", cta2: "قائمة اليوم", nav: ["الحلويات", "المناسبات", "الفروع"],
      features: [["زبدة حقيقية", "لا زيوت مهدرجة أبداً."], ["علب مناسبات", "اختر القطع ونحن نغلّفها."], ["توصيل صباحي", "تصلك دافئة."]],
      stats: [["٤٠", "صنفاً"], ["٧ ص", "أول دفعة"], ["٣", "فروع"]],
      quote: "رائحة المخبز وحدها تستحق الزيارة.",
      idea: "الفرح لغة المنتج: وردي السكر، وأصفر الكراميل، ونقاط كحبيبات الزينة، وزوايا مستديرة كالكعك.",
      points: ["وردي وأصفر على خلفية فاتحة ناعمة", "خط مستدير ودود", "نقاط الزينة تتكرر كعلامة"],
    },
    en: {
      name: "Sukkar", type: "Pastry bakery", tagline: "BAKED EVERY MORNING AT SEVEN",
      headline: "A small piece\nof a good day.", lead: "Cakes and pastries made with real butter, baked in the morning and gone by evening.",
      cta: "Order a box", cta2: "Today's menu", nav: ["Pastries", "Occasions", "Shops"],
      features: [["Real butter", "Never hydrogenated oils."], ["Occasion boxes", "Pick the pieces, we wrap."], ["Morning delivery", "Arrives still warm."]],
      stats: [["40", "kinds"], ["7 am", "first batch"], ["3", "shops"]],
      quote: "The smell alone is worth the visit.",
      idea: "Joy is the product's language: sugar pink, caramel yellow, sprinkle dots, and corners as round as a cake.",
      points: ["Pink and yellow on a soft light ground", "A friendly rounded face", "Sprinkle dots recur as a mark"],
    },
  },
  {
    slug: "mizan",
    number: "13",
    category: "services",
    layout: "editorial",
    face: "serif",
    motif: "columns",
    radius: 2,
    palette: { bg: "#0f1a17", surface: "#172520", ink: "#efe8d9", muted: "#a59e8c", accent: "#c7a45b", accent2: "#efe8d9" },
    ar: {
      name: "ميزان", type: "مكتب محاماة واستشارات", tagline: "قانون الشركات والعقود",
      headline: "قرارات بثقة،\nوعقود بلا ثغرات.", lead: "نراجع عقودك ونؤسس شركتك ونرافقك في النزاع، بلغة تفهمها.",
      cta: "احجز استشارة", cta2: "مجالاتنا", nav: ["المجالات", "الفريق", "مقالات"],
      features: [["تأسيس الشركات", "من الفكرة إلى السجل."], ["مراجعة العقود", "خلال ٤٨ ساعة."], ["تمثيل في النزاع", "أمام المحاكم والتحكيم."]],
      stats: [["٢٥", "سنة"], ["٩٠٠+", "عقد مُراجَع"], ["٤", "شركاء"]],
      quote: "شرحوا لي العقد سطراً سطراً قبل أن أوقّع.",
      idea: "الثقة تُبنى بالهدوء: أخضر زجاجي داكن كأغلفة المجلدات، وذهبي باهت للتفاصيل، وأعمدة كواجهات المحاكم.",
      points: ["أخضر داكن وذهبي، بلا أي لون صاخب", "خط بزوائد ومسافات تحريرية واسعة", "خطوط رفيعة بدل الظلال"],
    },
    en: {
      name: "Mizan", type: "Law firm", tagline: "CORPORATE AND CONTRACT LAW",
      headline: "Decide with confidence.\nSign without gaps.", lead: "We review your contracts, set up your company and stand by you in disputes, in words you understand.",
      cta: "Book a consultation", cta2: "Practice areas", nav: ["Practice", "Team", "Insights"],
      features: [["Company formation", "From idea to registry."], ["Contract review", "Within 48 hours."], ["Dispute representation", "Courts and arbitration."]],
      stats: [["25", "years"], ["900+", "contracts reviewed"], ["4", "partners"]],
      quote: "They explained the contract line by line before I signed.",
      idea: "Trust is built with calm: a dark bottle green like case binders, muted gold for detail, and columns like a courthouse front.",
      points: ["Dark green and gold, nothing loud", "A serif and wide editorial spacing", "Hairlines instead of shadows"],
    },
  },
  {
    slug: "darb",
    number: "14",
    category: "services",
    layout: "split",
    face: "grotesk",
    motif: "route",
    radius: 10,
    palette: { bg: "#f5f6fa", surface: "#ffffff", ink: "#10162f", muted: "#586081", accent: "#ff6a00", accent2: "#10162f" },
    ar: {
      name: "درب", type: "شركة توصيل وشحن", tagline: "توصيل في نفس اليوم",
      headline: "طردك على الطريق.\nوتعرف أين بالضبط.", lead: "تتبّع مباشر على الخريطة، وسائق تتواصل معه، وتسليم في نافذة ساعة واحدة.",
      cta: "أرسل طرداً", cta2: "تتبّع شحنة", nav: ["للأفراد", "للمتاجر", "الأسعار"],
      features: [["تتبّع حي", "الطرد على الخريطة لحظة بلحظة."], ["نافذة ساعة", "تختار ساعة التسليم."], ["ربط للمتاجر", "API لطلبات متجرك."]],
      stats: [["٤ س", "متوسط التسليم"], ["١١", "مدينة"], ["٩٩٫٢٪", "تسليم في الموعد"]],
      quote: "عرفت أن الطرد وصل قبل أن يرن الجرس.",
      idea: "السرعة والوضوح: برتقالي السلامة على كحلي الطريق، ومسار متقطّع يرسم الرحلة من المستودع إلى الباب.",
      points: ["برتقالي واحد لكل ما يتحرّك", "المسار المتقطّع علامة الهوية", "خط هندسي واضح للأرقام والعناوين"],
    },
    en: {
      name: "Darb", type: "Courier and shipping", tagline: "SAME-DAY DELIVERY",
      headline: "Your parcel is on its way.\nYou know exactly where.", lead: "Live tracking on a map, a driver you can message, and delivery in a one-hour window.",
      cta: "Send a parcel", cta2: "Track a shipment", nav: ["Personal", "For stores", "Pricing"],
      features: [["Live tracking", "Your parcel on the map, live."], ["One-hour window", "You choose the hour."], ["Store integration", "An API for your shop's orders."]],
      stats: [["4 h", "average delivery"], ["11", "cities"], ["99.2%", "on time"]],
      quote: "I knew the parcel arrived before the doorbell rang.",
      idea: "Speed and clarity: safety orange on road navy, and a dashed route that draws the journey from warehouse to door.",
      points: ["One orange for everything that moves", "The dashed route is the identity's mark", "A clear geometric face for numbers"],
    },
  },
  {
    slug: "nour",
    number: "15",
    category: "tech",
    layout: "bento",
    face: "grotesk",
    motif: "rays",
    radius: 16,
    palette: { bg: "#fffbea", surface: "#ffffff", ink: "#1b2a1b", muted: "#5d6d50", accent: "#f2b000", accent2: "#2e7d32" },
    ar: {
      name: "نور", type: "طاقة شمسية للبيوت", tagline: "كهرباء من سطح بيتك",
      headline: "الشمس تشرق\nعلى فاتورتك أيضاً.", lead: "ألواح وبطاريات تُركَّب في يومين، وتطبيق يريك كم وفّرت اليوم.",
      cta: "احسب توفيرك", cta2: "كيف يعمل", nav: ["للبيوت", "للمزارع", "التمويل"],
      features: [["تركيب في يومين", "من المعاينة إلى التشغيل."], ["بطارية ليلية", "كهرباء بعد الغروب."], ["تطبيق التوفير", "إنتاجك واستهلاكك مباشرة."]],
      stats: [["٧٠٪", "توفير متوسط"], ["٤ سنوات", "استرداد التكلفة"], ["٢٥", "سنة ضمان"]],
      quote: "لم تنقطع الكهرباء عندنا منذ الصيف الماضي.",
      idea: "الطاقة النظيفة متفائلة لا تقنية باردة: أصفر الشمس وأخضر النبات على أبيض دافئ، وأشعة تنطلق من الزاوية.",
      points: ["أصفر مشمس وأخضر نمو", "بطاقات بنتو للأرقام التي تهم البيت", "أشعة متحركة كعلامة للطاقة"],
    },
    en: {
      name: "Nour", type: "Home solar energy", tagline: "POWER FROM YOUR OWN ROOF",
      headline: "The sun rises\non your bill too.", lead: "Panels and batteries installed in two days, and an app that shows what you saved today.",
      cta: "Estimate your saving", cta2: "How it works", nav: ["Homes", "Farms", "Financing"],
      features: [["Two-day install", "From survey to switch-on."], ["Night battery", "Power after sunset."], ["Savings app", "Production and use, live."]],
      stats: [["70%", "average saving"], ["4 yrs", "payback"], ["25", "year warranty"]],
      quote: "We haven't lost power since last summer.",
      idea: "Clean energy is optimistic, not cold tech: sun yellow and leaf green on warm white, with rays fanning from a corner.",
      points: ["Sunny yellow and growing green", "Bento tiles for the numbers a home cares about", "Rays as the energy mark"],
    },
  },
  {
    slug: "hirfa",
    number: "16",
    category: "culture",
    layout: "center",
    face: "serif",
    motif: "stitch",
    radius: 6,
    palette: { bg: "#faf2e8", surface: "#ffffff", ink: "#2a1919", muted: "#7a5d56", accent: "#b21f2d", accent2: "#1e4c39" },
    ar: {
      name: "حِرفة", type: "سوق للتطريز الفلسطيني", tagline: "صُنع باليد في القرى",
      headline: "غرزة بعد غرزة،\nحكاية بعد حكاية.", lead: "أثواب وحقائب ومفارش مطرّزة، يذهب ثمنها مباشرة إلى النساء اللواتي صنعنها.",
      cta: "تسوّق القطع", cta2: "تعرّف على الحرفيات", nav: ["المتجر", "الحرفيات", "الغُرز"],
      features: [["من الصانعة إليك", "٧٠٪ من الثمن لها."], ["غرزة موثّقة", "اسم النقشة وقريتها."], ["طلب خاص", "ثوب بمقاسك ونقشتك."]],
      stats: [["٦٠", "حرفية"], ["١٤", "قرية"], ["٢٠٠+", "نقشة"]],
      quote: "لبست ثوب جدتي بنقشته نفسها.",
      idea: "التطريز شبكة من المربعات، فصارت الغرزة المتصالبة وحدة التصميم كلها: أحمر الخيط وأخضر الزيتون على قماش كتاني.",
      points: ["أحمر التطريز وأخضر الزيتون على لون الكتان", "نقش الغرزة المتصالبة علامة وخلفية", "ذكر اسم الحرفية مع كل قطعة"],
    },
    en: {
      name: "Hirfa", type: "Palestinian embroidery market", tagline: "HANDMADE IN THE VILLAGES",
      headline: "Stitch by stitch,\nstory by story.", lead: "Embroidered dresses, bags and runners, with the price going straight to the women who made them.",
      cta: "Shop the pieces", cta2: "Meet the makers", nav: ["Shop", "Makers", "Stitches"],
      features: [["Maker to you", "70% of the price is hers."], ["Named stitch", "The pattern and its village."], ["Made to order", "Your size, your pattern."]],
      stats: [["60", "makers"], ["14", "villages"], ["200+", "patterns"]],
      quote: "I wore my grandmother's dress in her very pattern.",
      idea: "Embroidery is a grid of squares, so the cross-stitch became the whole design unit: thread red and olive green on linen.",
      points: ["Embroidery red and olive on linen", "The cross-stitch as mark and background", "Every piece carries its maker's name"],
    },
  },
  {
    slug: "taallam",
    number: "17",
    category: "tech",
    layout: "bento",
    face: "rounded",
    motif: "grid",
    radius: 20,
    palette: { bg: "#f2f5ff", surface: "#ffffff", ink: "#141b3a", muted: "#59628e", accent: "#4f46e5", accent2: "#22c55e" },
    ar: {
      name: "تعلّم", type: "منصة دروس برمجة", tagline: "برمجة بالعربية، خطوة خطوة",
      headline: "أول سطر كود\nأسهل مما تظن.", lead: "دروس قصيرة تكتب فيها الكود داخل المتصفح، ومشروع حقيقي في آخر كل مسار.",
      cta: "ابدأ مجاناً", cta2: "المسارات", nav: ["المسارات", "المشاريع", "المجتمع"],
      features: [["اكتب في المتصفح", "بلا تثبيت أي برنامج."], ["مشروع لكل مسار", "تبنيه وتعرضه."], ["مرشد يراجع", "ملاحظات على كودك."]],
      stats: [["٤٥", "مساراً"], ["٥ د", "لكل درس"], ["١٨ ألف", "متعلّم"]],
      quote: "بنيت أول موقع لي في ثلاثة أسابيع.",
      idea: "التعلم يحتاج شعوراً بالتقدم: نيلي للتركيز وأخضر للإنجاز، وشبكة مربعات كدفتر الرياضيات، وزوايا ناعمة تشجع.",
      points: ["أخضر يظهر فقط عند الإنجاز", "شبكة الدفتر خلفية لكل شيء", "بطاقات بنتو للمسارات والتقدم"],
    },
    en: {
      name: "Taallam", type: "Coding lessons platform", tagline: "LEARN TO CODE, STEP BY STEP",
      headline: "Your first line of code\nis easier than you think.", lead: "Short lessons where you write code in the browser, and a real project at the end of every path.",
      cta: "Start free", cta2: "Paths", nav: ["Paths", "Projects", "Community"],
      features: [["Code in the browser", "Nothing to install."], ["A project per path", "Build it and show it."], ["Mentor review", "Notes on your code."]],
      stats: [["45", "paths"], ["5 min", "per lesson"], ["18k", "learners"]],
      quote: "I built my first website in three weeks.",
      idea: "Learning needs a sense of progress: indigo for focus and green for achievement, a squared-notebook grid, and soft, encouraging corners.",
      points: ["Green appears only on achievement", "The notebook grid under everything", "Bento tiles for paths and progress"],
    },
  },
  {
    slug: "layl",
    number: "18",
    category: "culture",
    layout: "poster",
    face: "condensed",
    motif: "sound",
    radius: 999,
    palette: { bg: "#07070d", surface: "#13131f", ink: "#f4f2ff", muted: "#9b98b8", accent: "#b04dff", accent2: "#2ee5d5" },
    ar: {
      name: "ليل", type: "مهرجان موسيقى مستقلة", tagline: "ثلاث ليالٍ · أيلول ٢٠٢٦",
      headline: "الموسيقى تبدأ\nحين تنطفئ المدينة.", lead: "ثلاثون فرقة مستقلة على ثلاثة مسارح تحت السماء، من الغروب حتى الفجر.",
      cta: "احجز تذكرتك", cta2: "البرنامج", nav: ["البرنامج", "الفرق", "التذاكر"],
      features: [["ثلاثة مسارح", "صاخب، وهادئ، وتجريبي."], ["ليالٍ كاملة", "من الغروب حتى الفجر."], ["فرق محلية", "نصف البرنامج من هنا."]],
      stats: [["٣٠", "فرقة"], ["٣", "ليالٍ"], ["٥٠٠٠", "تذكرة"]],
      quote: "أجمل ثلاث ليالٍ في السنة.",
      idea: "الليل والضوء: أسود عميق، وبنفسجي وفيروزي كأضواء المسرح، وموجات صوتية تنبض كأنها تسمع.",
      points: ["ألوان النيون على الأسود فقط", "عنوان ضيق ضخم بطول الشاشة", "موجات الصوت عنصر متحرك"],
    },
    en: {
      name: "Layl", type: "Independent music festival", tagline: "THREE NIGHTS · SEPTEMBER 2026",
      headline: "The music starts\nwhen the city goes dark.", lead: "Thirty independent bands on three open-air stages, from sunset to dawn.",
      cta: "Get tickets", cta2: "Line-up", nav: ["Line-up", "Bands", "Tickets"],
      features: [["Three stages", "Loud, quiet and experimental."], ["Whole nights", "Sunset to dawn."], ["Local bands", "Half the bill is from here."]],
      stats: [["30", "bands"], ["3", "nights"], ["5,000", "tickets"]],
      quote: "The best three nights of the year.",
      idea: "Night and light: deep black, violet and turquoise like stage lights, and sound waves that pulse as if listening.",
      points: ["Neon colours on black only", "A huge condensed headline across the screen", "Sound waves as a moving element"],
    },
  },
  {
    slug: "fann",
    number: "19",
    category: "culture",
    layout: "editorial",
    face: "grotesk",
    motif: "frames",
    radius: 0,
    palette: { bg: "#ffffff", surface: "#f3f3f3", ink: "#0a0a0a", muted: "#666666", accent: "#0a0a0a", accent2: "#ff4a00" },
    ar: {
      name: "فن", type: "صالة عرض معاصرة", tagline: "المعرض الحالي حتى ٣٠ تشرين",
      headline: "انظر أطول.\nترَ أكثر.", lead: "معارض لفنانين شباب من المنطقة، بدخول مجاني، ودليل قصير لكل عمل.",
      cta: "المعرض الحالي", cta2: "الفنانون", nav: ["المعارض", "الفنانون", "زيارة"],
      features: [["دخول مجاني", "كل يوم عدا الإثنين."], ["دليل لكل عمل", "دقيقة قراءة بجانبه."], ["اقتناء", "الأعمال متاحة للبيع."]],
      stats: [["٨", "معارض بالسنة"], ["٤٠", "فناناً"], ["٠", "رسوم دخول"]],
      quote: "مكان يجعلك تبطئ.",
      idea: "الصالة يجب أن تختفي ليظهر الفن: أبيض وأسود تماماً، وإطارات رقيقة، ولون برتقالي واحد يشير إلى ما هو جديد.",
      points: ["أبيض وأسود، وبرتقالي واحد للجديد", "مساحات فارغة سخية حول كل عمل", "إطارات رقيقة بدل البطاقات"],
    },
    en: {
      name: "Fann", type: "Contemporary gallery", tagline: "CURRENT SHOW UNTIL 30 OCTOBER",
      headline: "Look longer.\nSee more.", lead: "Shows by young artists from the region, free to enter, with a short guide beside every work.",
      cta: "Current show", cta2: "Artists", nav: ["Exhibitions", "Artists", "Visit"],
      features: [["Free entry", "Every day but Monday."], ["A guide per work", "A minute's read beside it."], ["Collect", "Works are for sale."]],
      stats: [["8", "shows a year"], ["40", "artists"], ["0", "entry fee"]],
      quote: "A place that makes you slow down.",
      idea: "A gallery should disappear so the art appears: pure black and white, thin frames, and one orange that points at what is new.",
      points: ["Black and white, one orange for the new", "Generous empty space around each work", "Thin frames instead of cards"],
    },
  },
  {
    slug: "bahr",
    number: "20",
    category: "food",
    layout: "split",
    face: "serif",
    motif: "waves",
    radius: 999,
    palette: { bg: "#e8f3f3", surface: "#ffffff", ink: "#0b3140", muted: "#4a6a74", accent: "#0b6d88", accent2: "#ff7d4d" },
    ar: {
      name: "بحر", type: "مطعم مأكولات بحرية", tagline: "صيد اليوم · ميناء غزة",
      headline: "من الشبكة\nإلى الشواية.", lead: "سمك يصل كل صباح من قوارب الصيادين، ويُشوى أمامك بزيت وليمون وملح بحر.",
      cta: "احجز طاولة", cta2: "صيد اليوم", nav: ["القائمة", "الصيادون", "الحجز"],
      features: [["صيد اليوم", "القائمة تتغير مع البحر."], ["شواء مفتوح", "تختار سمكتك وتراها تُشوى."], ["طاولات الغروب", "على الشرفة المطلة."]],
      stats: [["٥ ص", "وصول القوارب"], ["١٢", "صنفاً اليوم"], ["٤٠", "طاولة"]],
      quote: "أطيب سمك أكلته في حياتي، وأبسطه.",
      idea: "البحر هو المطبخ: أزرق عميق وأخضر مائي، وبرتقالي المرجان للأزرار، وموجات هادئة كشاطئ في الصباح.",
      points: ["أزرق بحري وبرتقالي مرجاني", "موجات متكررة تفصل الأقسام", "خط بزوائد للقائمة كطباشير المطعم"],
    },
    en: {
      name: "Bahr", type: "Seafood restaurant", tagline: "TODAY'S CATCH · GAZA PORT",
      headline: "From the net\nto the grill.", lead: "Fish from the fishermen's boats every morning, grilled in front of you with oil, lemon and sea salt.",
      cta: "Book a table", cta2: "Today's catch", nav: ["Menu", "Fishermen", "Booking"],
      features: [["Today's catch", "The menu changes with the sea."], ["Open grill", "Choose your fish, watch it cook."], ["Sunset tables", "On the terrace."]],
      stats: [["5 am", "boats arrive"], ["12", "fish today"], ["40", "tables"]],
      quote: "The best fish I've eaten, and the simplest.",
      idea: "The sea is the kitchen: deep blue and water green, coral orange for buttons, and calm waves like a beach in the morning.",
      points: ["Sea blue and coral orange", "Repeating waves divide the sections", "A serif menu, like the chalkboard"],
    },
  },
];

/** Black or white, whichever reads better on `hex`. */
export function readableOn(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
  return luminance > 0.36 ? "#111111" : "#ffffff";
}

export function getStudy(slug: string) {
  return studies.find(study => study.slug === slug);
}

/** The three original studies keep their own pages under /work. They join the
 *  gallery under the same categories. */
export const originalCategories: Record<string, Category> = {
  finjan: "food",
  forma: "places",
  madar: "money",
};
