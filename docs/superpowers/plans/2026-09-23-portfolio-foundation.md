# خطة تنفيذ: إعادة تصميم البورتفوليو

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** إعادة بناء الطبقة البصرية بالكامل بهوية «النظام الحي»، وإعادة ترتيب الموقع حول عمر، ونقل Cut Studio ومصنع الشورتس ودراسات التصميم إلى قسم أعمال واحد اسمه المختبر، مع نشر على Vercel ونموذج تواصل يعمل.

**Architecture:** يبقى المحتوى الحقيقي في `src/content/site.ts` ويبقى `src/toolkit` ومسارات المعاينات كما هي؛ تُحذف الطبقة البصرية وحدها ويُعاد بناؤها في `src/ui`. اللغة تُكشف في `proxy.ts`، والأعمال تُسجَّل في `src/lab/registry.ts` كنقطة تمديد وحيدة.

**Tech Stack:** Next.js 16 (App Router)، React 19، Tailwind 4، `motion`، TypeScript، Playwright، خطوط `@fontsource` محلية، Canvas 2D.

**Spec:** [docs/superpowers/specs/2026-09-23-portfolio-redesign-design.md](../specs/2026-09-23-portfolio-redesign-design.md) — القسم ١٦ يَسبق ما يخالفه في الأقسام ٥ و ٦ و ٧ و ١٤.

## Global Constraints

- العربية افتراضية. الجذر `/` يحوّل إلى `/ar`.
- الاتجاه بخصائص CSS المنطقية (`inline-start` / `inline-end`) لا `left` / `right`.
- اللون يعني حالة لا زينة. غير الحي يبقى رمادياً.
- `prefers-reduced-motion` يوقف كل حركة ويترك حالة نهائية مقروءة. شرط قبول.
- الموقع يُقرأ كاملاً بلا JavaScript.
- تباين AA في الوضعين.
- الخطوط والصور محلية. لا طلب خارجي عند الزيارة.
- لا بيانات وهمية عند الفشل. الفشل يُعلن.
- قيمة تواصل غائبة تعني إخفاء زرها.
- قبل الكود في أي مهمة: اقرأ الدليل المعني في `node_modules/next/dist/docs/`. `middleware.ts` صار `proxy.ts`، و`params` صارت `Promise`.
- الاختبارات كلها Playwright. الدوال الخالصة تُختبر باستيرادها في `.spec.ts`.
- `npm run typecheck` و `npm run lint` يمرّان قبل كل كوميت.
- اختبارات `tests/toolkit-*.spec.ts` العشرة القائمة تبقى خضراء طوال العمل. كسرها يعني أنك عدّلت منطقاً بدل أن تغلّفه.

---

## هيكل الملفات

### يُحذف — الطبقة البصرية وحدها

`src/app/styles/`، `src/app/previews.css`، `src/components/cut-line.tsx`، `src/components/factory.tsx`، `src/components/box-flat.tsx`، `src/components/sections.tsx`، `src/components/interactions.tsx`، `src/components/motion-features.ts`، `src/app/tools/`، `tests/portfolio.spec.ts`، `.github/workflows/pages.yml`، ملفات `*preview*.log` في الجذر.

### يبقى — عمل حقيقي

| المسار | ملاحظة |
|---|---|
| `src/toolkit/` | عشرون ملفاً تعمل. تُغلَّف فقط |
| `src/app/api/tools/cdr/route.ts` | يعمل فعلياً بعد ترك الاستضافة الثابتة |
| `src/content/site.ts` | نصوص حقيقية: المصنع، المحطات، Cut Studio، الدراسات |
| `src/content/previews.ts`, `demo.ts` | محتوى الدراسات الثلاث |
| `src/components/preview.tsx` | مكوّن المعاينة، يُعاد تغليفه |
| `src/app/[locale]/work/[slug]/` | صفحات الدراسات ومعايناتها |
| `tests/toolkit-*.spec.ts` | عشرة ملفات اختبار |

### يُنشأ

`src/content/locales.ts` · `src/lab/registry.ts` · `src/lib/{rate-limit,client-ip,validate,scene}.ts` · `src/ui/{section,nav,footer,hero,hero-scene,fields,lab-section,process,about,contact}.tsx` · `proxy.ts` · `src/app/[locale]/lab/[slug]/page.tsx` · `src/app/api/contact/route.ts` · `src/app/{sitemap,robots}.ts` · `.env.example`

---

## المهام

### المهمة ١: تهيئة النشر وتقليم الطبقة البصرية

**Files:** Modify `next.config.ts`, `package.json`; Delete ما ورد أعلاه; Create `.env.example`; Test `tests/config.spec.ts`

**Interfaces:** Produces — `next.config.ts` بلا `output: export`، وبتحويل دائم من `/tools` إلى `/ar/lab/cut-studio`.

- [ ] **Step 1: اقرأ دليل التحويلات**

```bash
sed -n '1,60p' node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md
```

- [ ] **Step 2: اكتب الاختبار الفاشل** — `tests/config.spec.ts`

```ts
import { test, expect } from "@playwright/test";
import config from "../next.config";

test("no static export branch remains", () => {
  expect(config).not.toHaveProperty("output");
  expect(config).not.toHaveProperty("trailingSlash");
});

test("the old tools path redirects into the lab", async () => {
  const redirects = await config.redirects!();
  const tools = redirects.find(r => r.source === "/tools");
  expect(tools?.destination).toBe("/ar/lab/cut-studio");
  expect(tools?.permanent).toBe(true);
});
```

- [ ] **Step 3: شغّله** — `npx playwright test tests/config.spec.ts` → FAIL

