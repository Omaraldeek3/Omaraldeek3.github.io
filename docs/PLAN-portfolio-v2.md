# Plan: portfolio v2 — "The Cut Line / خط القصّ"

Status: **draft 2, for astra's closure review.**

- Brief: `docs/BRIEF-portfolio-v2.md`.
- Review addressed: `docs/REVIEW-astra-plan-v1.md` (all 8 points; the mapping is in §10).
- Branch: `portfolio-v2`. Never push `main`.

Facts in this plan come from these sources. Anything not listed there is not claimed.

- **Current site:** `src/content/site.ts`, `src/app/[locale]/page.tsx`, `src/components/*`.
- **Cut Studio:**
  - The tool names come from `src/toolkit/copy.ts` (`toolIds`, which lists 8 tools).
  - Behaviour comes from `docs/TOOLKIT.md`.
- **Shorts factory:** the brief, checked against these files in `claude home`:
  - `CLAUDE.md`;
  - `PROGRESS.md` §7.6.

  Those are repository documents. Nobody inspected live production for this plan.

**Editorial constraints.** These bind the authors. They are **not** visitor copy.

- No invented clients, awards, years or metrics.
- No fake logs, counters, views, uptime or earnings anywhere on the page.
- No model names beyond "language model".
- No numeric claims about the factory.

---

## 1. Concept

**The page is one sheet on a laser bed, and one red cut line runs through it.**

Omar's three crafts share a single idea. A design becomes a path, code becomes a path, and an automation becomes a path that runs by itself. The page makes that literal.

- One continuous **laser-red line** (`--cut`) runs down the page.
- It outlines the hero and draws the hairlines of the three "layers".
- It is the factory's track.
- It cuts the finger-joint box in Cut Studio.
- It cuts the footer signature free.
- Colours follow the machine convention that Cut Studio already uses: **red for cut, blue for engrave**.

**Restraint rule.** Registration marks and coordinates appear **only in the hero and the footer**. Everywhere else, the only carrier of the metaphor is the line itself, so it does not bury the work. In the Cut Studio band, the box drawing is the main visual evidence.

The home page does not load `three`. It stays where it already earns its place, the Cut Studio box preview. The page uses SVG and CSS only, which keeps LCP and 375px safe.

## 2. Visual system

The tokens are defined **on the home-page wrapper `.v2`**, not on `:root`. See §6 on scope.

| Token | Value | Use |
|---|---|---|
| `--sheet` | `#0e0e0d` | background (black acrylic) |
| `--paper` | `#ece7dc` | primary text, the Cut Studio band |
| `--muted` | `#9a958b` | secondary text on `--sheet` |
| `--cut` | `#ff3d1f` | the line, the primary CTA fill, focus ring on `--sheet` |
| `--engrave` | `#3d7bff` | decorative annotations only; never text on `--paper` |

**Contrast pairs.** These are computed with the WCAG formula from the hex values above. They are not browser-measured; deepseek re-measures them in §7.

| Pair | Ratio | Rule that follows |
|---|---|---|
| `--sheet` text on `--cut` fill | 5.46 | **CTA text on red is `--sheet`, never `--paper`** |
| `--paper` on `--cut` | 2.87 | fails, forbidden for text |
| `--muted` on `--sheet` | 6.48 | OK for body text |
| `--engrave` on `--sheet` | 5.04 | OK for small tags on dark |
| `--engrave` on `--paper` | 3.11 | decoration only, no text |
| `--cut` on `--paper` | 2.87 | **fails 3:1** |
| `--sheet` on `--paper` | 15.66 | text inside the Cut Studio band |

Because `--cut` on `--paper` fails 3:1, **the focus ring inside the Cut Studio band is `--sheet`**, and red lines there are decoration only.

**Type.**

- Latin display: Manrope 800, `letter-spacing: -0.04em`.
- Arabic display: Tajawal 700 with **`letter-spacing: normal`**. Line-height is at least 1.25, so tashkeel and descenders are never clipped. No `overflow: hidden` on heading lines.
- Body: Manrope 400/500 and Tajawal 400/500.
- Mono (`ui-monospace, "SFMono-Regular", Menlo, monospace`) is used **only for Latin-only chrome**: indices (`01`), layer tags (`LAYER 01 · CODE`) and tool tags (`n8n`). Arabic text is never set in mono.
- Embedded Latin inside Arabic sentences (`Next.js`, `MoneyPrinterTurbo`, `Cut Studio`) is wrapped in `<bdi>`, or in `<span dir="ltr">` for tags, so punctuation does not jump.
- No new font. The English page must not download the Arabic font (the existing test stays).

