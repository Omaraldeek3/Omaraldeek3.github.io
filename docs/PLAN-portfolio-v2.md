# Plan: portfolio v2 — "The Cut Line / خط القصّ"

Status: **draft 1, for astra's review.** Brief: `docs/BRIEF-portfolio-v2.md`.
Branch: `portfolio-v2`. Never push `main`.

Facts in this plan come from these sources. Anything not listed there is not claimed.

- Current site: `src/content/site.ts`, `src/app/[locale]/page.tsx`, `src/components/*`.
- Cut Studio: the tool names come from `src/toolkit/copy.ts` (`toolIds`, which lists 8 tools). Behaviour comes from `docs/TOOLKIT.md`.
- Shorts factory: the brief, checked against `claude home/CLAUDE.md`. See §9 for the two points where the brief and production disagree.

---

## 1. Concept

**The page is one sheet on a laser bed, and one red cut line runs through it.**

Omar's three crafts share a single idea. A design becomes a path, code becomes a path, and an automation becomes a path that runs by itself. The page makes that literal.

- One continuous **laser-red line** (`--cut`) enters in the hero and runs down the page.
- The line outlines the hero and becomes the stroke of the three "layers".
- In the factory section it becomes the pipeline's track.
- In Cut Studio it cuts out a finger-joint box.
- In the footer it cuts the wordmark out of the sheet.
- The chrome follows machine conventions that Cut Studio already uses: **red for cut, blue for engrave**, millimetre coordinates, registration marks at the sheet corners, and layer names in mono caps.
- It is not a template portfolio. There is no card grid, no gradient blob, and no "Hi, I'm X" hero. The page reads like a machine drawing, and that drawing is a person.

Why this concept rather than a 3D showpiece: it is **true to the work**. The laser and vector work is real, and Cut Studio proves it. The line motif also fits every section without a new idea per section. It is cheap to render (SVG + CSS), so LCP and 375px stay safe. `three` is **not** loaded on the home page. It stays where it already earns its place, the Cut Studio box preview.

## 2. Visual system

| Token | Value | Use |
|---|---|---|
| `--sheet` | `#0e0e0d` | page background (black acrylic) |
| `--paper` | `#ece7dc` | primary text, light bands |
| `--muted` | `#9a958b` | secondary text. Verify ≥ 4.5:1 on `--sheet` |
| `--cut` | `#ff3d1f` | the cut line, focus ring, primary CTA |
| `--engrave` | `#3d7bff` | secondary annotations only (never body text) |
| `--grid` | `rgb(236 231 220 / .06)` | 10 mm-style background grid, hero and factory only |

- **Type.**
  - Latin display: Manrope 800, tight tracking (`-0.04em`), sized with `clamp()` up to about 14vw.
  - Arabic display: Tajawal 700, with no negative tracking in Arabic.
  - Body: Manrope 400/500 and Tajawal 400/500.
  - Mono labels: `ui-monospace, "SFMono-Regular", Menlo, monospace`. No new font.
  - The Noto Sans Arabic package stays installed but is not added. The English-font test (`tests/portfolio.spec.ts`, "does not download the full Arabic font") must keep passing.
- **Chrome motifs.**
  - Registration marks (⌖) at section corners.
  - Coordinates in `X 000.0 / Y 000.0` mono. These are decorative and `aria-hidden`.
  - Layer tags `LAYER 01 · CUT`.
  - All numerals in chrome are Latin digits in both locales, to stay consistent with the machine language.
- **Grain.** A single inline SVG `feTurbulence` noise at 4% opacity on `body::before`. No image request.
- **No** glassmorphism, no stock gradients, and no drop-shadow cards.

## 3. Navigation

The header wordmark is `عمر الديك` / `Omar Aldeek`, with the small line `برمجة · تصميم · أنظمة` / `CODE · DESIGN · SYSTEMS`.

