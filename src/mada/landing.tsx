"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import s from "./landing.module.css";

function Icon({ name, size = 20 }: { name: "arrow" | "check" | "grid" | "clock" | "people" | "plus" | "menu" | "close" | "layers" | "play" | "pause" | "shield" | "chart"; size?: number }) {
  const paths = {
    arrow: <><path d="M19 12H5m6-6-6 6 6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 4v2" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    layers: <><path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5" /></>,
    play: <path d="m9 5 11 7-11 7Z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6Z" /><path d="m8 12 3 3 5-6" /></>,
    chart: <><path d="M4 3v17h17M8 15l4-5 4 2 5-7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Brand({ light = false }: { light?: boolean }) {
  return <span className={`${s.brand} ${light ? s.brandLight : ""}`}><svg width="34" height="34" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M7 49V26c0-12 15-17 22-6l3 5 3-5c7-11 22-6 22 6v23H44V28L32 46 20 28v21Z" fill="currentColor" /></svg><strong>مدى</strong><span className={s.brandLatin}>mada</span></span>;
}

const previewTasks = [
  { title: "تصميم تجربة الانضمام", tag: "تجربة المستخدم", person: "س", color: "blue", checked: false },
  { title: "مراجعة الهوية البصرية", tag: "تصميم", person: "ن", color: "rose", checked: false },
  { title: "تجهيز خطة الإطلاق", tag: "تسويق", person: "ع", color: "green", checked: true },
];

function HeroScene({ progress, still }: { progress: ReturnType<typeof useScroll>["scrollYProgress"]; still: boolean }) {
  const rotateX = useTransform(progress, [0, 0.75], [10, 0]);
  const rotateY = useTransform(progress, [0, 0.75], [-15, 0]);
  const rotateZ = useTransform(progress, [0, 0.75], [-7, 0]);
  const topY = useTransform(progress, [0, 0.75], [-35, 25]);
  const bottomY = useTransform(progress, [0, 0.75], [40, -15]);
  const scale = useTransform(progress, [0, 0.75], [1, 1.04]);
  return (
    <div className={s.scene} aria-label="مشهد توضيحي يجمع المشروع والمهام والفريق في مساحة واحدة">
      <div className={s.sceneOrbit} /><div className={s.sceneOrbitSmall} /><div className={s.sceneAxis} />
      <motion.div className={s.sceneBoard} style={still ? undefined : { rotateX, rotateY, rotateZ, scale }}>
        <div className={s.sceneBoardTop}><span className={s.sceneAppMark}><Icon name="layers" size={18} /></span><b>إطلاق منصة مدى</b><span className={s.sceneBoardDots}>•••</span></div>
        <div className={s.sceneBoardBody}>
          <div className={s.sceneProjectHeading}><span>من الفكرة إلى الإطلاق</span><span className={s.sceneTag}>قيد التنفيذ</span></div>
          <div className={s.sceneProgress}><span /></div>
          <div className={s.sceneProgressLabels}><span>تقدّم المشروع</span><bdi>75%</bdi></div>
          <div className={s.sceneTask}><span className={s.smallCheck}><Icon name="check" size={13} /></span><span>تحديد أهداف المشروع</span><span className={`${s.avatar} ${s.avatarBlue}`}>س</span></div>
          <div className={s.sceneTask}><span className={s.smallCheck}><Icon name="check" size={13} /></span><span>تصميم تجربة المستخدم</span><span className={`${s.avatar} ${s.avatarRose}`}>ن</span></div>
          <div className={s.sceneTask}><span className={s.smallCircle} /><span>مراجعة النسخة الأولى</span><span className={`${s.avatar} ${s.avatarGreen}`}>ع</span></div>
          <div className={s.sceneBoardFoot}><span><Icon name="clock" size={14} /> موعد واضح. خطوة أقرب.</span><span className={s.miniAvatars}><i>س</i><i>ن</i><i>ع</i></span></div>
        </div>
      </motion.div>
      <motion.div className={`${s.floatingCard} ${s.floatingTeam}`} style={still ? undefined : { y: topY }}><span className={s.floatIcon}><Icon name="people" /></span><div><b>فريقك، على نفس الصفحة</b><span>كل دور له صاحب. وكل فكرة لها مكان.</span></div><span className={s.teamOnline} /></motion.div>
      <motion.div className={`${s.floatingCard} ${s.floatingDone}`} style={still ? undefined : { y: bottomY }}><span className={s.doneIcon}><Icon name="check" size={22} /></span><div><b>خطوة جديدة، اكتملت.</b><span>من قائمة المهام إلى قائمة الإنجازات</span></div><span className={s.confetti}>✦</span></motion.div>
      <span className={s.sceneCaption}>تصوّر توضيحي لمساحة العمل</span>
    </div>
  );
}

function ProductPreview() {
  const [view, setView] = useState("board");
  const [tasks, setTasks] = useState(previewTasks);
  const done = tasks.filter(task => task.checked).length;
  return (
    <div className={s.productWindow}>
      <div className={s.windowBar}><div className={s.windowDots}><i /><i /><i /></div><span dir="ltr">mada / workspace</span><span className={s.previewLabel}>جرّب العرض التفاعلي</span></div>
      <div className={s.productInner}>
        <aside className={s.previewSidebar}><Brand /><div className={s.previewWorkspace}><span className={s.workspaceMark}>م</span><span>مساحة فريق مدى<small>مشروع توضيحي</small></span></div><span className={s.previewNavActive}><Icon name="grid" size={17} /> نظرة عامة</span><span className={s.previewNav}><Icon name="layers" size={17} /> المشاريع</span><span className={s.previewNav}><Icon name="check" size={17} /> مهامي</span><span className={s.previewNav}><Icon name="people" size={17} /> الفريق</span><div className={s.previewSidebarBottom}>مساحة للأفكار الكبيرة.</div></aside>
        <div className={s.previewMain}>
          <div className={s.previewBreadcrumb}>المشاريع <span>/</span> إطلاق الهوية الجديدة</div>
          <div className={s.previewTitle}><div><h3>الأفكار الجيدة، تستحق أن تكتمل.</h3><p>كل ما نحتاجه لإطلاق هويتنا الجديدة.</p></div><span className={s.miniAvatars}><i>س</i><i>ن</i><i>ع</i></span></div>
          <div className={s.previewTabs} role="tablist" aria-label="طريقة عرض المشروع">
            {[{ id: "board", text: "لوحة المهام", icon: "grid" }, { id: "timeline", text: "الجدول الزمني", icon: "clock" }, { id: "overview", text: "التقدّم", icon: "chart" }].map(tab => <button key={tab.id} id={`preview-tab-${tab.id}`} aria-controls="preview-panel" role="tab" aria-selected={view === tab.id} onClick={() => setView(tab.id)} className={view === tab.id ? s.tabActive : ""}><Icon name={tab.icon as "grid" | "clock" | "chart"} size={16} />{tab.text}</button>)}
          </div>
          <div id="preview-panel" role="tabpanel" aria-labelledby={`preview-tab-${view}`} className={s.previewPanel}>
            {view === "board" && <div className={s.kanbanPreview}>
              <div><div className={s.columnHead}><span><i />لنعمل عليها</span><bdi>{tasks.length - done}</bdi></div>{tasks.filter(task => !task.checked).map(task => <div className={s.previewTaskCard} key={task.title}><span className={`${s.taskTag} ${task.color === "rose" ? s.tagRose : ""}`}>{task.tag}</span><h4>{task.title}</h4><div><button className={s.completeTask} aria-label={`إكمال ${task.title}`} onClick={() => setTasks(tasks.map(item => item.title === task.title ? { ...item, checked: true } : item))}><span className={s.smallCircle} /> إكمال المهمة</button><span className={`${s.avatar} ${task.color === "rose" ? s.avatarRose : s.avatarBlue}`}>{task.person}</span></div></div>)}{done === tasks.length && <p className={s.columnEmpty}>كل المهام اكتملت.</p>}</div>
              <div><div className={s.columnHead}><span><i className={s.dotGreen} />اكتملت</span><bdi>{done}</bdi></div>{tasks.filter(task => task.checked).map(task => <div className={`${s.previewTaskCard} ${s.completedCard}`} key={task.title}><span className={`${s.taskTag} ${s.tagGreen}`}>{task.tag}</span><h4>{task.title}</h4><div><button className={s.completeTask} aria-label={`إعادة فتح ${task.title}`} onClick={() => setTasks(tasks.map(item => item.title === task.title ? { ...item, checked: false } : item))}><span className={s.smallCheck}><Icon name="check" size={12} /></span> مكتملة</button><span className={`${s.avatar} ${s.avatarGreen}`}>{task.person}</span></div></div>)}</div>
            </div>}
            {view === "timeline" && <div className={s.timelinePreview}><div className={s.timelineWeeks}><span>الأسبوع الأول</span><span>الأسبوع الثاني</span><span>الأسبوع الثالث</span></div>{tasks.map((task, i) => <div className={s.timelineRow} key={task.title}><span>{task.title}</span><div className={s.timelineTrack}><span style={{ marginInlineStart: `${i * 20}%`, width: `${60 - i * 10}%` }}>{task.checked ? "مكتملة" : "قيد التخطيط"}</span></div></div>)}<p>عرض تخطيطي لتسلسل العمل، لا تواريخ فعلية.</p></div>}
            {view === "overview" && <div className={s.overviewPreview}><div className={s.progressRing} style={{ background: `conic-gradient(#2854de ${done / tasks.length * 360}deg, #e7ecf7 0deg)` }}><span><bdi>{Math.round(done / tasks.length * 100)}%</bdi><small>مكتمل</small></span></div><div><h4>خطوة بخطوة، الصورة تكتمل.</h4><p>أنجزت {done} من {tasks.length} مهام في هذا العرض.</p><button onClick={() => { setTasks(previewTasks); setView("board"); }}>إعادة تجربة المهام <Icon name="arrow" size={17} /></button></div></div>}
          </div>
          <div className={s.previewFooter}><Icon name="shield" size={14} /><span>هذا عرض تفاعلي فقط. أنشئ مساحتك لحفظ العمل.</span><span aria-live="polite">{done} / {tasks.length} مكتمل</span></div>
        </div>
      </div>
    </div>
  );
}

const questions = [
  ["ما الذي يمكنني فعله في مدى؟", "يمكنك إنشاء مساحة عمل، وإضافة المشاريع والمهام، وتحديد الأولويات والمواعيد، وإسناد المهام إلى أعضاء دليل الفريق، ومتابعة الإنجاز من لوحة واحدة."],
  ["هل أحتاج إلى بطاقة بنكية؟", "لا. النسخة الحالية متاحة للتجربة دون بطاقة بنكية أو اشتراك مدفوع. لا توجد رسوم تلقائية أو عمليات دفع في هذه النسخة."],
  ["هل تحفظ المنصة مشاريعي؟", "نعم، تُحفظ بيانات الحسابات والمشاريع على خادم هذه النسخة، وليست في ذاكرة المتصفح. يمكنك العودة إليها باستخدام حسابك. مساحة التجربة منفصلة وتحتوي على أمثلة."],
  ["هل يستطيع أعضاء الفريق الدخول إلى مساحتي؟", "في النسخة الحالية، الأعضاء هم دليل لتنظيم المسؤوليات وإسناد المهام. إضافة عضو لا ترسل بريداً ولا تمنحه حساب دخول؛ الدعوات والتعاون متعدد المستخدمين ليست مفعّلة بعد."],
  ["هل تدعم مدى العربية والجوال؟", "صُممت مدى بالعربية ومن اليمين إلى اليسار، وتتكيف الواجهة مع الجوال والكمبيوتر. ويمكن تقليل الحركة البصرية من إعدادات جهازك أو من زر الحركة في بداية الصفحة."],
];

export function MadaLanding() {
  const hero = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const still = !!reducedMotion || paused;

  return (
    <div className={s.landing}>
      <a className={s.skipLink} href="#main">انتقل إلى المحتوى</a>
      <header className={s.header}>
        <div className={s.navInner}>
          <Link href="/mada" aria-label="مدى، الصفحة الرئيسية"><Brand /></Link>
          <nav className={`${s.navLinks} ${menuOpen ? s.navOpen : ""}`} aria-label="القائمة الرئيسية"><a onClick={() => setMenuOpen(false)} href="#platform">المنصة</a><a onClick={() => setMenuOpen(false)} href="#features">لماذا مدى؟</a><a onClick={() => setMenuOpen(false)} href="#start">البداية</a><a onClick={() => setMenuOpen(false)} href="#faq">الأسئلة الشائعة</a></nav>
          <div className={s.navActions}><Link className={s.loginLink} href="/mada/dashboard?mode=login">تسجيل الدخول</Link><Link className={s.navCta} href="/mada/dashboard?mode=signup">ابدأ مساحتك <Icon name="arrow" size={16} /></Link><button className={s.menuToggle} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button></div>
        </div>
      </header>

      <main id="main">
        <section className={s.hero} ref={hero}>
          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <span className={s.eyebrow}><span className={s.eyebrowMark}><Icon name="layers" size={14} /></span> مساحة واحدة. رؤية أبعد.</span>
              <h1>عملٌ يجمعكم.<br /><span>ومدى يأخذكم أبعد.</span></h1>
              <p>من أول فكرة إلى آخر إنجاز. اجمع مشاريعك، نظّم مهامك، وامنح فريقك وضوحاً يصنع الفرق.</p>
              <div className={s.heroActions}><Link className={s.heroCta} href="/mada/dashboard?mode=signup">ابدأ مساحتك <Icon name="arrow" /></Link><Link className={s.demoCta} href="/mada/dashboard?mode=demo"><span><Icon name="play" size={15} /></span>استكشف المنصة</Link></div>
            </div>
            <HeroScene progress={scrollYProgress} still={still} />
          </div>
          <div className={s.heroBaseline}><span>صُممت بالعربية. لتفكّر بطريقتك.</span><div className={s.baselineLine} /><button onClick={() => setPaused(!paused)} aria-pressed={paused} disabled={!!reducedMotion}><Icon name={still ? "play" : "pause"} size={13} />{reducedMotion ? "الحركة مخفّضة حسب جهازك" : paused ? "تشغيل الحركة" : "إيقاف الحركة"}</button></div>
        </section>

        <section className={s.principles} aria-label="ركائز منصة مدى"><span>أقل تشتّتاً.<br /><strong>أكثر إنجازاً.</strong></span><div><Icon name="layers" size={25} /><p>مشاريع منظّمة</p></div><div><Icon name="check" size={25} /><p>أولويات واضحة</p></div><div><Icon name="people" size={25} /><p>مسؤوليات محدّدة</p></div><div><Icon name="chart" size={25} /><p>تقدّم ملموس</p></div></section>

        <section className={s.platformSection} id="platform">
          <div className={s.sectionHeading}><span className={s.sectionKicker}>الصورة الكبيرة، والتفاصيل الصغيرة</span><h2>كل شيء في مكانه.<br />وأنت في قلب الصورة.</h2><p>انتقل من «أين وصلنا؟» إلى معرفة الخطوة التالية.<br />مساحة مرنة تجعل العمل واضحاً، من دون تعقيد.</p></div>
          <ProductPreview />
          <p className={s.previewHint}>اضغط على المهام وبدّل طرق العرض. الوضوح يبدأ بتجربة.</p>
        </section>

        <section className={s.featuresSection} id="features">
          <div className={s.featureIntro}><h2>مساحة تتّسع لطموحك.<br /><span>لا لقوائمك فقط.</span></h2><p>الأدوات الجيدة لا تضيف عملاً إلى يومك.<br />تترك لك مساحة للعمل الذي يستحق.</p></div>
          <div className={s.featureGrid}>
            <article className={`${s.featureCard} ${s.featureWide}`}><div><span className={s.featureIcon}><Icon name="layers" size={24} /></span><h3>من الفكرة، إلى خطة واضحة.</h3><p>أعطِ كل مشروع هدفاً، وكل مهمة أولوية.<br />التفاصيل مترابطة، والصورة دائماً أمامك.</p></div><div className={s.projectIllustration} aria-hidden="true"><div className={s.projectIllustrationTop}><span className={s.projectSymbol}>م</span><span>إطلاق الموقع الجديد<small>التصميم والتطوير</small></span><bdi>12</bdi></div><div className={s.projectMilestones}><span><i />الفكرة</span><span><i />التخطيط</span><span><i />التنفيذ</span><span><i />الإطلاق</span></div><div className={s.projectIllustrationTrack}><i /></div></div></article>
            <article className={s.featureCard}><span className={s.featureIcon}><Icon name="people" size={24} /></span><h3>الأشخاص خلف الإنجاز.</h3><p>دليل لفريقك، ومهام يعرف كل شخص دوره فيها. مسؤوليات واضحة، لا افتراضات.</p><div className={s.teamIllustration} aria-hidden="true"><span className={s.avatarBlue}>س<small>التصميم</small></span><span className={s.avatarRose}>ن<small>التطوير</small></span><span className={s.avatarGreen}>ع<small>التسويق</small></span></div></article>
            <article className={`${s.featureCard} ${s.progressFeature}`}><span className={s.featureIcon}><Icon name="chart" size={24} /></span><h3>شاهد أثر كل خطوة.</h3><p>نسبة الإنجاز تُحسب من مهامك الفعلية.<br />تعرف ما اكتمل، وما يحتاج انتباهك.</p><div className={s.miniChart} aria-hidden="true">{[28, 43, 37, 59, 53, 74, 89, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}<span>كل مهمة، تُحدث فرقاً.</span></div></article>
            <article className={`${s.featureCard} ${s.arabicFeature}`}><div><span className={s.featureIcon}><Icon name="grid" size={24} /></span><h3>بالعربية، من أول سطر.</h3><p>ليست ترجمة لواجهة أخرى.<br />تجربة تفهم اتجاهك، وتناسب شاشة يومك.</p></div><div className={s.arabicGlyph} aria-hidden="true">ض<span>تفاصيل تُشبهك.</span></div></article>
          </div>
        </section>

        <section className={s.startSection} id="start"><div className={s.startCopy}><span className={s.sectionKicker}>بداية بسيطة، وأفق واسع</span><h2>مشروعك القادم،<br />يبدأ من هنا.</h2><p>لا إعدادات طويلة. لا بطاقة بنكية.<br />مساحة فارغة تنتظر فكرتك الأولى.</p><Link className={s.startCta} href="/mada/dashboard?mode=signup">ابدأ مساحتك <span><Icon name="arrow" /></span></Link></div><ol className={s.steps}><li><span>01</span><div><h3>اصنع مساحة لفريقك</h3><p>أنشئ حسابك، واختر اسماً لمساحة العمل.</p></div></li><li><span>02</span><div><h3>ضع فكرتك على المسار</h3><p>أضف مشروعك الأول، وقسّمه إلى مهام واضحة.</p></div></li><li><span>03</span><div><h3>خذ الخطوة التالية</h3><p>حدّد المسؤوليات، وتابع ما يكتمل كل يوم.</p></div></li></ol></section>

        <section className={s.faqSection} id="faq"><div><h2>قبل أن تبدأ.</h2><p>إجابات واضحة، مثل مساحة عملك.</p></div><div className={s.faqList}>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span><Icon name="plus" size={18} /></span></summary><p>{answer}</p></details>)}</div></section>

        <section className={s.finalCta}><div className={s.finalOrbit} aria-hidden="true" /><Brand light /><h2>أفكارك تستحق<br /><span>مدى أبعد.</span></h2><Link href="/mada/dashboard?mode=signup">ابدأ مساحتك <Icon name="arrow" size={22} /></Link><p>مساحتك الأولى، دون رسوم في النسخة الحالية.</p></section>
      </main>

      <footer className={s.footer}><div className={s.footerTop}><div><Link href="/mada" aria-label="مدى، الصفحة الرئيسية"><Brand /></Link><p>مشاريعك، مهامك، وفريقك.<br />كلّها في مدى.</p></div><nav aria-label="روابط أسفل الصفحة"><a href="#platform">المنصة</a><a href="#features">لماذا مدى؟</a><a href="#faq">الأسئلة الشائعة</a><Link href="/mada/dashboard?mode=login">تسجيل الدخول</Link></nav><div className={s.footerNote}><Icon name="shield" size={18} /><p>بياناتك في مساحة مستقلة.<br />لا مدفوعات ولا رسائل بريد تلقائية.</p></div></div><div className={s.footerBottom}><span>© {new Date().getFullYear()} مدى. مساحة للعمل الذي يستحق.</span><span>صُنع ليفكّر معك. بالعربية.</span></div></footer>
    </div>
  );
}