**Grain.** An inline SVG `feTurbulence` at 4% opacity on **`.v2::before`**, not on `body`. No image request.

## 3. Navigation (shared with `/work/[slug]`)

`Navigation` is rendered by `src/app/[locale]/layout.tsx` for the home page **and** the study pages. Every link is therefore **absolute**, so it works from any page.

| # | AR | EN | href (ar / en) |
|---|---|---|---|
| 1 | البرمجة | Code | `/ar#code` / `/en#code` |
| 2 | التصميم | Design | `/ar#design` / `/en#design` |
| 3 | الأنظمة | Systems | `/ar#systems` / `/en#systems` |
| 4 | **Cut Studio** | **Cut Studio** | `/tools?lang=ar` / `/tools` (red outlined pill with a `مجاني` / `Free` tag) |
| — | تواصل | Contact | `/ar#contact` / `/en#contact` (the existing `nav-contact` button) |

- The wordmark reads `عمر الديك` / `Omar Aldeek`, with the small line `برمجة · تصميم · أنظمة` / `CODE · DESIGN · SYSTEMS`.
- The mobile dialog shows the same list, and Cut Studio is item 04. The existing focus trap and Escape handling are unchanged.
- **Every Arabic entry point** to Cut Studio uses `/tools?lang=ar`. That includes the nav, the hero CTA, the Cut Studio band CTA and the footer link. See §6 E1.
- Header styles change for both page types, because the header is shared. The study pages get a visual check in §7.

## 4. Sections, in order, with copy

The copy lives in `src/content/site.ts` `copy.ar` / `copy.en`. Arabic is the source; English is an adaptation.

### 4.0 Hero — `#top`

**Layout.**

- `min-height: 100svh` (a minimum, never a fixed `height`). The content grows past it if long Arabic lines wrap at 375px.
- A grid background, with registration marks in the four corners (one of the two places they are allowed).
- A mono pointer readout `X 000.0 / Y 000.0` in one corner. It updates only on fine pointers and stays static otherwise. It is `aria-hidden`.

**The cut contour.** An absolutely positioned `<svg aria-hidden>` sits over the headline block:

- `viewBox="0 0 100 100"` with `preserveAspectRatio="none"`;
- one `<path>` that forms a rounded rectangle with one notched corner;
- `vector-effect="non-scaling-stroke"`, so the stroke stays at 1.5px at any size.

On load, `motion` animates `pathLength` from 0 to 1 on that `<path>` (an SVG element, so this works). A head dot (a `<circle>`) follows it by `offset-path` with the same path data. When the contour closes, the headline block translates by 2px. The h1 itself stays plain HTML text.

**Copy.**

- eyebrow
  - AR: `مبرمج · مصمّم · باني أنظمة أتمتة`
  - EN: `Developer · Designer · Automation builder`
- h1 (three lines, the last in `--cut` on `--sheet`; 5.46 is fine for large text)
  - AR: `أرسم الشكل.` / `أكتب الكود.` / `وأبني النظام الذي يُكمل العمل.`
  - EN: `I draw the shape.` / `I write the code.` / `I build the system that carries it on.`
- lead
  - AR: `عمر الديك، من فلسطين. أصمّم واجهات وقطعًا تُقصّ بالليزر، أبني مواقع وتطبيقات ويب، وأشغّل مصنعًا مؤتمتًا لمقاطع الشورتس بالعربية والإنجليزية.`
  - EN: `Omar Aldeek, from Palestine. I design interfaces and laser-cut parts, build web apps and sites, and run an automated factory for Arabic and English Shorts.`
- CTA 1: a `--cut` fill with `--sheet` text.
  - AR: `جرّب Cut Studio مجانًا`, linking to `/tools?lang=ar`
  - EN: `Try Cut Studio, free`, linking to `/tools`
- CTA 2 (outlined)
  - AR: `كيف يعمل المصنع`
  - EN: `See how the factory works`
  - Both link to `#systems-flow`.
- bottom rail: `profile.location` · scroll cue
  - AR: `مرّر لتتبع الخط`
  - EN: `Scroll to follow the line`

### 4.1 Three layers — rows `#code`, `#design`, `#systems`

These are three full-width rows separated by hairlines, not cards. Each row has:

