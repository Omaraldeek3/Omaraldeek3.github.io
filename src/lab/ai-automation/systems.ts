import type { Locale } from "@/content/locales";

type Text = Record<Locale, string>;
type List = Record<Locale, string[]>;

export type AutomationSystem = {
  /** Latin on purpose, like the station codes: it reads the same either way. */
  code: string;
  title: Text;
  summary: Text;
  /** The system's own path, in order. Drawn as a small animated line. */
  flow: List;
  /** How it works and why it exists, one fact per line. */
  details: List;
  /** When it runs, stated plainly. */
  cadence: Text;
  tags: string[];
};

/** The systems built around the Shorts factory. Each one is documented from
 *  its own source: every claim below names something that actually runs. */
export const systems: AutomationSystem[] = [
  {
    code: "LOOP",
    title: { ar: "حلقة التعلّم من الأرقام", en: "The learning loop" },
    summary: {
      ar: "ستة فيديوهات يومياً بلا قياس هي ستة تخمينات. هذا النظام يجمع أرقام كل فيديو ويعيدها إلى الكاتب صباح اليوم التالي.",
      en: "Six videos a day with nothing measured is six guesses a day. This system collects every video's numbers and hands them back to the writer the next morning.",
    },
    flow: {
      ar: ["جمع الإحصاءات", "نسبة البقاء", "بنك الافتتاحيات", "تقرير أسبوعي"],
      en: ["Collect stats", "Retention", "Hook bank", "Weekly report"],
    },
    details: {
      ar: [
        "يسحب المشاهدات ونسبة البقاء لكل فيديو من [YouTube Analytics] ويحفظها في ملف واحد.",
        "بنك الافتتاحيات يرتّب الجمل الأولى التي أبقت المشاهد أطول، ليقرأها الكاتب قبل أن يبدأ.",
        "رصد المنافسين: ما الذي ينتشر على قنوات أخرى خلال آخر ٤٨ ساعة، بالأرقام فقط.",
        "صوت الجمهور: سؤال تكرر ثلاث مرات في التعليقات هو فيديو جاهز بكلمات المشاهد نفسه.",
      ],
      en: [
        "Pulls views and retention for every video from YouTube Analytics into one file.",
        "The hook bank ranks the opening lines that kept people watching longest, for the writer to read first.",
        "Competitor watch: what is spreading on other channels in the last 48 hours, in numbers only.",
        "Audience voice: a question asked three times in the comments is a video with its hook already written.",
      ],
    },
    cadence: { ar: "كل يوم، وتقرير كل أسبوع", en: "Daily, with a weekly report" },
    tags: ["YouTube Analytics", "Python", "LLM"],
  },
  {
    code: "TOPICS",
    title: { ar: "محرّك المواضيع", en: "The topic engine" },
    summary: {
      ar: "المواضيع لا تنفد ولا تأتي بلا مصدر. محرّك يحصد ما يبحث عنه الناس، ويجلب حقائق لها مرجع يمكن الاستشهاد به.",
      en: "Topics that never run out and never arrive without a source. It harvests what people search for, and brings in facts with a citable reference.",
    },
    flow: {
      ar: ["ما يكتبه الناس", "حقائق بمصدر", "صياغة بصوت القناة", "جدول المواضيع"],
      en: ["What people type", "Sourced facts", "Channel voice", "Topic sheet"],
    },
    details: {
      ar: [
        "يحصد اقتراحات البحث التلقائية: ما يكتبه الناس فعلاً، وهو الشكل المناسب لقناة فضول.",
        "المسار الثاني يبدأ من حقيقة لها مصدر، ثم يعيد نموذج لغوي صياغتها بصوت القناة.",
        "كل فيديو يَعِد بالمصدر عند الطلب، وبوت يمرّ على التعليقات كل ساعة ويردّ على كلمة «مصدر» بالرابط.",
        "مخزون المواضيع الإنجليزية يتجدد تلقائياً كل صباح قبل أن ينفد.",
      ],
      en: [
        "Harvests search autocomplete: what people actually type, the right shape for a curiosity channel.",
        "A second path starts from a fact with a source, then a language model rewrites it in the channel's voice.",
        "Every video promises its source on request, and a bot reads the comments hourly and answers the word 'source' with the link.",
        "The English topic stock refills itself every morning before it can run dry.",
      ],
    },
    cadence: { ar: "كل صباح، والردود كل ساعة", en: "Every morning; replies hourly" },
    tags: ["Google Sheets", "LLM", "YouTube API"],
  },
  {
    code: "PUBLISH",
    title: { ar: "موزّع النشر", en: "The publisher" },
    summary: {
      ar: "فيديو واحد يخرج إلى أربع منصات، مرة واحدة فقط لكل منصة، حتى لو أعيد تشغيل الخطوة.",
      en: "One video goes out to four platforms, exactly once per platform, even when the step is run again.",
    },
    flow: {
      ar: ["فيديو معتمد", "YouTube", "TikTok", "Instagram · Facebook"],
      en: ["Approved video", "YouTube", "TikTok", "Instagram · Facebook"],
    },
    details: {
      ar: [
        "النشر متمنّع عن التكرار: إعادة تشغيل الخطوة لا تنشر الفيديو مرتين.",
        "خادم [OAuth] لتيك توك يعمل كخدمة [systemd] تعود وحدها بعد إعادة التشغيل، ومعه رافع احتياطي عبر [Playwright].",
        "رمز إنستغرام يتجدد تلقائياً قبل انتهاء صلاحيته.",
        "الفيديوهات المنشورة تُنقل إلى [Google Drive] حتى لا يمتلئ القرص، بصلاحية ترى فقط ما أنشأته هي.",
      ],
      en: [
        "Publishing is idempotent: running the step again never posts the same video twice.",
        "TikTok's OAuth server runs as a systemd service that comes back on its own after a reboot, with a Playwright uploader as a fallback.",
        "The Instagram token refreshes itself before it expires.",
        "Published videos move to Google Drive so the disk never fills, with a scope that can only see what it created.",
      ],
    },
    cadence: { ar: "بعد كل فيديو يُعتمد", en: "After every approved video" },
    tags: ["YouTube", "TikTok", "Instagram", "Facebook", "rclone"],
  },
  {
    code: "CHATOPS",
    title: { ar: "التحكّم من المحادثة", en: "Control from the chat" },
    summary: {
      ar: "أدير المصنع من تيليغرام: أراجع النصوص وأوافق على الفيديو وأعيد تشغيل صف معيّن، دون أن أفتح الخادم.",
      en: "I run the factory from Telegram: read the scripts, approve the video, rerun a single row, without opening the server.",
    },
    flow: {
      ar: ["رسالة موقّعة", "تحقّق من المالك", "أمر على الخادم", "ردّ بالنتيجة"],
      en: ["Signed message", "Owner check", "Command on the box", "Reply with result"],
    },
    details: {
      ar: [
        "[/quota] يعرض المتبقي من رصيد الصوت والنموذج اللغوي ومساحة القرص.",
        "[/retry] يعيد صفاً معيّناً إلى الانتظار ويشغّله، و [/render] يضيف موضوعاً ويرندره فوراً.",
        "مختبر النصوص ينشر بطاقة لكل نص: الافتتاحية، والأرقام التي يفحصها المدقق، وأسباب الرفض إن رُفض.",
        "مفتاح المالك وحده يُنفّذ الأوامر؛ لا وكيل ولا عضو ولا تفاعل.",
      ],
      en: [
        "/quota shows what is left of the voice credit, the language model credit and the disk.",
        "/retry puts one row back in the queue and runs it; /render adds a topic and renders it immediately.",
        "The script lab posts one card per script: the hook, the numbers the validator checks, and the reasons when it refuses.",
        "Only the owner's key can command. Not an agent, not a member, not a reaction.",
      ],
    },
    cadence: { ar: "عند الطلب", en: "On demand" },
    tags: ["Telegram", "n8n", "Docker"],
  },
  {
    code: "STORY",
    title: { ar: "خط القصص السينمائية", en: "The cinematic story line" },
    summary: {
      ar: "خط ثانٍ يصنع قصصاً مصوّرة: مشاهد مولّدة، ولقطات حقيقية، وتعليق صوتي، ثم مونتاج كامل بـ [ffmpeg].",
      en: "A second line for illustrated stories: generated scenes, real footage and narration, cut together with ffmpeg.",
    },
    flow: {
      ar: ["نص القصة", "مشاهد مولّدة", "لقطات وصوت", "مونتاج"],
      en: ["Story script", "Generated scenes", "Footage & voice", "Assembly"],
    },
    details: {
      ar: [
        "المشاهد تُولَّد بـ [FLUX] و [Veo]، واللقطات الحقيقية تُبحث تلقائياً في [Pexels].",
        "التعليق الصوتي بـ [ElevenLabs]، والتجميع كله بـ [ffmpeg] داخل حاوية الرندرة.",
        "قاعدة ثابتة: لا يُجمَّد إطار أبداً. مقطع خرج أقصر من المطلوب يوقف العمل بدل أن يُمدَّد.",
        "حزمة المشاهد تصل إلى تيليغرام للمراجعة قبل التجميع النهائي.",
      ],
      en: [
        "Scenes are generated with FLUX and Veo, and real footage is searched on Pexels automatically.",
        "Narration by ElevenLabs, and the whole assembly in ffmpeg inside the render container.",
        "One fixed rule: a frame is never frozen. A segment that comes out short stops the job instead of being stretched.",
        "The scene pack reaches Telegram for review before the final cut.",
      ],
    },
    cadence: { ar: "حسب الجدول", en: "On its own schedule" },
    tags: ["FLUX", "Veo", "Pexels", "ElevenLabs", "ffmpeg"],
  },
  {
    code: "QC",
    title: { ar: "بوابة الجودة والتكلفة", en: "The quality and cost gate" },
    summary: {
      ar: "لا يُطلب مني اعتماد فيديو قبل أن يُقاس: الصوت، والإطارات السوداء، والصمت، وكم كلّف.",
      en: "No video reaches me for approval before it is measured: loudness, black frames, silence, and what it cost.",
    },
    flow: {
      ar: ["فيديو جاهز", "قياس الصوت", "إطارات وصمت", "تكلفة الفيديو"],
      en: ["Finished video", "Loudness", "Frames & silence", "Cost per video"],
    },
    details: {
      ar: [
        "يقيس ارتفاع الصوت بمقياس [LUFS] ويكشف الإطارات السوداء والصمت الطويل.",
        "أول تشغيل وجد فيديو منشوراً عند [-23.4 LUFS]، والمنصات تطبّع قرب [-14]، فكان أخفض من غيره بوضوح.",
        "متتبّع التكلفة يحسب ما دُفع لكل فيديو، ويقول صراحة ما لم يمكن قياسه.",
        "سرعات الأصوات مقاسة بالتوليد الفعلي والتوقيت، لا تقديرات.",
      ],
      en: [
        "Measures loudness in LUFS and detects black frames and long silences.",
        "Its first run found a published video at -23.4 LUFS while platforms normalise near -14, so it played noticeably quieter.",
        "The cost tracker works out what each video cost, and says plainly what could not be measured.",
        "Voice speeds are measured by real synthesis and timing, not estimated.",
      ],
    },
    cadence: { ar: "على كل فيديو", en: "On every video" },
    tags: ["ffmpeg", "ebur128", "Python"],
  },
  {
    code: "OPS",
    title: { ar: "الحارس الليلي", en: "The night watch" },
    summary: {
      ar: "نظام يعمل وحده يحتاج من يلاحظ حين يتوقف. هذا الحارس يلاحظ خلال دقائق، ويحفظ نسخة من كل شيء كل ليلة.",
      en: "A system that runs alone needs something to notice when it stops. This one notices within minutes, and backs everything up every night.",
    },
    flow: {
      ar: ["مراقبة", "نبض يومي", "نسخ احتياطي مشفّر", "اختبار الاستعادة"],
      en: ["Watchdog", "Daily heartbeat", "Encrypted backup", "Restore test"],
    },
    details: {
      ar: [
        "المراقب يلاحظ خلال دقائق رندرة توقفت أو خدمة سقطت، ويبلّغ فقط: رندرة عالقة ورندرة بطيئة تبدوان متشابهتين، وإيقاف السليمة يكلّف فيديو.",
        "نسخ احتياطي مشفّر كل ليلة إلى خارج الخادم، والاستعادة مُختبَرة فعلياً في حاوية مؤقتة.",
        "فحص يومي يقارن الكود في المستودع بما يعمل على الخادم فعلاً.",
        "التنبيهات تصل إلى تيليغرام لي، وإلى [Buzz] حيث يقرؤها وكلاء الذكاء الاصطناعي ويبحثون في السبب.",
      ],
      en: [
        "The watchdog notices a stalled render or a fallen service within minutes, and only reports: a hung render and a slow one look alike, and killing a healthy one costs a video.",
        "An encrypted backup leaves the server every night, and the restore is actually tested in a temporary container.",
        "A daily check compares the code in the repository with what is really running on the server.",
        "Alerts reach me on Telegram, and Buzz, where AI agents read them and dig into the cause.",
      ],
    },
    cadence: { ar: "كل دقائق، وكل ليلة", en: "Every few minutes; nightly" },
    tags: ["systemd", "rclone", "Docker", "Buzz"],
  },
  {
    code: "PANEL",
    title: { ar: "لوحة التحكّم", en: "The control panel" },
    summary: {
      ar: "لوحة ويب محمية بكلمة مرور أختار منها الصوت والسرعة وأسلوب الإلقاء والموسيقى لكل خط، وأرى الأرصدة.",
      en: "A password-protected web panel where I pick the voice, speed, delivery style and music for each line, and see the balances.",
    },
    flow: {
      ar: ["اختيار الصوت", "السرعة والأسلوب", "الموسيقى", "بطاقات الأرصدة"],
      en: ["Voice", "Speed & style", "Music", "Balance cards"],
    },
    details: {
      ar: [
        "لكل خط، عربي وإنجليزي، صوته وسرعته وموسيقاه، والاختيار يُحفظ ويُقرأ في الرندرة التالية.",
        "بطاقات الأرصدة تتحدث عند فتح الصفحة؛ قراءة ناقصة تظهر «غير متاح»، لا رقماً قديماً بثقة.",
        "المدة المتوقعة لكل نص تُحسب من سرعة الصوت المختار، فيعرف المدقق إن كان النص أطول من اللازم.",
      ],
      en: [
        "Each line, Arabic and English, has its own voice, speed and music, saved and read by the next render.",
        "Balance cards refresh on page load; a missing reading shows 'unavailable', never an old number stated with confidence.",
        "Each script's expected length is worked out from the chosen voice's speed, so the validator knows when it runs long.",
      ],
    },
    cadence: { ar: "دائماً", en: "Always on" },
    tags: ["Python", "Caddy", "HTML"],
  },
];

/** Real counts for the page's header strip. */
export const automationFacts: { value: Text; label: Text }[] = [
  { value: { ar: "٩", en: "9" }, label: { ar: "أنظمة تعمل معاً", en: "systems working together" } },
  { value: { ar: "٦", en: "6" }, label: { ar: "فيديوهات كل يوم", en: "videos every day" } },
  { value: { ar: "٤", en: "4" }, label: { ar: "منصات نشر", en: "publishing platforms" } },
  { value: { ar: "٩٠+", en: "90+" }, label: { ar: "اختباراً آلياً", en: "automated tests" } },
];