- [ ] **Step 4: اكتب `next.config.ts`**

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480] },
  async redirects() {
    return [
      { source: "/tools", destination: "/ar/lab/cut-studio", permanent: true },
      { source: "/tools/:path*", destination: "/ar/lab/cut-studio", permanent: true },
    ];
  },
};
export default config;
```

- [ ] **Step 5: شغّله** — PASS

- [ ] **Step 6: احذف الطبقة البصرية وأسقط `three`**

```bash
git rm -r --quiet src/app/styles src/app/previews.css src/components/cut-line.tsx src/components/factory.tsx src/components/box-flat.tsx src/components/sections.tsx src/components/interactions.tsx src/components/motion-features.ts src/app/tools tests/portfolio.spec.ts .github/workflows/pages.yml
rm -f ./*preview*.log
npm uninstall three @types/three
```

- [ ] **Step 7: أنشئ `.env.example`**

```sh
# نطاق الإنتاج بلا شرطة أخيرة. بدونه تُحذف canonical و hreflang بدل اختلاق نطاق.
NEXT_PUBLIC_SITE_URL=

# وجهة نموذج التواصل. بدونها يعيد المسار 503 وتعرض الواجهة حالة "غير مفعّل".
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
CONTACT_API_KEY=
```

- [ ] **Step 8: كوميت** — الصفحات مكسورة الآن عمداً؛ تُصلَح في المهام التالية.

```bash
git add -A && git commit -m "chore: drop the static export setup, three.js and the old visual layer"
```

---

### المهمة ٢: طبقة اللغة والتوجيه

**Files:** Create `src/content/locales.ts`, `proxy.ts`; Modify `src/content/site.ts`, `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`; Delete `src/app/page.tsx`; Test `tests/locale.spec.ts`, `tests/routing.spec.ts`

**Interfaces:** Produces — `Locale`, `locales`, `defaultLocale`, `isLocale`, `pickLocale`, `oppositeLocale`. يُعاد تصدير `Locale`, `locales`, `isLocale` من `site.ts` حفاظاً على مستورديها.

- [ ] **Step 1: اقرأ دليل proxy**

```bash
sed -n '1,90p' node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
```

- [ ] **Step 2: اكتب `tests/locale.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { isLocale, pickLocale, oppositeLocale, defaultLocale, locales } from "../src/content/locales";

test("list and default", () => {
  expect([...locales]).toEqual(["ar", "en"]);
  expect(defaultLocale).toBe("ar");
});

test("isLocale accepts only supported values", () => {
  expect(isLocale("ar")).toBe(true);
  expect(isLocale("fr")).toBe(false);
  expect(isLocale("AR")).toBe(false);
  expect(isLocale("")).toBe(false);
});

test("pickLocale reads accept-language and falls back to Arabic", () => {
  expect(pickLocale("en-US,en;q=0.9")).toBe("en");
  expect(pickLocale("en;q=0.4,ar;q=0.9")).toBe("ar");
  expect(pickLocale("fr-FR")).toBe("ar");
  expect(pickLocale(null)).toBe("ar");
});

test("oppositeLocale flips the pair", () => {
  expect(oppositeLocale("ar")).toBe("en");
  expect(oppositeLocale("en")).toBe("ar");
});
```

- [ ] **Step 3: شغّله** → FAIL

- [ ] **Step 4: اكتب `src/content/locales.ts`**

```ts
export type Locale = "ar" | "en";

export const locales = ["ar", "en"] as const satisfies readonly Locale[];
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function oppositeLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map(part => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find(p => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter(entry => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);
  for (const entry of ranked) {
    const base = entry.tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
```

في `src/content/site.ts` استبدل التعريفات الثلاثة في أعلى الملف بإعادة تصدير:

```ts
export type { Locale } from "./locales";
export { locales, isLocale } from "./locales";
```

- [ ] **Step 5: شغّله** — PASS

- [ ] **Step 6: اكتب `tests/routing.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("the root redirects to Arabic", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
});

test("a path without a locale gains one", async ({ page }) => {
  await page.goto("/lab");
  await expect(page).toHaveURL(/\/ar\/lab$/);
});

test("each locale sets lang and dir", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("an unknown locale is a 404", async ({ page }) => {
  expect((await page.goto("/fr"))?.status()).toBe(404);
});

test("api routes are not rewritten", async ({ request }) => {
  const status = (await request.get("/api/tools/cdr")).status();
  expect([307, 308]).not.toContain(status);
});
```

- [ ] **Step 7: شغّله** → FAIL

- [ ] **Step 8: اكتب `proxy.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, pickLocale } from "./src/content/locales";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;
  const locale = pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|icon.svg|images).*)"],
};
```

- [ ] **Step 9: بسّط الجذر واحذف `src/app/page.tsx`**

`src/app/layout.tsx` يصير:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 10: حدّث `src/app/[locale]/layout.tsx`** ليحمل `html` و `dir` و `lang` و `generateStaticParams` ويستورد `../globals.css` فقط، بلا أي استيراد من الملفات المحذوفة.

- [ ] **Step 11: شغّل** — `npx playwright test tests/routing.spec.ts tests/locale.spec.ts` → PASS

- [ ] **Step 12: كوميت**

```bash
git add -A && git commit -m "feat: route locales through proxy with Arabic as the default"
```

---

### المهمة ٣: رموز التصميم

**Files:** Modify `src/app/globals.css`; Test `tests/theme.spec.ts`

**Interfaces:** Produces — `--surface-0..2`, `--text-primary|secondary|muted`, `--live`, `--live-dim`, `--warn`, `--border`, `--border-strong`, `--font-ar|en|mono`, والصنف `.shell`.

- [ ] **Step 1: اكتب `tests/theme.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

const NAMES = ["--surface-0", "--surface-1", "--text-primary", "--text-secondary", "--live", "--warn", "--border"];

test("tokens resolve in both colour schemes", async ({ page }) => {
  for (const scheme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ar");
    const values = await page.evaluate(names =>
      names.map(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()), NAMES);
    for (const value of values) expect(value).not.toBe("");
    expect(values[0]).not.toBe(values[2]);
  }
});

test("each language gets its own font stack", async ({ page }) => {
  await page.goto("/ar");
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Noto Sans Arabic");
  await page.goto("/en");
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Manrope");
});

test("no horizontal overflow at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/ar");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
```

- [ ] **Step 2: شغّله** → FAIL

- [ ] **Step 3: اكتب `src/app/globals.css`**

```css
@import "tailwindcss";
@import "@fontsource-variable/noto-sans-arabic";
@import "@fontsource-variable/manrope";

:root {
  --surface-0: #070b11;
  --surface-1: #0d131c;
  --surface-2: #141d29;
  --text-primary: #eef4fb;
  --text-secondary: #a8b8cb;
  --text-muted: #7e8fa5;
  --live: #3fd9b0;
  --live-dim: #1d7f68;
  --warn: #f0ad4f;
  --border: #1e2a3a;
  --border-strong: #2c3c51;
  --font-ar: "Noto Sans Arabic Variable", system-ui, sans-serif;
  --font-en: "Manrope Variable", system-ui, sans-serif;
  --font-mono: ui-monospace, "Cascadia Mono", "SFMono-Regular", monospace;
  color-scheme: dark;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --surface-0: #f7f9fc;
    --surface-1: #ffffff;
    --surface-2: #eef2f8;
    --text-primary: #0b131d;
    --text-secondary: #3b4c61;
    --text-muted: #5b6d84;
    --live: #0a6e57;
    --live-dim: #8fd8c6;
    --warn: #8a5206;
    --border: #d9e1ec;
    --border-strong: #b9c6d8;
    color-scheme: light;
  }
}

html { background: var(--surface-0); }

body {
  margin: 0;
  background: var(--surface-0);
  color: var(--text-primary);
  font-family: var(--font-en);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

html[lang="ar"] body { font-family: var(--font-ar); }
code, kbd, samp, .mono { font-family: var(--font-mono); }
a { color: var(--live); }
:focus-visible { outline: 2px solid var(--live); outline-offset: 3px; }
.shell { inline-size: min(100% - 2rem, 76rem); margin-inline: auto; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 4: شغّله** — PASS

- [ ] **Step 5: كوميت** — `git add -A && git commit -m "feat: add the living-system design tokens"`

---

### المهمة ٤: سجل المختبر ونصوص القسم الجديدة

**Files:** Create `src/lab/registry.ts`; Modify `src/content/site.ts`; Test `tests/lab-registry.spec.ts`

**Interfaces:** Produces —

- `export type LabStatus = "live" | "building"`
- `export type LabWork = { slug: string; field: string; status: LabStatus; title: Record<Locale, string>; blurb: Record<Locale, string> }`
- `export const labWorks: LabWork[]` — أربعة: `shorts-factory`، `cut-studio`، `design-studies`، `saas-panel`
- `export function getLabWork(slug: string): LabWork | undefined`
- في `copy[locale]` مفاتيح جديدة: `nav2` (المختبر/كيف أعمل/عنّي/تواصل/تبديل اللغة)، `labLabel`، `labTitle`، `labIntro`، `labOpen`، `labLive`، `labSoon`، `fields` (خمسة: `{ slug, title, text }`)، و`contactForm` (`nameLabel`, `emailLabel`, `messageLabel`, `submit`, `sending`, `sent`, `errorValidation`, `errorRate`, `errorServer`, `errorDisabled`, `needsJs`).

- [ ] **Step 1: اكتب `tests/lab-registry.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { labWorks, getLabWork } from "../src/lab/registry";
import { copy } from "../src/content/site";
import { locales } from "../src/content/locales";

test("every field points at a registered work", () => {
  for (const locale of locales)
    for (const field of copy[locale].fields)
      expect(getLabWork(field.slug), field.slug).toBeDefined();
});

test("five fields in each locale", () => {
  for (const locale of locales) expect(copy[locale].fields).toHaveLength(5);
});

test("slugs are unique and url safe", () => {
  const slugs = labWorks.map(w => w.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
});

test("every work is titled in both locales", () => {
  for (const work of labWorks)
    for (const locale of locales) {
      expect(work.title[locale].trim(), `${work.slug}.${locale}`).not.toBe("");
      expect(work.blurb[locale].trim(), `${work.slug}.${locale}`).not.toBe("");
    }
});

test("the three real works are live and only the saas panel is pending", () => {
  expect(getLabWork("shorts-factory")?.status).toBe("live");
  expect(getLabWork("cut-studio")?.status).toBe("live");
  expect(getLabWork("design-studies")?.status).toBe("live");
  expect(getLabWork("saas-panel")?.status).toBe("building");
});

test("both locales expose the same copy keys", () => {
  const keys = (l: "ar" | "en") => Object.keys(copy[l]).sort();
  expect(keys("ar")).toEqual(keys("en"));
});
```

- [ ] **Step 2: شغّله** → FAIL

- [ ] **Step 3: اكتب `src/lab/registry.ts`** — النصوص مأخوذة من الواقع، لا مخترعة:

```ts
import type { Locale } from "../content/locales";

export type LabStatus = "live" | "building";

export type LabWork = {
  slug: string;
  field: string;
  status: LabStatus;
  title: Record<Locale, string>;
  blurb: Record<Locale, string>;
};

export const labWorks: LabWork[] = [
  {
    slug: "shorts-factory",
    field: "systems",
    status: "live",
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
```

- [ ] **Step 4: أضف المفاتيح الجديدة إلى `copy.ar` و `copy.en` في `src/content/site.ts`**

المجالات الخمسة في `copy.ar.fields`:

```ts
fields: [
  { slug: "cut-studio", title: "برمجة المواقع", text: "مواقع وتطبيقات ويب بـ Next.js و React و TypeScript: سريعة، ثنائية اللغة، وتعمل على الهاتف أولاً." },
  { slug: "design-studies", title: "التصميم", text: "تصميم بصري وواجهات، وتصميم للتصنيع والقص بالليزر: من الفيكتور النظيف إلى قطعة تُركّب." },
  { slug: "shorts-factory", title: "أنظمة الأتمتة", text: "أنظمة تربط الأدوات ببعضها وتعمل على جدول، وتُكمل العمل دون أن أقف فوقها." },
  { slug: "shorts-factory", title: "تكاملات API", text: "ربط الخدمات ببعضها: مفاتيح آمنة، ومسار بديل عند التعثّر، وفشل معلن لا صامت." },
  { slug: "saas-panel", title: "منتجات SaaS", text: "لوحات تحكم ومنتجات بحالة حقيقية: بيانات تُقرأ وتُكتب وتبقى." },
],
```

واكتب مقابلها الإنجليزي، وبقية المفاتيح المذكورة في Interfaces، بنفس التهجئة في اللغتين.

- [ ] **Step 5: شغّله** — PASS

- [ ] **Step 6: كوميت** — `git add -A && git commit -m "feat: register the lab works and add the new section copy"`

---

### المهمة ٥: الهيكل — التنقل والتذييل وغلاف القسم

**Files:** Create `src/ui/section.tsx`, `src/ui/nav.tsx`, `src/ui/footer.tsx`; Modify `src/app/[locale]/layout.tsx`; Test `tests/shell.spec.ts`

**Interfaces:** Produces — `Section({ id, label, title, children })`، `Nav({ locale })`، `Footer({ locale })`. أصناف يعتمدها الاختبار: `.locale-switch`. التنقل روابط لا أزرار، فيعمل بلا JavaScript.

- [ ] **Step 1: اكتب `tests/shell.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("the nav holds four links and no Cut Studio entry", async ({ page }) => {
  await page.goto("/ar");
  const nav = page.locator("nav");
  await expect(nav).not.toContainText("Cut Studio");
  for (const id of ["#lab", "#process", "#about", "#contact"])
    await expect(nav.locator(`a[href='${id}']`)).toHaveCount(1);
});

test("the locale switch keeps you on the same page", async ({ page }) => {
  await page.goto("/ar");
  await page.locator(".locale-switch").click();
  await expect(page).toHaveURL(/\/en$/);
  await page.locator(".locale-switch").click();
  await expect(page).toHaveURL(/\/ar$/);
});

test("a skip link comes first in tab order", async ({ page }) => {
  await page.goto("/ar");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#main");
});
```

- [ ] **Step 2: شغّله** → FAIL

- [ ] **Step 3: اكتب المكوّنات الثلاثة** — `Section` بغلاف `.shell` وعنوان فرعي بلون `--live` وخط مونوسبيس؛ `Nav` لاصق أعلى الصفحة بروابط المرساة الأربع ومبدّل اللغة كرابط `Link` إلى `/${oppositeLocale(locale)}`؛ `Footer` باسم عمر والسنة وملاحظة التذييل. كل الألوان من الرموز، وكل الحواف بخصائص منطقية.

- [ ] **Step 4: ركّبها في `src/app/[locale]/layout.tsx`** داخل `<body>` حول `{children}`، وأضف `generateMetadata` تقرأ `copy[locale].title` و `description`.

- [ ] **Step 5: شغّله** — PASS

- [ ] **Step 6: كوميت** — `git add -A && git commit -m "feat: add the site shell with four nav links and a locale switch"`

---

### المهمة ٦: مشهد النظام الحي

**Files:** Create `src/lib/scene.ts`, `src/ui/hero-scene.tsx`, `src/ui/hero.tsx`; Modify `src/app/[locale]/page.tsx`; Test `tests/scene.spec.ts`, `tests/motion.spec.ts`

**Interfaces:** Produces — `SceneNode`, `SceneEdge`, `Pulse`, `Scene`, `createScene(labels: string[]): Scene`, `stepScene(scene, deltaMs): Scene`, `HeroScene({ labels })`, `Hero({ locale })`.

العقد هي محطات المصنع الست الحقيقية من `copy[locale].stations`، والحواف تصل كل محطة بالتي تليها بترتيب خط الإنتاج — لا رسم تجريدي.

- [ ] **Step 1: اكتب `tests/scene.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { createScene, stepScene } from "../src/lib/scene";

const labels = ["PLAN", "WRITE", "CHECK", "VOICE", "RENDER", "PUBLISH"];

test("a node per station, chained in production order", () => {
  const scene = createScene(labels);
  expect(scene.nodes).toHaveLength(6);
  expect(scene.nodes.map(n => n.label)).toEqual(labels);
  expect(scene.edges).toHaveLength(5);
  scene.edges.forEach((edge, index) => {
    expect(edge.from).toBe(scene.nodes[index].id);
    expect(edge.to).toBe(scene.nodes[index + 1].id);
  });
});

test("coordinates stay inside the unit square", () => {
  for (const node of createScene(labels).nodes) {
    expect(node.x).toBeGreaterThanOrEqual(0);
    expect(node.x).toBeLessThanOrEqual(1);
    expect(node.y).toBeGreaterThanOrEqual(0);
    expect(node.y).toBeLessThanOrEqual(1);
  }
});

test("stepping advances pulses and wraps without losing any", () => {
  let scene = createScene(labels);
  const count = scene.pulses.length;
  expect(count).toBeGreaterThan(0);
  const before = scene.pulses[0].progress;
  scene = stepScene(scene, 100);
  expect(scene.pulses).toHaveLength(count);
  expect(scene.pulses[0].progress).not.toBe(before);
  for (let i = 0; i < 300; i++) scene = stepScene(scene, 100);
  expect(scene.pulses).toHaveLength(count);
  for (const pulse of scene.pulses) {
    expect(pulse.progress).toBeGreaterThanOrEqual(0);
    expect(pulse.progress).toBeLessThanOrEqual(1);
    expect(pulse.edge).toBeGreaterThanOrEqual(0);
    expect(pulse.edge).toBeLessThan(scene.edges.length);
  }
});

test("stepping is pure", () => {
  const scene = createScene(labels);
  const snapshot = JSON.stringify(scene);
  stepScene(scene, 250);
  expect(JSON.stringify(scene)).toBe(snapshot);
});

test("a single label produces no edges and does not throw", () => {
  const scene = createScene(["ONLY"]);
  expect(scene.edges).toHaveLength(0);
  expect(() => stepScene(scene, 100)).not.toThrow();
});
```

- [ ] **Step 2: شغّله** → FAIL

- [ ] **Step 3: اكتب `src/lib/scene.ts`**

```ts
export type SceneNode = { id: string; x: number; y: number; label: string };
export type SceneEdge = { from: string; to: string };
export type Pulse = { edge: number; progress: number };
export type Scene = { nodes: SceneNode[]; edges: SceneEdge[]; pulses: Pulse[] };

const PULSE_PER_SECOND = 0.32;

export function createScene(labels: string[]): Scene {
  const nodes: SceneNode[] = labels.map((label, index) => {
    const t = labels.length === 1 ? 0.5 : index / (labels.length - 1);
    return {
      id: `n${index}`,
      label,
      x: 0.08 + t * 0.84,
      y: 0.5 + Math.sin(t * Math.PI * 2) * 0.22,
    };
  });

  const edges: SceneEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++)
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id });

  const pulses: Pulse[] = edges.map((_, index) => ({
    edge: index,
    progress: edges.length === 0 ? 0 : (index / edges.length) % 1,
  }));

  return { nodes, edges, pulses };
}

export function stepScene(scene: Scene, deltaMs: number): Scene {
  if (scene.edges.length === 0) return { ...scene, pulses: [...scene.pulses] };
  const advance = (deltaMs / 1000) * PULSE_PER_SECOND;
  return {
    nodes: scene.nodes,
    edges: scene.edges,
    pulses: scene.pulses.map(pulse => {
      const next = pulse.progress + advance;
      return next <= 1
        ? { edge: pulse.edge, progress: next }
        : { edge: (pulse.edge + 1) % scene.edges.length, progress: next % 1 };
    }),
  };
}
```

- [ ] **Step 4: شغّله** — PASS

- [ ] **Step 5: اكتب `tests/motion.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("the hero renders a canvas", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("canvas.hero-scene")).toBeVisible();
});

test("reduced motion leaves a still frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar");
  const canvas = page.locator("canvas.hero-scene");
  await expect(canvas).toBeVisible();
  const first = await canvas.screenshot();
  await page.waitForTimeout(700);
  expect(Buffer.compare(first, await canvas.screenshot())).toBe(0);
});

test("the headline stays readable over the scene", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toBeVisible();
});

test("the scene does not throw on any viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/ar");
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
});
```

- [ ] **Step 6: شغّله** → FAIL

- [ ] **Step 7: اكتب `src/ui/hero-scene.tsx`** — مكوّن عميل، `aria-hidden="true"`، يقرأ الألوان من الرموز عبر `getComputedStyle`، يرسم الحواف ثم النبضات ثم العقد وتسمياتها، يتعامل مع `devicePixelRatio` و `ResizeObserver`، ولا يبدأ حلقة `requestAnimationFrame` إطلاقاً عند `prefers-reduced-motion: reduce` فتبقى الإطارة الأولى ساكنة ومقروءة. ينظّف الحلقة والمراقب في دالة الإرجاع.

- [ ] **Step 8: اكتب `src/ui/hero.tsx`** — حاوية `position: relative` تضم المشهد خلف نص في `z-index: 1`. النص من `copy[locale]`: `heroEyebrow` و `heroLines` كـ `h1` و `heroLead`، وزرّان إلى `#lab` و `#contact`. التسميات المُمرَّرة للمشهد هي `copy[locale].stations.map(s => s.code)`.

- [ ] **Step 9: اربطه في `src/app/[locale]/page.tsx`** كأول عنصر في `<main id="main">`.

- [ ] **Step 10: شغّل** — `npx playwright test tests/scene.spec.ts tests/motion.spec.ts` → PASS

- [ ] **Step 11: كوميت** — `git add -A && git commit -m "feat: add the hero scene driven by the real factory pipeline"`

---

### المهمة ٧: المجالات والمختبر وبقية الأقسام

**Files:** Create `src/ui/fields.tsx`, `src/ui/lab-section.tsx`, `src/ui/process.tsx`, `src/ui/about.tsx`; Modify `src/app/[locale]/page.tsx`; Test `tests/page.spec.ts`

**Interfaces:** Produces — `Fields({ locale })`، `LabSection({ locale })`، `Process({ locale })`، `About({ locale })`. أصناف: `.field-card`، `.lab-card` مع `data-status` و `data-slug`. معرّفات: `#lab`، `#process`، `#about`.

- [ ] **Step 1: اكتب `tests/page.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { copy } from "../src/content/site";
import { labWorks } from "../src/lab/registry";

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: the page leads with Omar`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(copy[locale].heroLines[0]);
  });

  test(`${locale}: five fields and every lab work render`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator(".field-card")).toHaveCount(5);
    await expect(page.locator(".lab-card")).toHaveCount(labWorks.length);
  });

  test(`${locale}: Cut Studio sits inside the lab`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("#lab")).toContainText("Cut Studio");
  });

  test(`${locale}: the factory is presented as a real running system`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator(".lab-card[data-slug='shorts-factory']")).toHaveAttribute("data-status", "live");
  });

  test(`${locale}: no horizontal overflow at any width`, async ({ page }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      for (const id of ["lab", "process", "about", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `${id} ${width}`).toBe(false);
      }
    }
  });
}

test("a work still being built says so", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator(".lab-card[data-status='building']").first()).toContainText(copy.ar.labSoon);
});
```

- [ ] **Step 2: شغّله** → FAIL

- [ ] **Step 3: اكتب الأقسام الأربعة** — `Fields` شبكة بطاقات من `copy[locale].fields`، كل بطاقة رابط إلى `/${locale}/lab/${field.slug}`. `LabSection` داخل `Section` ببطاقات من `labWorks` تحمل `data-slug` و `data-status`، وشارة `labLive` بلون `--live` أو `labSoon` بلون `--text-muted`، ورابط «افتح العمل» للأعمال الحية فقط. `Process` من `copy[locale].principles` و`About` من `heroLead` و`profile.location`. أضف قسم `#contact` فارغاً مؤقتاً يُستبدل في المهمة ٩.

- [ ] **Step 4: ركّبها في `page.tsx`** بالترتيب: Hero، Fields، LabSection، Process، About، Contact.

- [ ] **Step 5: شغّل** — `npx playwright test tests/page.spec.ts && npm run typecheck && npm run lint` → PASS

- [ ] **Step 6: كوميت** — `git add -A && git commit -m "feat: build the home page around Omar with the lab holding the real work"`

---

### المهمة ٨: صفحات المختبر

**Files:** Create `src/app/[locale]/lab/[slug]/page.tsx`, `src/lab/shorts-factory/view.tsx`, `src/lab/cut-studio/view.tsx`, `src/lab/design-studies/view.tsx`; Modify `src/app/[locale]/work/[slug]/page.tsx` — الروابط فقط; Test `tests/lab.spec.ts`

**Interfaces:** Consumes — `getLabWork`, `labWorks`, `copy`, `projects` من `site.ts`، `SitePreview` من `src/components/preview.tsx`، ومكوّن الأدوات المصدَّر من `src/toolkit/toolkit.tsx`.

- [ ] **Step 1: اعرف نقطة دخول الأدوات ومكوّن المعاينة**

```bash
grep -n "^export" src/toolkit/toolkit.tsx src/components/preview.tsx | head
```

- [ ] **Step 2: اكتب `tests/lab.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("the old tools path redirects into the lab", async ({ page }) => {
  await page.goto("/tools");
  await expect(page).toHaveURL(/\/ar\/lab\/cut-studio$/);
});

for (const slug of ["shorts-factory", "cut-studio", "design-studies"]) {
  test(`${slug} opens in both locales with no page error`, async ({ page }) => {
    for (const locale of ["ar", "en"] as const) {
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(`/${locale}/lab/${slug}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(errors, `${slug} ${locale}`).toEqual([]);
    }
  });
}

test("the factory page lists all six real stations", async ({ page }) => {
  await page.goto("/ar/lab/shorts-factory");
  await expect(page.locator(".station")).toHaveCount(6);
  for (const code of ["PLAN", "WRITE", "CHECK", "VOICE", "RENDER", "PUBLISH"])
    await expect(page.locator(".station")).toContainText(code);
});

test("the design studies page links every study", async ({ page }) => {
  await page.goto("/ar/lab/design-studies");
  await expect(page.locator(".study")).toHaveCount(3);
});

test("a work still being built is not served as a page", async ({ page }) => {
  expect((await page.goto("/ar/lab/saas-panel"))?.status()).toBe(404);
});

test("an unknown slug is a 404", async ({ page }) => {
  expect((await page.goto("/ar/lab/nope"))?.status()).toBe(404);
});

test("the CDR route exists on this runtime", async ({ request }) => {
  expect((await request.post("/api/tools/cdr", { data: {} })).status()).not.toBe(404);
});
```

- [ ] **Step 3: شغّله** → FAIL

- [ ] **Step 4: اكتب العروض الثلاثة**

`shorts-factory/view.tsx` — يصيَّر على الخادم: المحطات الست من `copy[locale].stations` بترتيبها، كل واحدة بصنف `.station` ورمزها وعنوانها ونصها ووسومها، ثم جانب المراجعة من `oversightTitle` و `oversightText` و `oversightTags`، ورابط القناة فقط إن كان `profile.links.youtube` رابط https صالحاً.

`cut-studio/view.tsx` — مكوّن عميل يغلّف مكوّن الأدوات القائم ويمرر اللغة كما يستقبلها. لا تعديل داخل `src/toolkit`.

`design-studies/view.tsx` — شبكة من `projects` تستخدم `SitePreview` القائم، وكل بطاقة `.study` ترتبط بـ `/${locale}/work/${project.slug}`، مع تنبيه صريح أنها دراسات لا مشاريع عملاء من `copy[locale].concept`.

- [ ] **Step 5: اكتب `src/app/[locale]/lab/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getLabWork, labWorks } from "../../../../lab/registry";
import { isLocale, locales } from "../../../../content/locales";

export function generateStaticParams() {
  return locales.flatMap(locale =>
    labWorks.filter(work => work.status === "live").map(work => ({ locale, slug: work.slug })),
  );
}

export async function generateMetadata({ params }: PageProps<"/[locale]/lab/[slug]">) {
  const { locale, slug } = await params;
  const work = getLabWork(slug);
  if (!work || !isLocale(locale)) return {};
  return { title: work.title[locale], description: work.blurb[locale] };
}

export default async function LabPage({ params }: PageProps<"/[locale]/lab/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const work = getLabWork(slug);
  if (!work || work.status !== "live") notFound();
  // اختر العرض بحسب work.slug
}
```

شرط `status !== "live"` هو ما يجعل لوحة SaaS تعطي 404 بدل صفحة فارغة.

- [ ] **Step 6: حدّث روابط العودة في `work/[slug]`** لتشير إلى `/${locale}/lab/design-studies` بدل قسم الأعمال القديم.

- [ ] **Step 7: شغّل** — `npx playwright test tests/lab.spec.ts tests/toolkit-ui.spec.ts tests/toolkit-lang.spec.ts` → PASS

- [ ] **Step 8: كوميت** — `git add -A && git commit -m "feat: give every real work its own lab page"`

---

### المهمة ٩: التواصل

**Files:** Create `src/lib/rate-limit.ts`, `src/lib/client-ip.ts`, `src/lib/validate.ts`, `src/app/api/contact/route.ts`, `src/ui/contact.tsx`; Modify `src/app/[locale]/page.tsx`; Test `tests/rate-limit.spec.ts`, `tests/validate.spec.ts`, `tests/contact.spec.ts`

**Interfaces:** Produces — `RateLimitResult`, `rateLimit(key, { limit, windowMs }, now?)`, `resetRateLimit()`, `clientIp(request)`, `ContactInput`, `ValidationResult`, `validateContact(raw)`, `Contact({ locale })`.

- [ ] **Step 1: اكتب `tests/rate-limit.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { rateLimit, resetRateLimit } from "../src/lib/rate-limit";

test.beforeEach(() => resetRateLimit());

test("requests under the limit count down", () => {
  const o = { limit: 3, windowMs: 60_000 };
  expect(rateLimit("a", o, 0)).toMatchObject({ ok: true, remaining: 2 });
  expect(rateLimit("a", o, 1)).toMatchObject({ ok: true, remaining: 1 });
  expect(rateLimit("a", o, 2)).toMatchObject({ ok: true, remaining: 0 });
});

test("the request over the limit is refused with a delay", () => {
  const o = { limit: 2, windowMs: 60_000 };
  rateLimit("b", o, 0); rateLimit("b", o, 0);
  const blocked = rateLimit("b", o, 10_000);
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfterSeconds).toBe(50);
});

test("keys are independent", () => {
  const o = { limit: 1, windowMs: 60_000 };
  expect(rateLimit("c", o, 0).ok).toBe(true);
  expect(rateLimit("d", o, 0).ok).toBe(true);
  expect(rateLimit("c", o, 0).ok).toBe(false);
});

test("the window rolls over", () => {
  const o = { limit: 1, windowMs: 1_000 };
  expect(rateLimit("e", o, 0).ok).toBe(true);
  expect(rateLimit("e", o, 500).ok).toBe(false);
  expect(rateLimit("e", o, 1_001).ok).toBe(true);
});
```

- [ ] **Step 2: شغّله** → FAIL، ثم اكتب `src/lib/rate-limit.ts` بنافذة في الذاكرة عبر `Map`، مع تعليق يوضّح أن الحد لكل نسخة تشغيل لا عالمي، وأن ذلك كافٍ لنموذج تواصل. شغّله → PASS

- [ ] **Step 3: اكتب `tests/validate.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { validateContact } from "../src/lib/validate";

const good = { name: "Omar", email: "a@b.co", message: "I need an automation system for orders." };

test("a complete submission passes and is trimmed", () => {
  const result = validateContact({ ...good, name: "  Omar  " });
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.value.name).toBe("Omar");
});

test("missing or malformed fields are refused", () => {
  expect(validateContact(null).ok).toBe(false);
  expect(validateContact({}).ok).toBe(false);
  expect(validateContact({ ...good, name: "" }).ok).toBe(false);
  expect(validateContact({ ...good, email: "not-an-email" }).ok).toBe(false);
  expect(validateContact({ ...good, message: "too short" }).ok).toBe(false);
  expect(validateContact({ ...good, name: 42 }).ok).toBe(false);
});

test("oversized fields are refused, not truncated", () => {
  expect(validateContact({ ...good, message: "x".repeat(5001) }).ok).toBe(false);
  expect(validateContact({ ...good, name: "x".repeat(201) }).ok).toBe(false);
});
```

- [ ] **Step 4: شغّله** → FAIL، ثم اكتب `validate.ts` و `client-ip.ts`. شغّله → PASS

- [ ] **Step 5: اكتب `tests/contact.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("a malformed submission is refused with 400", async ({ request }) => {
  expect((await request.post("/api/contact", { data: { name: "", email: "x", message: "" } })).status()).toBe(400);
});

test("a flood is rate limited with 429 and a retry header", async ({ request }) => {
  const payload = { name: "Flood", email: "f@b.co", message: "This is a long enough message body." };
  let limited = false;
  for (let i = 0; i < 12; i++) {
    const response = await request.post("/api/contact", { data: payload });
    if (response.status() === 429) {
      expect(response.headers()["retry-after"]).toBeDefined();
      limited = true;
      break;
    }
  }
  expect(limited).toBe(true);
});

test("the contact form renders in both locales", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}#contact`);
    await expect(page.locator("#contact form")).toBeVisible();
    await expect(page.locator("#contact input[name='email']")).toBeVisible();
  }
});

test("an empty submission shows a message, never a false success", async ({ page }) => {
  await page.goto("/ar#contact");
  await page.locator("#contact button[type='submit']").click();
  const alert = page.locator("#contact [role='alert']");
  await expect(alert).toBeVisible();
  await expect(alert).not.toContainText(/وصلت|sent/i);
});
```

- [ ] **Step 6: شغّله** → FAIL

- [ ] **Step 7: اكتب المسار** — يفحص الحد أولاً (خمس رسائل لكل عشر دقائق) فيعيد 429 مع `retry-after`، ثم يحلّل الجسم فيعيد 400 عند الفشل، ثم يتحقق فيعيد 400 عند الفشل، ثم يعيد 503 صراحة ما لم تُضبط `CONTACT_TO_EMAIL` و `CONTACT_API_KEY`. لا رسالة نجاح قبل إرسال فعلي.

- [ ] **Step 8: اكتب `src/ui/contact.tsx`** — مكوّن عميل. يعرض واتساب والبريد فقط عند توفّرهما، وإلا رسالة `pendingContact`. النموذج يرسل عبر `fetch` ويترجم 400 و 429 و 503 إلى رسائلها من `contactForm`، و`<noscript>` يعرض `needsJs`. الزر يُعطَّل أثناء الإرسال فقط. الأسئلة في `<details>` أسفل النموذج.

- [ ] **Step 9: استبدل قسم `#contact` النائب** في `page.tsx` بالمكوّن.

- [ ] **Step 10: شغّل** — الملفات الثلاثة → PASS

- [ ] **Step 11: كوميت** — `git add -A && git commit -m "feat: add the contact section with server validation and rate limiting"`

---

### المهمة ١٠: البيانات الوصفية وخريطة الموقع

**Files:** Create `src/app/sitemap.ts`, `src/app/robots.ts`; Modify `src/app/[locale]/layout.tsx`; Test `tests/seo.spec.ts`

- [ ] **Step 1: اكتب `tests/seo.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { profile } from "../src/content/site";

test("each locale carries its own title", async ({ page }) => {
  await page.goto("/ar");
  const arTitle = await page.title();
  await page.goto("/en");
  expect(await page.title()).not.toBe(arTitle);
  await expect(page.locator("meta[name='description']")).toHaveCount(1);
});

test("hreflang appears only when a site url is configured", async ({ page }) => {
  await page.goto("/ar");
  const alternates = page.locator("link[rel='alternate'][hreflang]");
  await expect(alternates).toHaveCount(profile.siteUrl ? 2 : 0);
});

test("sitemap and robots are served", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
});
```

- [ ] **Step 2: شغّله** → FAIL

- [ ] **Step 3: وسّع `generateMetadata`** ليضيف `metadataBase` و `alternates` عند توفّر `profile.siteUrl` فقط، واكتب `sitemap.ts` يضم صفحتي اللغة وصفحات الأعمال الحية فقط، و`robots.ts` يمنع `/api/`.

- [ ] **Step 4: شغّله** — PASS

- [ ] **Step 5: كوميت** — `git add -A && git commit -m "feat: add locale metadata, sitemap and robots"`

---

### المهمة ١١: إمكانية الوصول والعمل بلا JavaScript

**Files:** Test `tests/a11y.spec.ts`; Modify أي ملف يكشفه الاختبار

- [ ] **Step 1: اكتب `tests/a11y.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("without javascript", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of ["ar", "en"] as const) {
    test(`${locale}: every section is still readable`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("h1")).toBeVisible();
      for (const id of ["lab", "process", "about", "contact"])
        await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(".lab-card").first()).toBeVisible();
    });
  }

  test("the factory stations are readable without scripts", async ({ page }) => {
    await page.goto("/ar/lab/shorts-factory");
    await expect(page.locator(".station")).toHaveCount(6);
  });

  test("the locale switch is a plain link", async ({ page }) => {
    await page.goto("/ar");
    await page.locator(".locale-switch").click();
    await expect(page).toHaveURL(/\/en$/);
  });
});

test("exactly one h1 and no skipped heading level", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toHaveCount(1);
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3")].map(h => Number(h.tagName[1])));
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});

test("keyboard focus reaches the nav and the contact form", async ({ page }) => {
  await page.goto("/ar");
  const seen: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => document.activeElement?.tagName ?? ""));
  }
  expect(seen).toContain("A");
  expect(seen.some(tag => ["INPUT", "TEXTAREA", "BUTTON"].includes(tag))).toBe(true);
});

test("every image and canvas is labelled or explicitly decorative", async ({ page }) => {
  for (const path of ["/ar", "/ar/lab/design-studies", "/ar/lab/shorts-factory"]) {
    await page.goto(path);
    const unlabelled = await page.evaluate(() =>
      [...document.querySelectorAll("img, canvas")].filter(
        el => !el.getAttribute("alt") && el.getAttribute("aria-hidden") !== "true" && !el.getAttribute("aria-label"),
      ).length);
    expect(unlabelled, path).toBe(0);
  }
});

test("no console errors on the main routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  for (const path of ["/ar", "/en", "/ar/lab/cut-studio", "/ar/lab/shorts-factory", "/ar/lab/design-studies"]) {
    await page.goto(path);
    await page.waitForTimeout(400);
  }
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: شغّله وأصلح كل فشل في مصدره** — ترتيب عناوين مكسور يُصلَح في مكوّن القسم؛ قسم غير ظاهر بلا JavaScript يعني اعتماداً على حالة عميل يجب رفعه إلى الخادم؛ لوحة Canvas بلا تسمية تحتاج `aria-hidden="true"`.

- [ ] **Step 3: افحص التباين يدوياً** — شغّل `npm run dev`، وافحص في الوضعين أن `--text-secondary` و `--text-muted` على `--surface-0` و `--surface-1` لا تقلّ عن 4.5:1. عدّل الرموز وأعد `tests/theme.spec.ts`.

- [ ] **Step 4: شغّل كل شيء** — `npm run typecheck && npm run lint && npm test` → كل الاختبارات خضراء، بما فيها العشرة القائمة لمجموعة الأدوات.

- [ ] **Step 5: كوميت** — `git add -A && git commit -m "test: cover no-javascript reading, heading order, focus and labelling"`

---

### المهمة ١٢: التوثيق والنشر على Vercel

**Files:** Modify `README.md`

- [ ] **Step 1: تحقق أن بناء الإنتاج ينجح** — `npm run build`

- [ ] **Step 2: أعد كتابة `README.md`** — بورتفوليو شخصي؛ المختبر ومحتوياته الأربعة؛ التشغيل المحلي؛ متغيرات البيئة من `.env.example`؛ كيفية إضافة عمل إلى `src/lab/registry.ts`. احذف كل ذكر لـ GitHub Pages وللقيود الثابتة.

- [ ] **Step 3: اربط المشروع بـ Vercel** — استيراد المستودع، كشف تلقائي لـ Next.js، فرع الإنتاج `main`، ثم اضبط متغيرات `.env.example` للإنتاج والمعاينة. اترك مفاتيح التواصل فارغة حتى تتوفر: المسار يعيد 503 والواجهة تعرض «غير مفعّل»، وهو السلوك الصحيح.

- [ ] **Step 4: بعد أول نشر** — ضع `NEXT_PUBLIC_SITE_URL` بالنطاق الفعلي بلا شرطة أخيرة وأعد النشر حتى تظهر `canonical` و `hreflang`.

- [ ] **Step 5: شغّل الاختبارات ضد النشر**

```bash
PORTFOLIO_TEST_URL=https://<domain> npx playwright test tests/routing.spec.ts tests/page.spec.ts tests/lab.spec.ts tests/seo.spec.ts
```

- [ ] **Step 6: كوميت** — `git add -A && git commit -m "docs: document the Vercel deployment and how to add a lab work"`

---

## المراجعة الذاتية

**تغطية المواصفة:**

| قسم المواصفة | المهمة |
|---|---|
| ١٦ المجالات الخمسة | ٤، ٧ |
| ١٦ المختبر بأعماله الأربعة | ٤، ٧، ٨ |
| ١٦ مشهد البطل من محطات المصنع | ٦ |
| ١٦ ما يبقى وما يُحذف | ١، ٨ |
| ٣ القرارات (Vercel، اللغتان، Canvas) | ١، ٢، ٦، ١٢ |
| ٤ الحزمة وإسقاط `three` | ١ |
| ٨ الأمان، محصوراً في التواصل | ٩ |
| ٩ اللغة البصرية | ٣، ٥، ٦، ٧ |
| ١٠ الأداء وإمكانية الوصول | ١١ |
| ١١ معالجة الأخطاء | ٩ |
| ١٢ الاختبار | كل مهمة، وتُجمع في ١١ |
| ١٤ المدخلات المطلوبة | ١ و ١٢ عبر `.env.example` |

**فجوة مقصودة:** خدمة إرسال البريد مؤجّلة بقرار المواصفة (القسم ١٥). المهمة ٩ تبني كل شيء عداها وتفشل بـ 503 معلنة. وصل الخدمة تغيير من خطوة واحدة في `src/app/api/contact/route.ts`.

**خارج النطاق:** لوحة SaaS مسجَّلة بحالة `building` وصفحتها 404. تُبنى بخطة مستقلة تقلب حالتها وتضيف عرضها في المهمة ٨.

**تناسق الأسماء:** `Locale`, `locales`, `defaultLocale`, `isLocale`, `pickLocale`, `oppositeLocale`, `copy`, `profile`, `projects`, `labWorks`, `getLabWork`, `LabWork`, `LabStatus`, `rateLimit`, `resetRateLimit`, `RateLimitResult`, `clientIp`, `validateContact`, `ContactInput`, `ValidationResult`, `createScene`, `stepScene`, `Scene`, `SceneNode`, `SceneEdge`, `Pulse`, `HeroScene`, `Hero`, `Fields`, `LabSection`, `Process`, `About`, `Contact`, `Section`, `Nav`, `Footer` — مستخدمة بنفس التهجئة في كل مهمة تعتمد عليها.