- a giant outline index numeral;
- a layer tag in mono (Latin only);
- a title;
- two lines of text;
- a proof link.

**Motion.** When a row scrolls into view, its hairline is drawn once, with `scaleX` running from 0 to 1 from the inline-start edge (the transform origin flips in RTL). On hover or focus, the numeral fills with `--cut`.

**Section label.**

- AR: `ثلاث طبقات، ملف واحد`
- EN: `Three layers, one file`

**Rows.**

1. **Code** — tag `LAYER 01 · CODE`.
   - AR title: `البرمجة`
   - AR text: `مواقع وتطبيقات ويب بـ <bdi>Next.js</bdi> و <bdi>React</bdi> و <bdi>TypeScript</bdi>. أبنيها سريعة، ثنائية اللغة، وتعمل على الهاتف أولًا.`
   - AR proof: `هذا الموقع نفسه، و Cut Studio`, linking to `#cut-studio`.
   - EN title: `Code`
   - EN text: `Web apps and sites in Next.js, React and TypeScript. Fast, bilingual, and built for the phone first.`
   - EN proof: `This site, and Cut Studio`, linking to `#cut-studio`.
2. **Design** — tag `LAYER 02 · ENGRAVE`, in `--engrave` on `--sheet`.
   - AR title: `التصميم`
   - AR text: `تصميم بصري وواجهات، وتصميم للتصنيع والقص بالليزر: من الفيكتور النظيف إلى قطع تُركّب.`
   - AR proof: `دراسات تصميم`, linking to `#studies`.
   - EN title: `Design`
   - EN text: `Visual and interface design, plus design for fabrication and laser cutting: from clean vectors to parts that fit together.`
   - EN proof: `Design studies`, linking to `#studies`.
3. **Systems** — tag `LAYER 03 · SYSTEMS`.
   - AR title: `الأنظمة`
   - AR text: `أنظمة أتمتة تربط الأدوات ببعضها وتعمل على جدول. أوضح مثال: مصنع شورتس يعمل كل يوم.`
   - AR proof: `ادخل المصنع`, linking to `#systems-flow`.
   - EN title: `Systems`
   - EN text: `Automation that connects tools and runs on a schedule. The clearest example is a Shorts factory that runs every day.`
   - EN proof: `Step into the factory`, linking to `#systems-flow`.

"Every day" is backed by the daily scheduled triggers documented in `CLAUDE.md`. It is a statement, not a count.

### 4.2 The factory — `#systems-flow` (centerpiece)

**Heading copy.**

- label
  - AR: `نظام حقيقي، يعمل الآن`
  - EN: `A real system, running now`
- h2
  - AR: `مصنع الشورتس.`
  - EN: `The Shorts factory.`
- intro
  - AR: `قناة شورتس عربية وأخرى إنجليزية، يديرهما خط إنتاج بنيته من البداية للنهاية. هذه محطاته بالترتيب.`
  - EN: `An Arabic Shorts channel and an English one, run by a production line I built end to end. These are its stations, in order.`

**Structure (one layout for every viewport; no sticky scroll, no cross-fade).**

- The pipeline is a server-rendered `<ol>` of **6 stations**. Each `<li>` always shows its code, name, text and tags. No station is ever hidden, and nothing is behind opacity.
- The cut line is a track along the inline-start edge of the list.
- **Enhancement** (JS, `prefers-reduced-motion: no-preference` only):
  - the track fills with `scaleY` from `useScroll` over the section;
  - a packet (a small red square) moves down it with `transform: translateY(…%)`. Its wrapper is the full height of the track, so the percentage maps to the track;
  - the station nearest the viewport centre gets `data-active`, shown as a red index and a brighter title.

  This is decoration on top of a list that is already fully readable.
- The section does not scroll-jack, add no 300vh, and has no sticky container. Short screens, 200% zoom and keyboard users get the same readable list. Focus order is the DOM order. The only focusable elements are the optional channel link and the next section's links.
- **Oversight note.** Buzz sits **outside** the numbered list, in an `<aside>` beside it (below it on mobile). A dashed engrave-blue bracket spans the whole list. It is parallel to the stations, not a step after publishing.