| # | AR | EN | Target |
|---|---|---|---|
| 1 | البرمجة | Code | `#code` |
| 2 | التصميم | Design | `#design` |
| 3 | الأنظمة | Systems | `#systems` |
| 4 | **Cut Studio** | **Cut Studio** | `/tools` (a `next/link`, rendered as a red outlined pill with a `مجاني` / `Free` tag) |
| — | تواصل | Contact | `#contact` (the existing `nav-contact` button) |

The mobile dialog shows the same list, and Cut Studio is item 04. The existing focus trap and Escape handling are unchanged.

## 4. Sections, in order, with copy

The copy lives in `src/content/site.ts` `copy.ar` / `copy.en`. Arabic is the source; English is an adaptation, not a literal translation.

### 4.0 Hero — `#top` "SHEET 00"

The layout is full viewport height with a grid background and registration marks in the four corners. On load, the cut line draws a closed contour around the headline block: a rounded rectangle with one notched corner, like a part on a sheet. A bright dot (the laser head) leads the stroke. When the contour closes, the headline block shifts by 2px and gains a 1px inner shadow, as if it has been cut free. A mono readout in one corner shows `X / Y` in mm, following the pointer on fine pointers only. It is static otherwise.

- eyebrow — AR: `مبرمج · مصمّم · باني أنظمة أتمتة` / EN: `Developer · Designer · Automation builder`
- h1 (three lines, the last in `--cut`)
  - AR: `أرسم الشكل.` / `أكتب الكود.` / `وأبني النظام الذي يُكمل العمل.`
  - EN: `I draw the shape.` / `I write the code.` / `I build the system that carries it on.`
- lead
  - AR: `عمر الديك، من فلسطين. أصمّم واجهات وقطعًا تُقصّ بالليزر، أبني مواقع وتطبيقات ويب، وأشغّل مصنعًا مؤتمتًا لمقاطع الشورتس بالعربية والإنجليزية.`
  - EN: `Omar Aldeek, from Palestine. I design interfaces and laser-cut parts, build web apps and sites, and run an automated factory for Arabic and English Shorts.`
- CTA 1 (solid `--cut`) — AR: `جرّب Cut Studio مجانًا` / EN: `Try Cut Studio, free`. Links to `/tools`.
- CTA 2 (line) — AR: `كيف يعمل المصنع` / EN: `See how the factory works`. Links to `#systems`.
- bottom rail — `profile.location` · `SHEET 00 / 06` · scroll cue: AR `مرّر لتتبع الخط` / EN `Scroll to follow the line`.

### 4.1 Three layers — `#code` `#design` `#systems` (anchors on each row)

These are not cards. They are three full-width **rows** separated by hairlines, like a layer panel in a cutting program. Each row has a giant index numeral in outline type, a layer tag, a one-line title, two lines of text and a "proof" link. On scroll-in, the row's hairline is drawn by the cut line (it scales from the start edge, which follows the reading direction). On hover or focus, the numeral fills with `--cut`.

Section label — AR: `ثلاث طبقات، ملف واحد` / EN: `Three layers, one file`.

1. `LAYER 01 · CODE`
   - AR: **البرمجة** — `مواقع وتطبيقات ويب بـ Next.js و React و TypeScript. أبنيها سريعة، ثنائية اللغة، وتعمل على الهاتف أولًا.` Proof: `هذا الموقع نفسه، و Cut Studio` links to `#cut-studio`.
   - EN: **Code** — `Web apps and sites in Next.js, React and TypeScript. Fast, bilingual, and built for the phone first.` Proof: `This site, and Cut Studio` links to `#cut-studio`.
2. `LAYER 02 · ENGRAVE` (tag in `--engrave`)
   - AR: **التصميم** — `تصميم بصري وواجهات، وتصميم للتصنيع والقص بالليزر: من الفيكتور النظيف إلى قطع تُركّب.` Proof: `دراسات تصميم` links to `#studies`.
   - EN: **Design** — `Visual and interface design, plus design for fabrication and laser cutting: from clean vectors to parts that fit together.` Proof: `Design studies` links to `#studies`.