| # | Code | AR name / text | EN name / text | Tags (`dir="ltr"`) |
|---|---|---|---|---|
| 1 | `PLAN` | **التخطيط** — `n8n يجدول العمل ويشغّل كل خطوة في وقتها.` | **Plan** — `n8n schedules the work and runs every step on time.` | `n8n` |
| 2 | `WRITE` | **الكتابة** — `نموذج لغوي يكتب النص، ونموذج ثانٍ جاهز إن تعثّر الأول.` | **Write** — `A language model writes the script, with a second model ready if the first one fails.` | `LLM` |
| 3 | `CHECK` | **الفحص** — `مدقّق يرفض النص إن خالف الطول أو المدة المتوقعة أو قواعد البداية، ويطلب إعادة الكتابة.` | **Check** — `A validator rejects a script that breaks the length, predicted duration or hook rules, and asks for a rewrite.` | `validator` |
| 4 | `VOICE` | **الصوت** — `التعليق الصوتي عبر ElevenLabs أو edge-tts أو Gemini، حسب الإعداد.` | **Voice** — `Narration by ElevenLabs, edge-tts or Gemini, depending on the setting.` | `ElevenLabs` `edge-tts` `Gemini` |
| 5 | `RENDER` | **المونتاج** — `MoneyPrinterTurbo يركّب الفيديو على خادم VPS.` | **Render** — `MoneyPrinterTurbo assembles the video on a VPS.` | `MoneyPrinterTurbo` `VPS` |
| 6 | `PUBLISH` | **النشر** — `الفيديو الجاهز يُنشر على يوتيوب، وعلى تيك توك في الخط العربي.` | **Publish** — `The finished video goes out to YouTube, and to TikTok on the Arabic line.` | `YouTube` `TikTok` |

Row 6 is the corrected Q1 wording. The earlier "automatically to YouTube and TikTok" is removed.

**Oversight aside.**

- title
  - AR: `وعلى الجانب: فريق مراجعة`
  - EN: `Alongside: a review team`
- text
  - AR: `فريق من وكلاء الذكاء الاصطناعي على <bdi>Buzz</bdi>، خادم دردشة مستضاف ذاتيًا، يراجع العمل على النظام.`
  - EN: `A team of AI agents on Buzz, a self-hosted chat, reviews the work on the system.`
- tags: `Buzz` `AI agents`

The wording claims no per-video review.

**Channel link.** If `profile.links.youtube` holds a valid `https://` URL, a link appears under the list: AR `شاهد القناة` / EN `Watch the channel`. If the value is empty, nothing renders.

### 4.3 Cut Studio — `#cut-studio`

This is the only light section: a full-bleed `--paper` band with `--sheet` text and a `--sheet` focus ring.

**Main visual.** A large inline SVG of a finger-joint box's **flat layout** (six panels, red cut and blue engrave, in the box maker's own convention). Its outlines are drawn once, with `pathLength` on real `<path>` elements, when the band scrolls into view. The box drawing:

- is **hand-authored and static**, so no toolkit code ships on the home page;
- is `aria-hidden`;
- is drawn fully under reduced motion.

This is the band's hero; the text sits beside it (or below it on mobile).

**Copy.**

- label
  - AR: `أداة مجانية`
  - EN: `A free tool`
- h2
  - AR: `<bdi>Cut Studio</bdi> — ورشة الليزر في متصفحك.`
  - EN: `Cut Studio — a laser workshop in your browser.`
- text
  - AR: `أدوات صنعتها لعملي في القص والحفر بالليزر، وأتركها مجانية لكل من يحتاجها. بلا حساب، وملفات SVG و DXF والصور تُعالج على جهازك.`
  - EN: `Tools I built for my own laser cutting and engraving work, free for anyone who needs them. No account, and SVG, DXF and image files are processed on your device.`

**Tool list.** The list is imported read-only from `@/toolkit/copy` (`toolIds`, `titles`), so it cannot drift from the real app.

- It is a numbered two-column list.
- The index (`01`) is in mono with `dir="ltr"`.
- The Arabic name is in **Tajawal, not mono**.

**CTA.** `--sheet` fill with `--paper` text.

- AR: `افتح Cut Studio`, linking to `/tools?lang=ar`
- EN: `Open Cut Studio`, linking to `/tools`

**Small print.**

- AR: `الواجهة بالعربية والإنجليزية. تحويل ملفات CDR متاح فقط عند تشغيل الأداة محليًا.`
- EN: `Arabic and English interface. CDR conversion is only available when the toolkit runs locally.`

Per `docs/TOOLKIT.md`, CDR conversion is disabled on public hostnames.

### 4.4 Design studies — `#studies`

The three existing concepts are kept as the evidence for "Design". Each one is a wide frame using the existing `SitePreview` and links to the unchanged `/[locale]/work/[slug]`.

- Frames sit in a three-column row on desktop.
- Below 1025px they form a horizontal strip with native `scroll-snap`. `overflow-x: auto` applies **on the strip only**, so the document never gains horizontal scroll.
- Each frame shows its disclosure, AR `نموذج تجريبي — ليس مشروع عميل` / EN `Design concept — not a client project`. That per-item disclosure is the only place the negative appears. The heading does not repeat it.

**Copy.**

- label
  - AR: `دراسات`
  - EN: `Studies`
- h2
  - AR: `دراسات تصميم.`
  - EN: `Design studies.`
- intro
  - AR: `ثلاث تجارب أبني فيها اتجاهًا بصريًا كاملًا لنشاط متخيَّل، من الفكرة إلى واجهة تعمل.`
  - EN: `Three exercises in building a full visual direction for an imagined business, from idea to a working interface.`

### 4.5 How I work

One statement and three principles on hairlines. There is no card grid. Services, pricing, process and FAQ are **removed from the home page**.

- h2
  - AR: `أبني ما أستخدمه.`
  - EN: `I build what I use.`
- principles
  1. AR: `أبدأ بالمشكلة، لا بالشكل.` / EN: `Start from the problem, not the look.`
  2. AR: `أجعل ما أبنيه يعمل على الهاتف وباللغتين.` / EN: `Make it work on a phone, in both languages.`
  3. AR: `وأترك الأداة مفيدة لغيري أيضًا.` / EN: `And leave the tool useful to others, too.`

### 4.6 Contact — `#contact`

- h2
  - AR: `عندك فكرة تحتاج شكلًا، أو كودًا، أو نظامًا؟`
  - EN: `Have an idea that needs a shape, code, or a system?`
- **Buttons.** They come from `profile` and render **only when valid**:
  - WhatsApp and email use the existing regexes;
  - `profile.links.*` goes through one `validUrl()` helper (the `https:` protocol and `new URL()` succeeds).
- **Fallback.** With no valid contact at all, keep the existing `pendingContact` text and the local, download-only `ProjectBrief`, unchanged.

### 4.7 Footer (signature)

The accessible name is plain HTML text: `<p class="footer-signature" dir="ltr">OMAR ALDEEK</p>`, filled `--paper`. The SVG does **not** try to trace glyphs, because font-to-outline conversion is out of scope.

- **Cut contour.** A separate decorative `<svg aria-hidden>` draws a cut contour **around** the signature block: a rounded rectangle with two holding tabs (small gaps in the path), like a part on a sheet that is not yet broken free.
- **Motion.** When the footer scrolls into view, `pathLength` runs from 0 to 1 on that path. Then the signature translates by 2px, as if cut loose.
- Registration marks appear at the footer corners (the second of the two allowed places).
- **Below the signature:** © year · name · location · Cut Studio link (`/tools?lang=ar` on the Arabic page) · back to top.

## 5. Motion spec

The library is `motion` (already loaded through `LazyMotion` + `domAnimation`). There is no new dependency.

| Element | Trigger | Motion | Reduced motion / no JS |
|---|---|---|---|
| Hero contour | load | `pathLength` from 0 to 1 on an SVG `<path>`, 1.4s, `[0.65,0,0.35,1]`. The head dot uses `offset-distance` | fully drawn, no dot |
| Hero h1 lines | load | `y` from 14 to 0, stagger 0.09s (existing `HeroTitle`) | static |
| Pointer readout | `pointermove`, fine pointer only | text updated in `requestAnimationFrame` | static |
| Layer hairlines | in view once | `scaleX` from 0 to 1 from the inline-start edge | drawn |
| Factory track | scroll through the section | `scaleY` of the fill, plus `translateY` of the packet wrapper | fill at 1, no packet |
| Factory active station | scroll | `data-active` attribute; colour change only | none |
| Cut Studio box | in view once | `pathLength` per panel, staggered 0.08s | drawn |
| Footer contour | in view once | `pathLength`, then the signature `translateY` by 2px | drawn |

**Rules.**

- Content is never hidden in server HTML. `initial` states only move or draw decoration. No text starts at `opacity: 0`.
- Only `transform`, `opacity` and SVG stroke properties are animated. **No `top`/`left`/`height` animation.**
- One `useReducedMotion` gate, plus a CSS `@media (prefers-reduced-motion: reduce)` fallback for the CSS-only parts.