3. `LAYER 03 · SYSTEMS`
   - AR: **الأنظمة** — `أنظمة أتمتة تربط الأدوات ببعضها وتعمل على جدول. أوضح مثال: مصنع شورتس يعمل كل يوم.` Proof: `ادخل المصنع` links to `#systems-flow`.
   - EN: **Systems** — `Automation that connects tools and runs on a schedule. The clearest example is a Shorts factory that runs every day.` Proof: `Step into the factory` links to `#systems-flow`.

The "every day" claim is backed by production's daily schedule. It is not a count. See §9 if astra wants it softened.

### 4.2 The factory — `#systems-flow` (centerpiece)

Label — AR: `نظام حقيقي، يعمل الآن` / EN: `A real system, running now`.

- h2 — AR: `مصنع الشورتس.` / EN: `The Shorts factory.`
- intro
  - AR: `قناة شورتس عربية وأخرى إنجليزية، يديرهما خط إنتاج بنيته من البداية للنهاية. هذه محطاته بالترتيب.`
  - EN: `An Arabic Shorts channel and an English one, run by a production line I built end to end. These are its stations, in order.`

**Desktop (≥1025px, motion allowed).** The section is sticky for about 300vh. On the start side is a vertical track: the cut line. Seven stations sit on it as nodes. A "packet" (a small red square) travels down the track, driven by `useScroll`. The active station's panel on the other side cross-fades in. Each panel has a big mono station code, a name, a two-line text and the real tool names as tags.

**Mobile, reduced motion, or no JS.** An ordinary `<ol>` with the line drawn down the start edge. Every panel is visible in the server HTML. The sticky version is an enhancement on the same markup (same approach as the current `StackCard`/`Process`).

| # | Code | AR name / text | EN name / text | Tags |
|---|---|---|---|---|
| 1 | `PLAN` | **التخطيط** — `n8n يجدول العمل ويشغّل كل خطوة في وقتها.` | **Plan** — `n8n schedules the work and runs every step on time.` | `n8n` |
| 2 | `WRITE` | **الكتابة** — `نموذج لغوي يكتب النص، ونموذج ثانٍ جاهز إن تعثّر الأول.` | **Write** — `A language model writes the script, with a second model ready if the first one fails.` | `LLM` |
| 3 | `CHECK` | **الفحص** — `مدقّق يرفض النص إن خالف الطول أو المدة المتوقعة أو قواعد البداية، ويطلب إعادة الكتابة.` | **Check** — `A validator rejects a script that breaks the length, predicted duration or hook rules, and asks for a rewrite.` | `validator` |
| 4 | `VOICE` | **الصوت** — `التعليق الصوتي عبر ElevenLabs أو edge-tts أو Gemini، حسب الإعداد.` | **Voice** — `Narration by ElevenLabs, edge-tts or Gemini, depending on the setting.` | `ElevenLabs` `edge-tts` `Gemini` |
| 5 | `RENDER` | **المونتاج** — `MoneyPrinterTurbo يركّب الفيديو على خادم VPS.` | **Render** — `MoneyPrinterTurbo assembles the video on a VPS.` | `MoneyPrinterTurbo` `VPS` |
| 6 | `PUBLISH` | **النشر** — `الفيديو الجاهز يُنشر تلقائيًا على يوتيوب وتيك توك.` | **Publish** — `The finished video is published to YouTube and TikTok automatically.` | `YouTube` `TikTok` |
| 7 | `REVIEW` | **المراجعة** — `فريق من وكلاء الذكاء الاصطناعي على Buzz، خادم دردشة مستضاف ذاتيًا، يراجع العمل.` | **Review** — `A team of AI agents on Buzz, a self-hosted chat, reviews the work.` | `Buzz` `AI agents` |

Footnote under the flow:

- AR: `لا أرقام هنا. حين أنشر أرقامًا، ستكون مقيسة.`
- EN: `No numbers here. When I publish numbers, they will be measured ones.`

If `profile.links.youtube` is set, show a link to the channel here: AR `شاهد القناة` / EN `Watch the channel`. If it is empty, show nothing.

**Honesty rules for this section (hard).**