## 6. Files

**Scope rule.**

- All v2 styles live under a `.v2` class on a wrapper `<div className="v2">` that `src/app/[locale]/page.tsx` renders around `<main>` and the footer.
- `v2.css` contains **no bare element selectors, no `:root` and no `body`** rules.
- The only shared-surface change is the header/nav in `base.css`/`responsive.css`, which is intended and checked on the study pages.
- `/tools` has its own root layout and does not import `globals.css`. Deepseek confirms this by grepping `src/app/tools/layout.tsx` imports before and after.

**Changed**

- `src/content/site.ts`
  - Replace `copy` with the v2 keys. Keep `skip`, `menu`, `close`, `navigation`, the brief keys, `concept` and the `work/[slug]` keys (`backWork`, `goal`, …).
  - `profile` gains `links: { github, linkedin, youtube, tiktok, instagram, x, behance }`, all `""`. Each key has the comment `// full https URL; empty renders nothing`.
  - `projects` is unchanged.
- `src/app/[locale]/page.tsx` — rewritten to §4, wrapped in `.v2`.
- `src/app/[locale]/layout.tsx`
  - `viewport.themeColor` becomes the literal `"#0e0e0d"`.
  - `Navigation` receives the new items and absolute hrefs.
- `src/components/interactions.tsx`
  - `Navigation`: absolute `/${locale}#id` links, plus the Cut Studio `Link` (`/tools?lang=ar` when `locale === "ar"`).
  - Delete `HeroComposition`, `StackCard` and `Process` after a grep shows they have no importers.
  - Keep `Reveal`, `HeroTitle`, `PageProgress` (restyled as a thin `--cut` line), `ProjectBrief` and `MotionProvider`.
- `src/components/sections.tsx`
  - `Contact` gets `validUrl()` and renders `profile.links`.
  - `Footer` gets the signature with its contour and the Cut Studio link.
  - `Contact` is also used by `work/[slug]`. Its markup stays compatible there; check it visually.
- `src/app/globals.css` — import `styles/v2.css`. Remove the `cinema.css` import only if a grep shows its selectors are unused outside the old home page.
- `src/toolkit/toolkit.tsx` — **E1, the one approved toolkit change.** See below.
- `tests/portfolio.spec.ts` — update the home assertions (§7). Keep every work-page, brief, menu, font and 404 test.

**E1 — `?lang=ar` for Cut Studio (approved by astra in review §2).**

- On mount only, read `new URLSearchParams(window.location.search).get("lang")`. If it equals `"ar"`, switch to Arabic. Every other value, including a missing one, keeps English.
- The in-app language toggle keeps working as before.
- SSR impact is **not** zero. The static HTML is English, and the switch to Arabic, with its `lang`/`dir`, happens after hydration. That matches the existing effect on line 16, which already sets `document.documentElement.lang/dir` from state.
- Implementation:
  - If `eslint-plugin-react-hooks` flags `setState` inside an effect, read the query through `useSyncExternalStore`, which the repo already uses in `ProjectBrief`. The server snapshot is `"en"`.
  - Do not use a lazy `useState` initializer. It would make server and client disagree and cause a hydration mismatch.
- No other line in `src/toolkit/**`, `src/app/tools/**` or `src/app/api/tools/**` changes.

**New**

- `src/components/cut-line.tsx` (client)
  - `HeroContour`: path, head dot and pointer readout.
  - `DrawPath`: a generic in-view `pathLength` for `<path>` elements, used for the box and the footer contour.
  - `Hairline`: in-view `scaleX`.
- `src/components/factory.tsx` (client) — `FactoryTrack`, the fill and packet enhancement beside the server-rendered `<ol>`, which lives in `page.tsx`.
- `src/components/box-flat.tsx` (server) — the static finger-joint flat SVG.
- `src/app/styles/v2.css` — everything scoped under `.v2`.
- `tests/toolkit-lang.spec.ts` — the E1 tests (§7).

**Untouched (hard):**

- `src/toolkit/**` except the E1 lines;
- `src/app/tools/**`;
- `src/app/api/tools/**`;
- `src/app/[locale]/work/**`;
- `src/content/demo.ts`;
- `src/content/previews.ts`;
- `.github/**`;
- the existing `tests/toolkit-*.spec.ts`.

## 7. Acceptance checks

### 7.1 Build gate (Windows PowerShell; all must pass before push)

```powershell
npx tsc --noEmit; if ($LASTEXITCODE -ne 0) { throw "tsc failed" }
npm run lint;     if ($LASTEXITCODE -ne 0) { throw "lint failed" }

$api   = Join-Path (Get-Location) "src/app/api"
$aside = Join-Path $env:TEMP ("portfolio-api-aside-" + [guid]::NewGuid().ToString("N"))
if (-not (Test-Path $api))  { throw "src/app/api missing before build" }
if (Test-Path $aside)       { throw "temp path already exists: $aside" }
Move-Item -LiteralPath $api -Destination $aside
$code = 1
try {
  $env:GITHUB_PAGES = "true"
  npm run build
  $code = $LASTEXITCODE
} finally {
  Remove-Item Env:GITHUB_PAGES -ErrorAction SilentlyContinue
  Move-Item -LiteralPath $aside -Destination $api
}
if (-not (Test-Path (Join-Path $api "tools"))) { throw "src/app/api not restored" }
if ($code -ne 0) { throw "static build failed with exit code $code" }
```

After that, `git status --short src/app/api src/toolkit` must be empty apart from the E1 line in `toolkit.tsx`. A restored folder does not prove a passing build: the build's own exit code is the evidence, and it must be reported.

### 7.2 Automated (Playwright)

1. `/ar/` and `/en/` at 375, 768 and 1440 px:
   - `html[dir]` is correct;
   - `h1` is visible;
   - `document.documentElement.scrollWidth <= innerWidth`;
   - there are no console errors;
   - `#studies`: the document still has no horizontal overflow, and the strip's own `scrollWidth > clientWidth` only below 1025px.
2. The nav, in both locales and in the mobile dialog:
   - it links to `/ar#code`, `/ar#design`, `/ar#systems` and `/ar#contact`, or their `/en` equivalents;
   - the Cut Studio link is `/tools?lang=ar` on Arabic and `/tools` on English. `trailingSlash` may add `/`; assert with a regex.
3. **Study, home, Cut Studio, then back.** Start on `/ar/work/forma/`. Click nav "Systems": the page lands on `/ar/` with `#systems` in view. Click Cut Studio: `/tools?lang=ar` is Arabic with `dir="rtl"`. Go back: `/ar/`, with `dir="rtl"` and no console errors.
4. With JavaScript disabled, `#systems-flow ol > li` has **6** items, each containing its tag text. The oversight `<aside>` contains `Buzz` and is not inside the `<ol>`.
5. The Cut Studio list length equals `toolIds.length`, imported in the test and never hardcoded.
6. Reduced motion: `#systems-flow` has no packet element, and `getAnimations()` on the page returns 0 running animations after load.
7. At 200% zoom (a 720 px viewport for a 1440 layout) and at 1280 × 600: every station's text is visible and no `position: sticky` sits in `#systems-flow`.
8. With every `profile` value empty, `#contact` has 0 `a[href^="https://wa.me/"]`, 0 `a[href^="mailto:"]` and 0 `a[target=_blank]`.
9. `tests/toolkit-lang.spec.ts`:
   - `/tools` stays English;
   - `/tools?lang=ar` becomes Arabic, `lang="ar"` and `dir="rtl"`;
   - `/tools?lang=xx` stays English;
   - after landing on `?lang=ar`, the toggle still switches to English;
   - no hydration warnings appear in the console.
10. Every existing test passes unchanged: the language switch preserving the route, the menu focus trap, the brief download, the English font check, the 404 and **all `tests/toolkit-*.spec.ts`**.

    Scope of that claim: a passing toolkit test suite shows the covered behaviour still works. It does **not** show that every Cut Studio workflow is healthy, and the report must say so.

### 7.3 Visual and manual (deepseek attaches screenshots)

- **Arabic** at 375 × 812, checking all of these:
  - the hero (tashkeel and descenders unclipped, long lines wrapping inside `min-height`);
  - the layer rows;
  - the factory list and aside;
  - the Cut Studio band (the Tajawal tool names and the `ltr` indices);
  - the footer.
- **English:** the same set at 375 × 812 and 1440 × 900.
- **Study page:** `/ar/work/forma/` and `/en/work/forma/` at 375 and 1440, to confirm that the shared header and `Contact` still look right and that no v2 styles leak in.
- **`/tools`:** `/tools` and `/tools?lang=ar` at 1440, to confirm that nothing leaks from the home CSS.
- **Contrast, measured in the browser** (for example, the DevTools contrast picker), not recomputed:
  - `--sheet` text on the red CTA;
  - the red focus ring on `--sheet`;
  - the `--sheet` focus ring on `--paper`;
  - `--muted` text;
  - `--engrave` tags on `--sheet`.