- No fake log lines, counters, "videos made", uptime, views or earnings.
- No model names beyond "language model". The brief says "an LLM".
- Row 6 must match production. See §9, Q1.

### 4.3 Cut Studio — `#cut-studio` (the giveaway)

This is the only light section: `--paper` background and `--sheet` text, a full-bleed band that breaks the dark page so it cannot be missed.

- label — AR `أداة مجانية` / EN `A free tool`
- h2 — AR: `Cut Studio — ورشة الليزر في متصفحك.` / EN: `Cut Studio — a laser workshop in your browser.`
- text
  - AR: `أدوات صنعتها لعملي في القص والحفر بالليزر، وأتركها مجانية لكل من يحتاجها. بلا حساب، وملفات SVG و DXF والصور تُعالج على جهازك.`
  - EN: `Tools I built for my own laser cutting and engraving work, free for anyone who needs them. No account, and SVG, DXF and image files are processed on your device.`
- Tool list: the 8 names are **imported from `@/toolkit/copy`** (`toolIds`, `titles`). This is a read-only import, so the list cannot drift from the real app. Render it as a numbered two-column mono list (`01 ترتيب القطع` …), not cards.
- Visual: an inline SVG **flat layout of a finger-joint box** (six panels, red cut and blue engrave, mirroring the box maker's own output style). The cut line traces the outlines when the section enters the viewport. It is drawn once and is static under reduced motion. The artwork is hand-authored and `aria-hidden`. It is not generated from `src/toolkit/box` at runtime (so no toolkit code ships on the home page).
- CTA (solid `--sheet` on paper) — AR `افتح Cut Studio` / EN `Open Cut Studio`. Links to `/tools`.
- small print
  - AR: `الواجهة بالعربية والإنجليزية. تحويل ملفات CDR متاح فقط عند تشغيل الأداة محليًا.`
  - EN: `Arabic and English interface. CDR conversion is only available when the toolkit runs locally.`
  - Reason: `docs/TOOLKIT.md` says CDR conversion is disabled on public hostnames. Claiming CDR on the live site would be false.

### 4.4 Design studies — `#studies`

The three existing concepts are kept because they are the evidence for "Design". They are downgraded from the old sticky stack to a **horizontal strip**: three wide frames using the existing `SitePreview`, with native scroll-snap on mobile and a three-column row on desktop. Each frame keeps the disclosure `نموذج تجريبي — ليس مشروع عميل` / `Design concept — not a client project` visibly. Each links to the existing `/[locale]/work/[slug]`, which stays unchanged.

- label — AR `دراسات` / EN `Studies`
- h2 — AR: `دراسات تصميم، لا مشاريع عملاء.` / EN: `Design studies, not client work.`
- intro
  - AR: `ثلاث تجارب أبني فيها اتجاهًا بصريًا كاملًا لنشاط متخيَّل، من الفكرة إلى واجهة تعمل.`
  - EN: `Three exercises in building a full visual direction for an imagined business, from idea to a working interface.`

### 4.5 How I work — short, no card grid

This is one statement line and three short principles on hairlines. Services, pricing, process and FAQ are **removed from home**. They sold a web agency. The new page introduces a person with three crafts.

- h2 — AR: `أبني ما أستخدمه.` / EN: `I build what I use.`
- AR principles:
  - `أبدأ بالمشكلة، لا بالشكل.`
  - `أجعل الأداة تعمل على الهاتف وباللغتين.`
  - `لا أعرض رقمًا لم أقِسه.`
- EN principles:
  - `Start from the problem, not the look.`
  - `Make it work on a phone, in both languages.`
  - `Never show a number I haven't measured.`

### 4.6 Contact — `#contact`

- h2 — AR: `عندك فكرة تحتاج شكلًا، أو كودًا، أو نظامًا؟` / EN: `Have an idea that needs a shape, code, or a system?`
- The buttons come from `profile`. Each button renders **only when its value is valid**, using the current regex rule for WhatsApp and email and a new `https://` check for URL links.
- If there are no links at all, keep the existing `pendingContact` text and the local `ProjectBrief` (download-only). Both are unchanged, and the brief-related tests keep passing.

### 4.7 Footer

A giant `OMAR ALDEEK` signature (existing `footer-signature`), drawn as an outline. On scroll-in, the cut line traces it and the letters "drop" 2px. Below it: © year · name · location · `Cut Studio` link · back to top.

## 5. Motion spec

The library is `motion` (already loaded through `LazyMotion` + `domAnimation`). There is no new dependency.

| Element | Trigger | Motion | Reduced motion / no JS |
|---|---|---|---|
| Hero contour | load | `pathLength` 0→1, 1.4s, `[0.65,0,0.35,1]`. The head dot follows via `offset-path` or a motion value | fully drawn, no dot |
| Hero h1 lines | load | y 14→0, stagger 0.09s (existing `HeroTitle`) | static |
| Pointer readout | pointermove, fine pointer only | updates text through `requestAnimationFrame`, no layout thrash | static `X 000.0 Y 000.0` |
| Layer hairlines | inView once | `scaleX` 0→1 from the inline-start edge (`transform-origin` flips in RTL) | drawn |
| Factory packet | scroll inside the sticky section | `useScroll` → `top` %. Panel cross-fade 0.3s | not rendered; list is static |
| Cut Studio box | inView once | `pathLength` per panel, staggered 0.08s | drawn |
| Footer wordmark | inView once | `pathLength` → fill | filled |

Rules:

- Content is **never** hidden in server HTML. `initial` states only move and draw decoration; no text has `opacity: 0`.
- Only `transform`, `opacity` and SVG stroke properties are animated. Nothing animates layout.
- One `prefers-reduced-motion` gate through `useReducedMotion`, plus a CSS `@media (prefers-reduced-motion: reduce)` fallback for the CSS-only bits.

## 6. Files

**Changed**

- `src/content/site.ts`
  - Replace `copy` with the v2 keys above. Keep `skip`, `menu`, `close`, `navigation`, the brief keys, `concept` and the `work/[slug]` keys (`backWork`, `goal`, …).
  - `profile` gains a `links` object: `{ github, linkedin, youtube, tiktok, instagram, x, behance }`, all `""`. Each key has a comment saying "full https URL; empty renders nothing". `whatsapp` and `email` stay where they are.
  - `projects` is unchanged.
- `src/app/[locale]/page.tsx` — rewritten to the section order in §4.
- `src/app/[locale]/layout.tsx` — `themeColor` becomes `--sheet`. Navigation receives the new nav items.
- `src/components/interactions.tsx`
  - `Navigation`: new ids and the Cut Studio `Link`.
  - Delete `HeroComposition`, `StackCard` and `Process` if nothing imports them after the rewrite (check with grep). Keep `Reveal`, `HeroTitle`, `PageProgress` (restyle as a thin `--cut` line), `ProjectBrief` and `MotionProvider`.
- `src/components/sections.tsx` — `Contact` renders `profile.links` through one `validUrl()` helper. `Footer` gets the outline signature and the Cut Studio link.
- `src/app/globals.css` — import `styles/v2.css`. Remove the `cinema.css` import only if a grep shows its selectors are unused by `work/[slug]` and the previews.
- `tests/portfolio.spec.ts` — update the home assertions (see §7). Keep every work-page, brief, menu, font and 404 test.

**New**

- `src/components/cut-line.tsx` (client): `HeroSheet` (contour, head dot, readout), `DrawLine` (generic inView `pathLength` for hairlines, box and wordmark).
- `src/components/factory.tsx` (client): `FactoryFlow`, the sticky scroll enhancement over a server-rendered `<ol>`.
- `src/components/box-flat.tsx` (server): the static finger-joint flat SVG paths.
- `src/app/styles/v2.css`: tokens, grid, grain, sections, and 375px rules.

**Untouched (hard):** `src/toolkit/**`, `src/app/tools/**`, `src/app/api/tools/**`, `src/app/[locale]/work/**`, `src/content/demo.ts`, `src/content/previews.ts`, and `.github/**`. The home page only *imports* `toolIds` and `titles` from `src/toolkit/copy.ts`. It does not change that file.

**Optional exception, needs astra's yes (E1).** In `src/toolkit/toolkit.tsx`, one `useEffect` would set the initial `lang` from `?lang=ar` (`new URLSearchParams(location.search).get('lang')==='ar'`). The Arabic home page would then link to `/tools?lang=ar`. Today every Arabic visitor lands in an English toolkit. The change is three lines, and it has no SSR impact because it runs in an effect. Without E1, the Arabic CTA links to plain `/tools`, and the small print says the language button is inside the tool.

## 7. Acceptance checks

**Build gate (from the brief; all three must pass before push).**

```bash
npx tsc --noEmit
npm run lint
mv src/app/api /tmp/api-aside && GITHUB_PAGES=true npm run build; mv /tmp/api-aside src/app/api
```

After the build, `git status` must show `src/app/api` restored and no stray change under `src/toolkit`.

**Behaviour (Playwright, update `tests/portfolio.spec.ts`).**

1. `/ar` and `/en` at 375, 768 and 1440: `html[dir]` is correct, `h1` is visible, `scrollWidth <= innerWidth`, and there are no console errors.
2. The nav contains a link to `/tools` in both locales and in the mobile dialog.
3. The `#systems-flow` list has 7 `li` items in the server HTML (JS disabled), and each one contains its tool tag text.
4. The Cut Studio list has `toolIds.length` items (8 today). The test imports the count, so it is never hardcoded.
5. Reduced motion: no element has a running animation, and the factory renders the plain list (no sticky wrapper).
6. With all `profile` values empty, there are 0 `a[href^="https://wa.me/"]`, 0 `a[href^="mailto:"]` and 0 external `a[target=_blank]` in `#contact`.
7. Existing tests keep passing: work pages, the language switch preserving the route, the menu focus trap, the brief download, the English font check and the 404.
8. The existing `tests/toolkit-*.spec.ts` all pass unchanged. This is the proof that Cut Studio is not broken.

**Manual (reported by deepseek with screenshots).**

- Hero at 375 × 812 and 1440 × 900, in both locales.
- The factory at desktop mid-scroll.
- Cut Studio band.
- Lighthouse (mobile) on the static `out/`, with before and after numbers **measured**, not estimated. Targets: LCP < 2.5s, CLS < 0.05, and accessibility ≥ 95. `docs/performance-before.json` already holds the "before".
- Contrast checked on `--muted` and `--engrave` against their backgrounds.

## 8. Commit plan (for deepseek)

1. `content: v2 copy and profile links`
2. `feat: sheet tokens, grid and v2 styles`
3. `feat: hero sheet and cut line`
4. `feat: three layers section`
5. `feat: shorts factory flow`
6. `feat: Cut Studio band and nav entry`
7. `feat: studies strip, principles, contact links, footer`
8. `chore: remove unused v1 components and styles`
9. `test: update portfolio spec for v2`

## 9. Open points (astra decides now; Omar confirms later)

- **Q1 — publishing destinations.** The brief says "YouTube and TikTok automatically". Production `CLAUDE.md` says the English line publishes to **YouTube only** (TikTok was dropped on 2026-09-08). There is also a **Telegram gate: video only (Keep / Re-render / Discard)**, so a human may approve each video before it goes out. Proposed accurate copy for row 6:
  - AR: `الفيديو الجاهز يُنشر على يوتيوب، وعلى تيك توك في الخط العربي.`
  - EN: `The finished video goes out to YouTube, and to TikTok on the Arabic line.`
  - Drop "automatically" until Omar confirms whether the Telegram gate still holds each video.
- **Q2 — "every day".** Production runs on a daily schedule, so this is true. It is kept as a statement, not as a number.
- **Q3 — E1** (the `?lang=ar` for Cut Studio). Yes or no.
- **Q4 — the hand-produced Google Flow slot** that production also publishes. It is left out on purpose, because the brief describes the automated line only.