### 7.4 Performance

`docs/performance-before.json` holds local browser measurements from **2026-09-15**, which include `/_next/image`. It is **not** a static-export Lighthouse baseline, so it is not compared against.

Method, identical for before and after:

1. **Before:** in a separate worktree at `039e053` (the v1 home page), run the §7.1 build gate. Serve `out/` with `npx serve out -l 4173`. Run `npx lighthouse http://localhost:4173/ar/ --preset=perf --form-factor=mobile --output=json`, 3 runs, and take the median of each metric. Then repeat for `/en/`.
2. **After:** the same commands on the final `portfolio-v2` build, on the same machine.
3. Save both sets as `docs/perf-v2-before.json` and `docs/perf-v2-after.json`, and report LCP, CLS, TBT and the accessibility score side by side.

The targets are LCP under 2.5s, CLS under 0.05 and accessibility at 95 or above. If a target is missed, report the measured value; never round it into a pass.

`npx serve` and `npx lighthouse` run as temporary tools. They are **not** added to `package.json`.

## 8. Commit plan (for deepseek)

1. `content: v2 copy and profile links`
2. `feat: scoped v2 tokens and styles`
3. `feat: absolute nav links and Cut Studio entry`
4. `feat(toolkit): open in Arabic from ?lang=ar` (E1 only, plus `tests/toolkit-lang.spec.ts`)
5. `feat: hero contour`
6. `feat: three layers section`
7. `feat: factory list, track and oversight note`
8. `feat: Cut Studio band with box flat`
9. `feat: studies strip, principles, contact links, footer signature`
10. `chore: remove unused v1 components and styles`
11. `test: update portfolio spec for v2`
12. `docs: perf before/after (static export)`

## 9. Open points

None are blocking. Omar may still adjust these after seeing the page:

- The Google Flow slot, which is hand-produced, is left out because the brief describes the automated line only.
- The copy tone and the hero line.

## 10. Review mapping (`docs/REVIEW-astra-plan-v1.md`)

| Review § | Change in this draft |
|---|---|
| 1. Factory accuracy | Row 6 uses the corrected wording, and the old wording is gone (§4.2). Buzz moved to an oversight `<aside>` outside the list. The list has 6 stations, and the test counts 6 (§7.2 #4). |
| 2. E1 | `toolkit.tsx` is listed as changed. It reads the query on mount only, unknown values stay English, the toggle is preserved, the Arabic URL is used at every entry point, and the SSR effect is stated honestly. New tests are in `toolkit-lang.spec.ts` (§6, §7.2 #9). |
| 3. Protect pages | Everything is scoped under `.v2` and the grain is on `.v2::before` (§6). The nav uses absolute links (§3), and there is a study-to-home-to-tools-to-back test (§7.2 #3) plus visual checks of the study pages and `/tools` (§7.3). |
| 4. Motion and readability | No `top` animation. The sticky scroll and cross-fade are dropped, the list is always fully readable, and zoom and short-screen tests are added (§4.2, §5, §7.2 #7). The hero uses `min-height`, Arabic uses normal spacing and no mono, and Latin inside Arabic is isolated with `bdi`/`dir` (§2, §4). |
| 5. Editorial rules | "No numbers…" and "Never show a number…" are removed from the copy and moved to the Editorial constraints at the top. The studies heading is now positive and the disclosure stays per item. Coordinates and marks are limited to the hero and footer, and the box is the main visual in the tools band (§1, §4). |
| 6. Signature | The text stays HTML, and a decorative contour path around it is traced. There is no glyph tracing (§4.7). `themeColor` is the literal `"#0e0e0d"` (§6). |
| 7. Build gate | PowerShell with a unique validated temp path, `try/finally`, the exit code preserved and restoration verified separately (§7.1). |
| 8. Evidence | The Lighthouse method is the same for before and after on the static export, and the Sep 15 file is not used as a baseline (§7.4). Contrast is measured in the browser, including the CTA and the focus rings, and the red-on-paper failure is designed out (§2). Studies overflow is checked (§7.2 #1). The claim about toolkit tests is scoped (§7.2 #10). |
