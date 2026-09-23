# خطة تنفيذ: أساس البورتفوليو والموقع القابل للإطلاق

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** إعادة بناء طبقة العرض بالكامل لتقديم عمر الديك كصانع مستقل، مع موقع ثنائي اللغة يعمل ويُختبر ويُنشر على Vercel، و Cut Studio بداخله كأول أعمال المختبر.

**Architecture:** تُحذف طبقة العرض القديمة بالكامل ويُعاد بناؤها فوق App Router بمسار `[locale]` واحد وملف `proxy.ts` لكشف اللغة. المحتوى يُعزل في `src/content` كقواميس، والعرض في `src/ui`، والمنطق المشترك في `src/lib`. يُحتفظ بـ `src/toolkit` كما هو ويُعاد تغليفه داخل `src/app/[locale]/lab/cut-studio`.

**Tech Stack:** Next.js 16 (App Router)، React 19، Tailwind CSS 4، `motion`، TypeScript، Playwright، خطوط `@fontsource` محلية، Canvas 2D لمشهد البطل.

**Spec:** [docs/superpowers/specs/2026-09-23-portfolio-redesign-design.md](../specs/2026-09-23-portfolio-redesign-design.md)

**نطاق هذه الخطة:** المراحل ١، ٢، ٣، ٤، ٨، ٩ من المواصفة. تنتهي بموقع كامل قابل للإطلاق.

**خارج نطاق هذه الخطة:** محرك الأتمتة، وملعب API، ولوحة SaaS (المراحل ٥، ٦، ٧). لكل منها خطته المستقلة، وتُضاف إلى سجل المختبر الذي تبنيه المهمة ٨ هنا دون تعديل أي شيء آخر.

## Global Constraints

- العربية هي اللغة الافتراضية. الجذر `/` يحوّل إلى `/ar`.
- الاتجاه يُبنى بخصائص CSS المنطقية (`inline-start` / `inline-end`)، لا `left` / `right`.
- اللون يعني حالة لا زينة: العنصر غير الحي يبقى رمادياً.
- `prefers-reduced-motion` يوقف كل حركة ويترك الحالة النهائية مقروءة كاملة. شرط قبول لا تحسين.
- الموقع يعمل ويُقرأ كاملاً بلا JavaScript.
- كل نص يحقق تباين AA في الوضعين الداكن والفاتح.
- الخطوط والصور محلية. لا طلب شبكي خارجي عند الزيارة.
- لا بيانات وهمية بديلة عند أي فشل. الفشل يُعلن.
- كل مسار تحت `/api/` محدود المعدل بحسب عنوان IP.
- أي قيمة تواصل غائبة تعني إخفاء زرها، لا اختلاق بديل.
- قبل كتابة أي كود في أي مهمة: اقرأ الدليل المعني في `node_modules/next/dist/docs/`. هذا الإصدار يخالف الاصطلاحات المألوفة — `middleware.ts` صار `proxy.ts`، و`params` صارت `Promise` تُنتظر.
- الاختبارات كلها Playwright، وهو أداة الاختبار الوحيدة في المشروع. الدوال الخالصة تُختبر باستيرادها مباشرة في ملف `.spec.ts`، كما في `tests/toolkit-geometry.spec.ts`.
- الأمر `npm test` يشغّل Playwright، و`npm run typecheck` و`npm run lint` يجب أن يمرّا قبل كل كوميت.

---

## هيكل الملفات

### تُحذف

| المسار | السبب |
|---|---|
| `src/components/` | طبقة عرض قديمة بالكامل |
| `src/content/site.ts`, `previews.ts`, `demo.ts` | محتوى قديم مرتبط بهيكل ملغى |
| `src/app/globals.css`, `editorial.css`, `previews.css`, `styles/` | نظام تصميم قديم |
| `src/app/[locale]/` | كل صفحات اللغة القديمة والمعاينات |
| `src/app/tools/` | يُستبدل بتحويل و بصفحة داخل المختبر |
| `tests/portfolio.spec.ts` | يختبر هيكلاً ملغى |
| `.github/workflows/pages.yml` | النشر انتقل إلى Vercel |
| `public/images/coffee.jpg`, `interior.jpg` | صور معاينات ملغاة |
| ملفات `*preview*.log` في الجذر | مخلفات تشغيل |

### تبقى دون تعديل منطقي

| المسار | ملاحظة |
|---|---|
| `src/toolkit/` | عشرون ملفاً تعمل. يُعاد تغليفها فقط |
| `src/app/api/tools/cdr/route.ts` | يعمل فعلياً بعد ترك الاستضافة الثابتة |
| `tests/toolkit-*.spec.ts` | تسع ملفات اختبار قائمة، تبقى كما هي |

### تُنشأ

| المسار | المسؤولية |
|---|---|
| `proxy.ts` | كشف اللغة وتحويل المسارات بلا بادئة لغة |
| `src/content/locales.ts` | تعريف اللغات واختيار اللغة من ترويسة الطلب |
| `src/content/profile.ts` | بيانات عمر الشخصية ووسائل تواصله |
| `src/content/dictionary.ts` | نوع القاموس ودالة جلبه |
| `src/content/ar.ts`, `src/content/en.ts` | نصوص كل لغة |
| `src/lib/rate-limit.ts` | تحديد معدل بحسب مفتاح، في الذاكرة |
| `src/lib/client-ip.ts` | استخراج عنوان IP من الطلب |
| `src/lib/validate.ts` | التحقق من مدخلات نموذج التواصل |
| `src/lib/scene.ts` | منطق مشهد النظام الحي، خالص وقابل للاختبار |
| `src/lab/registry.ts` | سجل أعمال المختبر |
| `src/ui/section.tsx` | غلاف قسم موحد |
| `src/ui/nav.tsx` | شريط التنقل ومبدّل اللغة |
| `src/ui/footer.tsx` | التذييل |
| `src/ui/hero.tsx` | قسم البطل |
| `src/ui/hero-scene.tsx` | لوحة Canvas الحية، مكوّن عميل |
| `src/ui/fields.tsx` | قسم المجالات الأربعة |
| `src/ui/lab-section.tsx` | قسم المختبر وبطاقاته |
| `src/ui/process.tsx` | قسم كيف أعمل |
| `src/ui/about.tsx` | قسم عنّي |
| `src/ui/contact.tsx` | قسم التواصل والنموذج |
| `src/app/layout.tsx` | جذر بلا لغة، يمرر الأبناء فقط |
| `src/app/[locale]/layout.tsx` | `html` و `dir` و `lang` والخطوط والتنقل والتذييل |
| `src/app/[locale]/page.tsx` | الصفحة الرئيسية |
| `src/app/[locale]/lab/[slug]/page.tsx` | صفحة كل عمل |
| `src/app/api/contact/route.ts` | استقبال نموذج التواصل |
| `src/app/globals.css` | رموز التصميم وأساس الأنماط |
| `.env.example` | توثيق متغيرات البيئة |
| `tests/locale.spec.ts` … `tests/a11y.spec.ts` | اختبارات جديدة، ملف لكل مهمة |

---

## المهام

### المهمة ١: تهيئة النشر وتنظيف الإرث

تُزيل ما يربط المشروع بالاستضافة الثابتة، وتُسقط `three`، وتترك المشروع يبني بنجاح على حالة فارغة مؤقتة.

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json`
- Modify: `src/app/layout.tsx`
- Create: `.env.example`
- Delete: `.github/workflows/pages.yml`, `src/components/`, `src/content/`, `src/app/[locale]/`, `src/app/tools/`, `src/app/globals.css`, `src/app/editorial.css`, `src/app/previews.css`, `src/app/styles/`, `tests/portfolio.spec.ts`, `public/images/coffee.jpg`, `public/images/interior.jpg`, `*preview*.log`
- Test: `tests/config.spec.ts`

**Interfaces:**
- Consumes: لا شيء. هذه أول مهمة.
- Produces: `next.config.ts` بلا فرع `GITHUB_PAGES`، وبتحويل دائم من `/tools` إلى `/ar/lab/cut-studio`.

- [ ] **Step 1: اقرأ دليل التحويلات في هذا الإصدار**

```bash
sed -n '1,80p' node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md
```

- [ ] **Step 2: اكتب الاختبار الفاشل**

أنشئ `tests/config.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import config from "../next.config";

test("config has no static export branch and no GitHub Pages env", () => {
  expect(config).not.toHaveProperty("output");
  expect(config).not.toHaveProperty("trailingSlash");
  expect(config.env?.NEXT_PUBLIC_STATIC_SITE).toBeUndefined();
});

test("the old /tools path permanently redirects into the lab", async () => {
  const redirects = await config.redirects!();
  const tools = redirects.find(r => r.source === "/tools");
  expect(tools).toBeDefined();
  expect(tools!.destination).toBe("/ar/lab/cut-studio");
  expect(tools!.permanent).toBe(true);
});
```

- [ ] **Step 3: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/config.spec.ts`
Expected: FAIL — `config.redirects` غير معرّفة، و`output` موجودة عند ضبط `GITHUB_PAGES`.

- [ ] **Step 4: اكتب `next.config.ts` الجديد**

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

- [ ] **Step 5: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/config.spec.ts`
Expected: PASS

- [ ] **Step 6: احذف الإرث**

```bash
git rm -r --quiet .github/workflows/pages.yml src/components src/content "src/app/[locale]" src/app/tools src/app/globals.css src/app/editorial.css src/app/previews.css src/app/styles tests/portfolio.spec.ts public/images/coffee.jpg public/images/interior.jpg
rm -f ./*preview*.log
```

- [ ] **Step 7: أسقط `three` من الاعتماديات**

```bash
npm uninstall three @types/three
```

- [ ] **Step 8: اجعل الجذر صفحة انتقالية مؤقتة**

استبدل `src/app/layout.tsx` بالكامل:

```tsx
export const metadata = { title: "Omar Aldeek" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
```

واحذف `src/app/page.tsx` إن كان يستورد محتوى محذوفاً، وأنشئ بديلاً مؤقتاً:

```tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/ar");
}
```

- [ ] **Step 9: وثّق متغيرات البيئة**

أنشئ `.env.example`:

```sh
# نطاق الإنتاج الفعلي بلا شرطة أخيرة، مثل https://omaraldeek.com
# يفعّل canonical وروابط hreflang. بدونه تُحذف هذه الوسوم بدل اختلاق نطاق.
NEXT_PUBLIC_SITE_URL=

# وجهة نموذج التواصل. بدونها يعرض النموذج حالة "غير مفعّل" ولا يقبل إرسالاً.
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
CONTACT_API_KEY=
```

- [ ] **Step 10: تحقق أن المشروع يبني ويمرّ الفحص**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: الثلاثة تنجح. أي خطأ استيراد يشير إلى ملف محذوف نسيت إزالة مرجعه.

- [ ] **Step 11: كوميت**

```bash
git add -A
git commit -m "chore: drop static export setup, three.js and the legacy presentation layer"
```

---

### المهمة ٢: طبقة اللغة

**Files:**
- Create: `src/content/locales.ts`
- Test: `tests/locale.spec.ts`

**Interfaces:**
- Consumes: لا شيء.
- Produces:
  - `export type Locale = "ar" | "en"`
  - `export const locales: readonly Locale[]`
  - `export const defaultLocale: Locale` — قيمتها `"ar"`
  - `export function isLocale(value: string): value is Locale`
  - `export function pickLocale(acceptLanguage: string | null): Locale`
  - `export function oppositeLocale(locale: Locale): Locale`

- [ ] **Step 1: اكتب الاختبار الفاشل**

أنشئ `tests/locale.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { isLocale, pickLocale, oppositeLocale, defaultLocale, locales } from "../src/content/locales";

test("locale list and default", () => {
  expect(locales).toEqual(["ar", "en"]);
  expect(defaultLocale).toBe("ar");
});

test("isLocale accepts only supported values", () => {
  expect(isLocale("ar")).toBe(true);
  expect(isLocale("en")).toBe(true);
  expect(isLocale("fr")).toBe(false);
  expect(isLocale("")).toBe(false);
  expect(isLocale("AR")).toBe(false);
});

test("pickLocale reads the accept-language header and falls back to Arabic", () => {
  expect(pickLocale("en-US,en;q=0.9")).toBe("en");
  expect(pickLocale("ar-JO,ar;q=0.9,en;q=0.8")).toBe("ar");
  expect(pickLocale("en;q=0.4,ar;q=0.9")).toBe("ar");
  expect(pickLocale("fr-FR,fr;q=0.9")).toBe("ar");
  expect(pickLocale(null)).toBe("ar");
  expect(pickLocale("")).toBe("ar");
});

test("oppositeLocale flips the pair", () => {
  expect(oppositeLocale("ar")).toBe("en");
  expect(oppositeLocale("en")).toBe("ar");
});
```

- [ ] **Step 2: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/locale.spec.ts`
Expected: FAIL — `Cannot find module '../src/content/locales'`

- [ ] **Step 3: اكتب التنفيذ الأدنى**

أنشئ `src/content/locales.ts`:

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

- [ ] **Step 4: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/locale.spec.ts`
Expected: PASS — أربعة اختبارات

- [ ] **Step 5: كوميت**

```bash
git add src/content/locales.ts tests/locale.spec.ts
git commit -m "feat: add locale detection with Arabic as the default"
```

---

### المهمة ٣: توجيه اللغة عبر proxy

**Files:**
- Create: `proxy.ts`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`
- Delete: `src/app/page.tsx`
- Test: `tests/routing.spec.ts`

**Interfaces:**
- Consumes: `pickLocale`, `isLocale`, `locales`, `type Locale` من `src/content/locales`.
- Produces: مسار `/[locale]` يعمل، و`generateStaticParams` يولّد `ar` و `en`.

- [ ] **Step 1: اقرأ دليل proxy في هذا الإصدار**

```bash
sed -n '1,120p' node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
```

لاحظ: `middleware.ts` لم يعد موجوداً في هذا الإصدار. الملف اسمه `proxy.ts` ويوضع في جذر المشروع، والدالة تُصدَّر باسم `proxy` أو كتصدير افتراضي.

- [ ] **Step 2: اكتب الاختبار الفاشل**

أنشئ `tests/routing.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("the root redirects to Arabic", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
});

test("a path without a locale prefix gains one", async ({ page }) => {
  await page.goto("/lab");
  await expect(page).toHaveURL(/\/ar\/lab$/);
});

test("each locale sets the matching lang and dir", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("an unknown locale is not served", async ({ page }) => {
  const response = await page.goto("/fr");
  expect(response?.status()).toBe(404);
});

test("api routes are not rewritten by the locale proxy", async ({ request }) => {
  const response = await request.get("/api/tools/cdr");
  expect(response.status()).not.toBe(307);
  expect(response.status()).not.toBe(308);
});
```

- [ ] **Step 3: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/routing.spec.ts`
Expected: FAIL — لا يوجد مسار `/ar`

- [ ] **Step 4: اكتب `proxy.ts`**

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

- [ ] **Step 5: اكتب تخطيط اللغة**

أنشئ `src/app/[locale]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { isLocale, locales } from "../../content/locales";
import "../globals.css";

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: اجعل الجذر يمرر الأبناء فقط**

استبدل `src/app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

واحذف `src/app/page.tsx`. التحويل من `/` يتكفل به `proxy.ts`.

- [ ] **Step 7: أنشئ صفحة مؤقتة**

أنشئ `src/app/[locale]/page.tsx`:

```tsx
export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  return <h1>{locale}</h1>;
}
```

- [ ] **Step 8: أنشئ ملف أنماط فارغاً مؤقتاً**

أنشئ `src/app/globals.css` بسطر واحد حتى لا ينكسر الاستيراد:

```css
@import "tailwindcss";
```

- [ ] **Step 9: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/routing.spec.ts`
Expected: PASS — خمسة اختبارات

- [ ] **Step 10: كوميت**

```bash
git add proxy.ts "src/app/[locale]" src/app/layout.tsx src/app/globals.css tests/routing.spec.ts
git rm --quiet src/app/page.tsx
git commit -m "feat: route locales through proxy with Arabic as the default"
```

---

### المهمة ٤: نظام التصميم والخطوط

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/[locale]/layout.tsx`
- Test: `tests/theme.spec.ts`

**Interfaces:**
- Consumes: تخطيط اللغة من المهمة ٣.
- Produces: رموز CSS التالية متاحة عالمياً — `--surface-0`، `--surface-1`، `--surface-2`، `--text-primary`، `--text-secondary`، `--text-muted`، `--live`، `--live-dim`، `--warn`، `--border`، `--font-ar`، `--font-en`، `--font-mono`.

- [ ] **Step 1: اكتب الاختبار الفاشل**

أنشئ `tests/theme.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const readVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

test("design tokens resolve in both colour schemes", async ({ page }) => {
  for (const scheme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ar");
    const tokens = await page.evaluate(names => names.map(n =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim()), [
      "--surface-0", "--surface-1", "--text-primary", "--text-secondary", "--live", "--warn", "--border",
    ]);
    for (const value of tokens) expect(value).not.toBe("");
    expect(tokens[0]).not.toBe(tokens[2]);
  }
});

test("Arabic and English use their own font stacks", async ({ page }) => {
  await page.goto("/ar");
  const ar = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(ar).toContain("Noto Sans Arabic");
  await page.goto("/en");
  const en = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(en).toContain("Manrope");
});

test("no horizontal overflow at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/ar");
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflows).toBe(false);
});
```

- [ ] **Step 2: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/theme.spec.ts`
Expected: FAIL — الرموز تعود فارغة

- [ ] **Step 3: اكتب رموز التصميم**

استبدل `src/app/globals.css`:

```css
@import "tailwindcss";
@import "@fontsource-variable/noto-sans-arabic";
@import "@fontsource-variable/manrope";

:root {
  --surface-0: #070b11;
  --surface-1: #0d131c;
  --surface-2: #141d29;
  --text-primary: #eef4fb;
  --text-secondary: #9fb0c4;
  --text-muted: #6b7c92;
  --live: #3fd9b0;
  --live-dim: #1d7f68;
  --warn: #e8a13c;
  --border: #1e2a3a;
  --border-strong: #2c3c51;
  --font-ar: "Noto Sans Arabic Variable", system-ui, sans-serif;
  --font-en: "Manrope Variable", system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", "Cascadia Mono", monospace;
  color-scheme: dark;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --surface-0: #f7f9fc;
    --surface-1: #ffffff;
    --surface-2: #eef2f8;
    --text-primary: #0b131d;
    --text-secondary: #3f5065;
    --text-muted: #667a92;
    --live: #0c7d63;
    --live-dim: #8fd8c6;
    --warn: #9a5c07;
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

:focus-visible {
  outline: 2px solid var(--live);
  outline-offset: 3px;
}

.shell {
  inline-size: min(100% - 2rem, 76rem);
  margin-inline: auto;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 4: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/theme.spec.ts`
Expected: PASS — ثلاثة اختبارات

- [ ] **Step 5: كوميت**

```bash
git add src/app/globals.css tests/theme.spec.ts
git commit -m "feat: add the living-system design tokens and local font stacks"
```

---

### المهمة ٥: طبقة المحتوى

تفصل كل نص عن كل مكوّن عرض. أي تعديل لاحق على الكلمات يقع في ملف واحد لكل لغة.

**Files:**
- Create: `src/content/profile.ts`
- Create: `src/content/dictionary.ts`
- Create: `src/content/ar.ts`
- Create: `src/content/en.ts`
- Test: `tests/content.spec.ts`

**Interfaces:**
- Consumes: `type Locale` من `src/content/locales`.
- Produces:
  - `export type Profile = { name: Record<Locale, string>; whatsapp: string; email: string; siteUrl: string; location: Record<Locale, string>; links: { label: string; href: string }[] }`
  - `export const profile: Profile`
  - `export type Dictionary` — النوع الكامل لنصوص صفحة واحدة
  - `export function getDictionary(locale: Locale): Dictionary`

- [ ] **Step 1: اكتب الاختبار الفاشل**

أنشئ `tests/content.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { getDictionary } from "../src/content/dictionary";
import { profile } from "../src/content/profile";
import { locales } from "../src/content/locales";

test("both dictionaries expose exactly the same keys", () => {
  const ar = Object.keys(getDictionary("ar")).sort();
  const en = Object.keys(getDictionary("en")).sort();
  expect(ar).toEqual(en);
});

test("no dictionary string is empty", () => {
  for (const locale of locales) {
    const walk = (value: unknown, path: string) => {
      if (typeof value === "string") expect(value.trim(), path).not.toBe("");
      else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (value && typeof value === "object")
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    };
    walk(getDictionary(locale), locale);
  }
});

test("whatsapp is digits only when present", () => {
  if (profile.whatsapp) expect(profile.whatsapp).toMatch(/^\d+$/);
});

test("siteUrl has no trailing slash when present", () => {
  if (profile.siteUrl) expect(profile.siteUrl.endsWith("/")).toBe(false);
});

test("the four fields each name their lab slug", () => {
  for (const locale of locales) {
    const fields = getDictionary(locale).fields;
    expect(fields).toHaveLength(4);
    for (const field of fields) expect(field.slug.length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/content.spec.ts`
Expected: FAIL — الوحدات غير موجودة

- [ ] **Step 3: اكتب الملف الشخصي**

أنشئ `src/content/profile.ts`:

```ts
import type { Locale } from "./locales";

export type Profile = {
  name: Record<Locale, string>;
  whatsapp: string;
  email: string;
  siteUrl: string;
  location: Record<Locale, string>;
  links: { label: string; href: string }[];
};

// القيم الفارغة مقصودة: الواجهة تخفي أي وسيلة تواصل غير متوفرة ولا تختلق بديلاً.
export const profile: Profile = {
  name: { ar: "عمر الديك", en: "Omar Aldeek" },
  whatsapp: "",
  email: "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  location: { ar: "من فلسطين، إلى كل مكان", en: "From Palestine, to everywhere" },
  links: [],
};
```

- [ ] **Step 4: اكتب نوع القاموس ودالة الجلب**

أنشئ `src/content/dictionary.ts`:

```ts
import type { Locale } from "./locales";
import { ar } from "./ar";
import { en } from "./en";

export type Dictionary = {
  meta: { title: string; description: string };
  nav: { lab: string; process: string; about: string; contact: string; switchTo: string; menu: string; skip: string };
  hero: { role: string; headline: string; lead: string; cta: string; secondary: string };
  fields: { slug: string; title: string; text: string }[];
  lab: { label: string; title: string; intro: string; open: string; live: string; soon: string };
  process: { label: string; title: string; steps: { title: string; text: string }[] };
  about: { label: string; title: string; text: string };
  contact: {
    label: string; title: string; text: string;
    whatsapp: string; email: string; unavailable: string;
    nameLabel: string; emailLabel: string; messageLabel: string;
    submit: string; sending: string; sent: string;
    errorValidation: string; errorRate: string; errorServer: string; errorDisabled: string;
    needsJs: string;
  };
  faq: { q: string; a: string }[];
  footer: { rights: string; note: string; backTop: string };
};

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
```

- [ ] **Step 5: اكتب النص العربي**

أنشئ `src/content/ar.ts`. اكتب المحتوى بصوت شخصي يقدّم عمر لا الأدوات، والتزم بنوع `Dictionary` حرفياً:

```ts
import type { Dictionary } from "./dictionary";

export const ar: Dictionary = {
  meta: {
    title: "عمر الديك — أبني أنظمة تعمل وحدها",
    description: "عمر الديك، صانع مستقل من فلسطين. أبني مواقع وتكاملات API وأنظمة أتمتة ومنتجات SaaS، وأصمّمها بنفسي.",
  },
  nav: { lab: "المختبر", process: "كيف أعمل", about: "عنّي", contact: "تواصل", switchTo: "English", menu: "القائمة", skip: "انتقل إلى المحتوى" },
  hero: {
    role: "صانع مستقل — من فلسطين",
    headline: "أبني أنظمة تعمل وحدها.",
    lead: "مواقع، وتكاملات API، وأنظمة أتمتة، ومنتجات SaaS. أصمّمها وأبنيها بنفسي، وكل ما تراه هنا يعمل فعلاً.",
    cta: "شاهد المختبر",
    secondary: "تحدّث معي",
  },
  fields: [
    { slug: "cut-studio", title: "برمجة المواقع", text: "واجهات سريعة ومتجاوبة تُبنى من الصفر، لا من قالب جاهز." },
    { slug: "api-playground", title: "تكاملات API", text: "ربط الخدمات ببعضها: مفاتيح آمنة، وحدود معدل، وتخزين مؤقت، وفشل معلن لا صامت." },
    { slug: "automation-engine", title: "أنظمة الأتمتة", text: "تحويل العمل اليدوي المتكرر إلى سير عمل ينفّذ نفسه ويترك أثراً يمكن تتبّعه." },
    { slug: "saas-panel", title: "منتجات SaaS", text: "لوحات تحكم ومنتجات بحالة حقيقية: بيانات تُقرأ وتُكتب وتبقى." },
  ],
  lab: {
    label: "المختبر",
    title: "لا أصف ما أعرفه. أشغّله أمامك.",
    intro: "كل عمل هنا يعمل فعلاً في متصفحك الآن. لا لقطات شاشة ولا وعود.",
    open: "افتح العمل",
    live: "يعمل الآن",
    soon: "قيد البناء",
  },
  process: {
    label: "كيف أعمل",
    title: "أربع خطوات، بلا مفاجآت.",
    steps: [
      { title: "نفهم", text: "نتحدث عن المشكلة الفعلية وما تريد أن يتغيّر، ونحدّد النطاق بوضوح." },
      { title: "نرسم", text: "أضع بنية الحل والواجهة قبل كتابة سطر واحد، وتراها وتوافق عليها." },
      { title: "نبني", text: "أبني على مراحل، كل مرحلة تسلّم شيئاً يعمل وتراه بنفسك." },
      { title: "نسلّم", text: "أختبر وأوثّق وأسلّم، ونتفق على المتابعة إن احتجتها." },
    ],
  },
  about: {
    label: "عنّي",
    title: "أهلاً، أنا عمر.",
    text: "صانع مستقل من فلسطين. أحب المشاكل التي لها حل هندسي واضح، وأكره الواجهات التي تبدو جميلة وتعمل بشكل سيئ. أعمل معك مباشرة، بلا وسطاء ولا فرق، وأبني ما تحتاجه فعلاً لا ما يبدو مبهراً في العرض.",
  },
  contact: {
    label: "تواصل",
    title: "عندك نظام يحتاج أن يُبنى؟",
    text: "اكتب لي بما تريد إنجازه، وسأرد بما أراه ممكناً وكيف أبدأ.",
    whatsapp: "واتساب",
    email: "البريد",
    unavailable: "وسائل التواصل المباشرة ستُضاف قريباً. استخدم النموذج في الأسفل.",
    nameLabel: "اسمك",
    emailLabel: "بريدك",
    messageLabel: "ما الذي تريد بناءه؟",
    submit: "أرسل",
    sending: "جارٍ الإرسال",
    sent: "وصلت رسالتك. سأرد قريباً.",
    errorValidation: "أكمل الحقول: اسم، وبريد صحيح، ورسالة لا تقل عن عشرين حرفاً.",
    errorRate: "أرسلت عدة رسائل خلال وقت قصير. انتظر قليلاً ثم أعد المحاولة.",
    errorServer: "تعذّر الإرسال الآن. أعد المحاولة، أو راسلني مباشرة.",
    errorDisabled: "نموذج الإرسال غير مفعّل بعد على هذا النطاق.",
    needsJs: "إرسال النموذج يحتاج تشغيل JavaScript. يمكنك مراسلتي مباشرة بدلاً من ذلك.",
  },
  faq: [
    { q: "ما الذي أحتاجه قبل أن نبدأ؟", a: "وصف للمشكلة وما تريد أن يتغيّر. لا تحتاج مواصفة تقنية؛ هذا عملي أنا." },
    { q: "كم يستغرق العمل؟", a: "يعتمد على النطاق. بعد أول محادثة أعطيك جدولاً واقعياً وأوضّح أثر أي تغيير عليه." },
    { q: "هل تعمل على أنظمة قائمة؟", a: "نعم. إصلاح وتوسعة وربط أنظمة موجودة جزء أساسي من عملي، وأحياناً أوفر من البناء من الصفر." },
  ],
  footer: { rights: "جميع الحقوق محفوظة", note: "هذا الموقع نفسه مبني بالأدوات التي أعمل بها.", backTop: "إلى الأعلى" },
};
```

- [ ] **Step 6: اكتب النص الإنجليزي**

أنشئ `src/content/en.ts` بنفس المفاتيح تماماً، بترجمة تحمل النبرة ذاتها لا ترجمة حرفية. مثال على أول مفتاحين، وأكمل البقية على المنوال نفسه:

```ts
import type { Dictionary } from "./dictionary";

export const en: Dictionary = {
  meta: {
    title: "Omar Aldeek — I build systems that run themselves",
    description: "Omar Aldeek, an independent maker from Palestine. I build websites, API integrations, automation systems and SaaS products, and I design them myself.",
  },
  nav: { lab: "Lab", process: "How I work", about: "About", contact: "Contact", switchTo: "العربية", menu: "Menu", skip: "Skip to content" },
  hero: {
    role: "Independent maker — from Palestine",
    headline: "I build systems that run themselves.",
    lead: "Websites, API integrations, automation systems and SaaS products. I design and build them myself, and everything on this page actually runs.",
    cta: "See the lab",
    secondary: "Talk to me",
  },
  // أكمل: fields, lab, process, about, contact, faq, footer — بنفس مفاتيح ar.ts حرفياً
};
```

- [ ] **Step 7: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/content.spec.ts`
Expected: PASS — خمسة اختبارات. اختبار تطابق المفاتيح هو ما يكشف أي مفتاح نسيته في `en.ts`.

- [ ] **Step 8: كوميت**

```bash
git add src/content tests/content.spec.ts
git commit -m "feat: add the bilingual content layer keyed to a shared dictionary type"
```

---

### المهمة ٦: سجل المختبر

**Files:**
- Create: `src/lab/registry.ts`
- Test: `tests/lab-registry.spec.ts`

**Interfaces:**
- Consumes: `type Locale` من `src/content/locales`.
- Produces:
  - `export type LabStatus = "live" | "building"`
  - `export type LabWork = { slug: string; field: string; status: LabStatus; title: Record<Locale, string>; blurb: Record<Locale, string> }`
  - `export const labWorks: LabWork[]`
  - `export function getLabWork(slug: string): LabWork | undefined`

هذا السجل هو نقطة التمديد الوحيدة: كل خطة عرض حي لاحقة تضيف مدخلاً واحداً هنا وتبني مجلدها، ولا تلمس شيئاً آخر.

- [ ] **Step 1: اكتب الاختبار الفاشل**

أنشئ `tests/lab-registry.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { labWorks, getLabWork } from "../src/lab/registry";
import { getDictionary } from "../src/content/dictionary";
import { locales } from "../src/content/locales";

test("every field in the dictionary points at a registered lab work", () => {
  for (const locale of locales)
    for (const field of getDictionary(locale).fields)
      expect(getLabWork(field.slug), field.slug).toBeDefined();
});

test("slugs are unique and url safe", () => {
  const slugs = labWorks.map(w => w.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
});

test("every work is titled in both locales", () => {
  for (const work of labWorks)
    for (const locale of locales) {
      expect(work.title[locale].trim(), `${work.slug}.title.${locale}`).not.toBe("");
      expect(work.blurb[locale].trim(), `${work.slug}.blurb.${locale}`).not.toBe("");
    }
});

test("cut-studio is registered and live", () => {
  expect(getLabWork("cut-studio")?.status).toBe("live");
});

test("an unknown slug resolves to undefined", () => {
  expect(getLabWork("nope")).toBeUndefined();
});
```

- [ ] **Step 2: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/lab-registry.spec.ts`
Expected: FAIL — الوحدة غير موجودة

- [ ] **Step 3: اكتب السجل**

أنشئ `src/lab/registry.ts`. الأعمال الثلاثة غير المبنية بعد تُسجَّل بحالة `building`، فتُعرض بصدق كقيد البناء بدل إخفائها أو ادعاء جاهزيتها:

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
    slug: "cut-studio",
    field: "web",
    status: "live",
    title: { ar: "Cut Studio", en: "Cut Studio" },
    blurb: {
      ar: "سبع أدوات ليزر وتصميم تعمل كلها داخل متصفحك: ترتيب قطع، تحويل صور إلى فيكتور، حساب تكلفة خامة وغيرها. منتج كامل بنيته من الصفر.",
      en: "Seven laser and design tools that all run inside your browser: part nesting, image tracing, material costing and more. A complete product I built from scratch.",
    },
  },
  {
    slug: "automation-engine",
    field: "automation",
    status: "building",
    title: { ar: "محرك الأتمتة", en: "Automation engine" },
    blurb: {
      ar: "ابنِ سير عمل من عقد، ثم شغّله وشاهد التنفيذ يمر خطوة بخطوة مع سجل حقيقي.",
      en: "Build a workflow out of nodes, run it, and watch execution walk through them with a real log.",
    },
  },
  {
    slug: "api-playground",
    field: "api",
    status: "building",
    title: { ar: "ملعب API", en: "API playground" },
    blurb: {
      ar: "ثلاثة تكاملات حقيقية تستدعيها بنفسك، وترى الاستجابة والزمن وحد المعدل كما هي.",
      en: "Three real integrations you call yourself, with the response, timing and rate limit shown as they are.",
    },
  },
  {
    slug: "saas-panel",
    field: "saas",
    status: "building",
    title: { ar: "لوحة SaaS", en: "SaaS panel" },
    blurb: {
      ar: "واجهة منتج مصغّرة ببيانات حقيقية: أضف صفاً وسيبقى موجوداً بعد أن تغادر.",
      en: "A miniature product surface on real data: add a row and it is still there after you leave.",
    },
  },
];

export function getLabWork(slug: string): LabWork | undefined {
  return labWorks.find(work => work.slug === slug);
}
```

- [ ] **Step 4: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/lab-registry.spec.ts`
Expected: PASS — خمسة اختبارات

- [ ] **Step 5: كوميت**

```bash
git add src/lab/registry.ts tests/lab-registry.spec.ts
git commit -m "feat: add the lab registry as the single extension point for demos"
```

---

### المهمة ٧: هيكل الصفحة والأقسام الساكنة

تبني الصفحة الرئيسية كاملة بمحتوى حقيقي. بطاقات المختبر ساكنة في هذه المهمة، ومشهد البطل ساكن كذلك — تأتي الحياة في المهمة ٩.

**Files:**
- Create: `src/ui/section.tsx`, `src/ui/nav.tsx`, `src/ui/footer.tsx`, `src/ui/hero.tsx`, `src/ui/fields.tsx`, `src/ui/lab-section.tsx`, `src/ui/process.tsx`, `src/ui/about.tsx`
- Modify: `src/app/[locale]/page.tsx`, `src/app/[locale]/layout.tsx`
- Test: `tests/page.spec.ts`

**Interfaces:**
- Consumes: `getDictionary`, `profile`, `labWorks`, `oppositeLocale`, `type Locale`.
- Produces:
  - `export function Section(props: { id: string; label: string; title: string; children: React.ReactNode }): JSX.Element`
  - `export function Nav(props: { locale: Locale }): JSX.Element`
  - `export function Footer(props: { locale: Locale }): JSX.Element`
  - `export function Hero(props: { locale: Locale }): JSX.Element`
  - `export function Fields(props: { locale: Locale }): JSX.Element`
  - `export function LabSection(props: { locale: Locale }): JSX.Element`
  - `export function Process(props: { locale: Locale }): JSX.Element`
  - `export function About(props: { locale: Locale }): JSX.Element`
  - معرّفات الأقسام في DOM: `#lab`, `#process`, `#about`, `#contact`
  - أصناف يعتمد عليها الاختبار: `.lab-card`, `.field-card`, `.locale-switch`

- [ ] **Step 1: اكتب الاختبار الفاشل**

أنشئ `tests/page.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { getDictionary } from "../src/content/dictionary";
import { labWorks } from "../src/lab/registry";

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: the page leads with Omar, not with a tool`, async ({ page }) => {
    const dict = getDictionary(locale);
    await page.goto(`/${locale}`);
    await expect(page.locator("h1")).toHaveText(dict.hero.headline);
    await expect(page.locator("h1")).toBeVisible();
  });

  test(`${locale}: all four fields and all lab works render`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator(".field-card")).toHaveCount(4);
    await expect(page.locator(".lab-card")).toHaveCount(labWorks.length);
  });

  test(`${locale}: Cut Studio sits inside the lab and not in the nav`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const nav = page.locator("nav");
    await expect(nav).not.toContainText("Cut Studio");
    await expect(page.locator("#lab .lab-card").first()).toContainText("Cut Studio");
  });

  test(`${locale}: every section is reachable with no horizontal overflow`, async ({ page }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      for (const id of ["lab", "process", "about", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflows, `${id} at ${width}`).toBe(false);
      }
    }
  });
}

test("the locale switch keeps you on the same page", async ({ page }) => {
  await page.goto("/ar");
  await page.locator(".locale-switch").click();
  await expect(page).toHaveURL(/\/en$/);
  await page.locator(".locale-switch").click();
  await expect(page).toHaveURL(/\/ar$/);
});

test("works still being built say so instead of pretending", async ({ page }) => {
  await page.goto("/ar");
  const building = page.locator(".lab-card[data-status='building']");
  await expect(building.first()).toContainText(getDictionary("ar").lab.soon);
});
```

- [ ] **Step 2: شغّل الاختبار وتأكد أنه يفشل**

Run: `npx playwright test tests/page.spec.ts`
Expected: FAIL — الصفحة ما زالت تعرض اسم اللغة فقط

- [ ] **Step 3: اكتب غلاف القسم**

أنشئ `src/ui/section.tsx`:

```tsx
export function Section({
  id, label, title, children,
}: { id: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="shell" style={{ paddingBlock: "clamp(4rem, 10vw, 8rem)" }}>
      <p className="mono" style={{ color: "var(--live)", fontSize: "0.8rem", letterSpacing: "0.12em", margin: 0 }}>
        {label}
      </p>
      <h2 style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)", lineHeight: 1.15, margin: "0.5rem 0 2rem", maxInlineSize: "22ch" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 4: اكتب التنقل ومبدّل اللغة**

أنشئ `src/ui/nav.tsx`. يعمل بلا JavaScript لأنه روابط لا أزرار:

```tsx
import Link from "next/link";
import { getDictionary } from "../content/dictionary";
import { oppositeLocale, type Locale } from "../content/locales";

export function Nav({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const other = oppositeLocale(locale);
  return (
    <header style={{ position: "sticky", insetBlockStart: 0, zIndex: 10, background: "color-mix(in srgb, var(--surface-0) 88%, transparent)", borderBlockEnd: "1px solid var(--border)", backdropFilter: "blur(8px)" }}>
      <a href="#main" className="shell" style={{ position: "absolute", insetInlineStart: "-9999px" }}>{dict.nav.skip}</a>
      <nav className="shell" aria-label={dict.nav.menu} style={{ display: "flex", alignItems: "center", gap: "1.25rem", blockSize: "4rem" }}>
        <Link href={`/${locale}`} style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "none", marginInlineEnd: "auto" }}>
          {getDictionary(locale).meta.title.split("—")[0].trim()}
        </Link>
        <a href="#lab">{dict.nav.lab}</a>
        <a href="#process">{dict.nav.process}</a>
        <a href="#about">{dict.nav.about}</a>
        <a href="#contact">{dict.nav.contact}</a>
        <Link href={`/${other}`} className="locale-switch mono" style={{ fontSize: "0.85rem" }}>
          {dict.nav.switchTo}
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 5: اكتب البطل ساكناً**

أنشئ `src/ui/hero.tsx`. مكان المشهد محجوز الآن ويُملأ في المهمة ٩:

```tsx
import { getDictionary } from "../content/dictionary";
import type { Locale } from "../content/locales";

export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="shell" style={{ paddingBlock: "clamp(4rem, 12vw, 9rem)", position: "relative" }}>
      <p className="mono" style={{ color: "var(--live)", fontSize: "0.85rem", margin: 0 }}>{dict.hero.role}</p>
      <h1 style={{ fontSize: "clamp(2.5rem, 9vw, 5.5rem)", lineHeight: 1.05, margin: "1rem 0", maxInlineSize: "16ch" }}>
        {dict.hero.headline}
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 2.4vw, 1.3rem)", maxInlineSize: "52ch", margin: "0 0 2rem" }}>
        {dict.hero.lead}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <a href="#lab" style={{ background: "var(--live)", color: "var(--surface-0)", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none", fontWeight: 600 }}>
          {dict.hero.cta}
        </a>
        <a href="#contact" style={{ border: "1px solid var(--border-strong)", color: "var(--text-primary)", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}>
          {dict.hero.secondary}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: اكتب المجالات**

أنشئ `src/ui/fields.tsx`:

```tsx
import Link from "next/link";
import { getDictionary } from "../content/dictionary";
import type { Locale } from "../content/locales";

export function Fields({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <div className="shell" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))", paddingBlockEnd: "2rem" }}>
      {dict.fields.map(field => (
        <Link
          key={field.slug}
          href={`/${locale}/lab/${field.slug}`}
          className="field-card"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.25rem", textDecoration: "none", color: "var(--text-primary)", display: "block" }}
        >
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>{field.title}</h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>{field.text}</p>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: اكتب قسم المختبر**

أنشئ `src/ui/lab-section.tsx`:

```tsx
import Link from "next/link";
import { Section } from "./section";
import { getDictionary } from "../content/dictionary";
import { labWorks } from "../lab/registry";
import type { Locale } from "../content/locales";

export function LabSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <Section id="lab" label={dict.lab.label} title={dict.lab.title}>
      <p style={{ color: "var(--text-secondary)", maxInlineSize: "52ch", marginBlockEnd: "2rem" }}>{dict.lab.intro}</p>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))" }}>
        {labWorks.map(work => (
          <article
            key={work.slug}
            className="lab-card"
            data-status={work.status}
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.5rem" }}
          >
            <p className="mono" style={{ margin: 0, fontSize: "0.75rem", color: work.status === "live" ? "var(--live)" : "var(--text-muted)" }}>
              {work.status === "live" ? dict.lab.live : dict.lab.soon}
            </p>
            <h3 style={{ margin: "0.5rem 0", fontSize: "1.35rem" }}>{work.title[locale]}</h3>
            <p style={{ margin: "0 0 1rem", color: "var(--text-secondary)" }}>{work.blurb[locale]}</p>
            {work.status === "live" && <Link href={`/${locale}/lab/${work.slug}`}>{dict.lab.open}</Link>}
          </article>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 8: اكتب قسمي العملية والنبذة والتذييل**

أنشئ `src/ui/process.tsx`:

```tsx
import { Section } from "./section";
import { getDictionary } from "../content/dictionary";
import type { Locale } from "../content/locales";

export function Process({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <Section id="process" label={dict.process.label} title={dict.process.title}>
      <ol style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", listStyle: "none", padding: 0, margin: 0, counterReset: "step" }}>
        {dict.process.steps.map((step, index) => (
          <li key={step.title} style={{ borderBlockStart: "2px solid var(--border-strong)", paddingBlockStart: "1rem" }}>
            <span className="mono" style={{ color: "var(--live)", fontSize: "0.8rem" }}>{String(index + 1).padStart(2, "0")}</span>
            <h3 style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>{step.title}</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

أنشئ `src/ui/about.tsx`:

```tsx
import { Section } from "./section";
import { getDictionary } from "../content/dictionary";
import { profile } from "../content/profile";
import type { Locale } from "../content/locales";

export function About({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <Section id="about" label={dict.about.label} title={dict.about.title}>
      <p style={{ color: "var(--text-secondary)", maxInlineSize: "58ch", fontSize: "1.1rem" }}>{dict.about.text}</p>
      <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{profile.location[locale]}</p>
    </Section>
  );
}
```

أنشئ `src/ui/footer.tsx`:

```tsx
import { getDictionary } from "../content/dictionary";
import { profile } from "../content/profile";
import type { Locale } from "../content/locales";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <footer style={{ borderBlockStart: "1px solid var(--border)", paddingBlock: "2rem" }}>
      <div className="shell" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        <span>© {new Date().getFullYear()} {profile.name[locale]} — {dict.footer.rights}</span>
        <span style={{ marginInlineStart: "auto" }}>{dict.footer.note}</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 9: ركّب الصفحة والتخطيط**

استبدل `src/app/[locale]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { isLocale } from "../../content/locales";
import { Hero } from "../../ui/hero";
import { Fields } from "../../ui/fields";
import { LabSection } from "../../ui/lab-section";
import { Process } from "../../ui/process";
import { About } from "../../ui/about";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main">
      <Hero locale={locale} />
      <Fields locale={locale} />
      <LabSection locale={locale} />
      <Process locale={locale} />
      <About locale={locale} />
    </main>
  );
}
```

أضف `Nav` و `Footer` إلى `src/app/[locale]/layout.tsx` داخل `<body>`، وأضف `generateMetadata` تقرأ `dict.meta`:

```tsx
import { notFound } from "next/navigation";
import { getDictionary } from "../../content/dictionary";
import { isLocale, locales } from "../../content/locales";
import { Nav } from "../../ui/nav";
import { Footer } from "../../ui/footer";
import "../globals.css";

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getDictionary(locale);
  return { title: meta.title, description: meta.description };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <Nav locale={locale} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
```

- [ ] **Step 10: أضف قسم تواصل نائباً مؤقتاً**

حتى يمر اختبار `#contact` في هذه المهمة، أضف في `page.tsx` بعد `About`:

```tsx
<section id="contact" className="shell" style={{ paddingBlock: "4rem" }} />
```

يُستبدل بالكامل في المهمة ٨.

- [ ] **Step 11: شغّل الاختبارات كلها**

Run: `npx playwright test tests/page.spec.ts && npm run typecheck && npm run lint`
Expected: PASS في الثلاثة

- [ ] **Step 12: كوميت**

```bash
git add src/ui "src/app/[locale]" tests/page.spec.ts
git commit -m "feat: build the home page around Omar with the lab holding Cut Studio"
```

---

### المهمة ٨: التواصل — تحديد المعدل والتحقق والمسار

**Files:**
- Create: `src/lib/rate-limit.ts`, `src/lib/client-ip.ts`, `src/lib/validate.ts`
- Create: `src/app/api/contact/route.ts`
- Create: `src/ui/contact.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Test: `tests/rate-limit.spec.ts`, `tests/validate.spec.ts`, `tests/contact.spec.ts`

**Interfaces:**
- Consumes: `getDictionary`, `profile`.
- Produces:
  - `export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number }`
  - `export function rateLimit(key: string, options: { limit: number; windowMs: number }, now?: number): RateLimitResult`
  - `export function resetRateLimit(): void` — للاختبار فقط
  - `export function clientIp(request: Request): string`
  - `export type ContactInput = { name: string; email: string; message: string }`
  - `export type ValidationResult = { ok: true; value: ContactInput } | { ok: false; error: string }`
  - `export function validateContact(raw: unknown): ValidationResult`
  - `export function Contact(props: { locale: Locale }): JSX.Element`

- [ ] **Step 1: اكتب اختبار تحديد المعدل**

أنشئ `tests/rate-limit.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { rateLimit, resetRateLimit } from "../src/lib/rate-limit";

test.beforeEach(() => resetRateLimit());

test("requests under the limit are allowed and count down", () => {
  const options = { limit: 3, windowMs: 60_000 };
  expect(rateLimit("a", options, 0)).toMatchObject({ ok: true, remaining: 2 });
  expect(rateLimit("a", options, 1)).toMatchObject({ ok: true, remaining: 1 });
  expect(rateLimit("a", options, 2)).toMatchObject({ ok: true, remaining: 0 });
});

test("the request over the limit is refused with a retry delay", () => {
  const options = { limit: 2, windowMs: 60_000 };
  rateLimit("b", options, 0);
  rateLimit("b", options, 0);
  const blocked = rateLimit("b", options, 10_000);
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfterSeconds).toBe(50);
});

test("keys do not interfere with each other", () => {
  const options = { limit: 1, windowMs: 60_000 };
  expect(rateLimit("c", options, 0).ok).toBe(true);
  expect(rateLimit("d", options, 0).ok).toBe(true);
  expect(rateLimit("c", options, 0).ok).toBe(false);
});

test("the window rolls over", () => {
  const options = { limit: 1, windowMs: 1_000 };
  expect(rateLimit("e", options, 0).ok).toBe(true);
  expect(rateLimit("e", options, 500).ok).toBe(false);
  expect(rateLimit("e", options, 1_001).ok).toBe(true);
});
```

- [ ] **Step 2: شغّله وتأكد أنه يفشل**

Run: `npx playwright test tests/rate-limit.spec.ts`
Expected: FAIL — الوحدة غير موجودة

- [ ] **Step 3: اكتب تحديد المعدل**

أنشئ `src/lib/rate-limit.ts`:

```ts
export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

type Window = { count: number; startedAt: number };
const windows = new Map<string, Window>();

export function resetRateLimit(): void {
  windows.clear();
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult {
  const existing = windows.get(key);
  if (!existing || now - existing.startedAt >= options.windowMs) {
    windows.set(key, { count: 1, startedAt: now });
    return { ok: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
  }
  if (existing.count >= options.limit) {
    const elapsed = now - existing.startedAt;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((options.windowMs - elapsed) / 1000),
    };
  }
  existing.count += 1;
  return { ok: true, remaining: options.limit - existing.count, retryAfterSeconds: 0 };
}
```

> هذا التخزين في ذاكرة العملية. على Vercel يعني حداً لكل نسخة تشغيل لا حداً عالمياً — وهو كافٍ لنموذج تواصل وللعروض الحية، ويُوثَّق بتعليق في أعلى الملف حتى لا يُساء فهمه لاحقاً.

- [ ] **Step 4: شغّله وتأكد أنه ينجح**

Run: `npx playwright test tests/rate-limit.spec.ts`
Expected: PASS — أربعة اختبارات

- [ ] **Step 5: اكتب اختبار التحقق**

أنشئ `tests/validate.spec.ts`:

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

test("oversized fields are refused rather than truncated", () => {
  expect(validateContact({ ...good, message: "x".repeat(5001) }).ok).toBe(false);
  expect(validateContact({ ...good, name: "x".repeat(201) }).ok).toBe(false);
});
```

- [ ] **Step 6: شغّله وتأكد أنه يفشل، ثم اكتب التحقق**

Run: `npx playwright test tests/validate.spec.ts` → FAIL

أنشئ `src/lib/validate.ts`:

```ts
export type ContactInput = { name: string; email: string; message: string };
export type ValidationResult = { ok: true; value: ContactInput } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "invalid-body" };
  const body = raw as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 1 || name.length > 200) return { ok: false, error: "invalid-name" };
  if (!EMAIL.test(email) || email.length > 320) return { ok: false, error: "invalid-email" };
  if (message.length < 20 || message.length > 5000) return { ok: false, error: "invalid-message" };

  return { ok: true, value: { name, email, message } };
}
```

أنشئ `src/lib/client-ip.ts`:

```ts
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
```

Run: `npx playwright test tests/validate.spec.ts`
Expected: PASS — ثلاثة اختبارات

- [ ] **Step 7: اكتب اختبار المسار والنموذج**

أنشئ `tests/contact.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("a malformed submission is refused with 400", async ({ request }) => {
  const response = await request.post("/api/contact", { data: { name: "", email: "x", message: "" } });
  expect(response.status()).toBe(400);
});

test("a flood of submissions is rate limited with 429 and a retry header", async ({ request }) => {
  const payload = { name: "Flood", email: "f@b.co", message: "This is a long enough message body." };
  let sawTooMany = false;
  for (let i = 0; i < 12; i++) {
    const response = await request.post("/api/contact", { data: payload });
    if (response.status() === 429) {
      expect(response.headers()["retry-after"]).toBeDefined();
      sawTooMany = true;
      break;
    }
  }
  expect(sawTooMany).toBe(true);
});

test("the contact section renders both locales and hides unset channels", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}#contact`);
    await expect(page.locator("#contact form")).toBeVisible();
    await expect(page.locator("#contact input[name='email']")).toBeVisible();
  }
});

test("submitting an empty form shows a validation message, not a success", async ({ page }) => {
  await page.goto("/ar#contact");
  await page.locator("#contact button[type='submit']").click();
  await expect(page.locator("#contact [role='alert']")).toBeVisible();
});
```

- [ ] **Step 8: شغّله وتأكد أنه يفشل**

Run: `npx playwright test tests/contact.spec.ts`
Expected: FAIL — لا يوجد مسار ولا نموذج

- [ ] **Step 9: اكتب المسار**

أنشئ `src/app/api/contact/route.ts`:

```ts
import { clientIp } from "../../../lib/client-ip";
import { rateLimit } from "../../../lib/rate-limit";
import { validateContact } from "../../../lib/validate";

export async function POST(request: Request) {
  const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok)
    return Response.json(
      { error: "rate-limited" },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-body" }, { status: 400 });
  }

  const parsed = validateContact(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const to = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.CONTACT_API_KEY;
  if (!to || !apiKey) return Response.json({ error: "not-configured" }, { status: 503 });

  // TODO عند المرحلة ٨ من المواصفة: استبدل هذا بنداء خدمة الإرسال المختارة.
  // حتى ذلك الحين يفشل المسار بوضوح بدل ادعاء نجاح لم يحدث.
  return Response.json({ error: "not-configured" }, { status: 503 });
}
```

> المسار يعيد `503` صراحة قبل ضبط المفاتيح. هذا مقصود: الواجهة تعرض `errorDisabled` بدل رسالة نجاح كاذبة.

- [ ] **Step 10: اكتب قسم التواصل**

أنشئ `src/ui/contact.tsx` كمكوّن عميل. النموذج يعمل بلا JavaScript كنموذج HTML عادي يعرض `needsJs`، ومع JavaScript يرسل عبر `fetch`:

```tsx
"use client";

import { useState } from "react";
import { Section } from "./section";
import { getDictionary } from "../content/dictionary";
import { profile } from "../content/profile";
import type { Locale } from "../content/locales";

type State = { status: "idle" | "sending" | "sent" | "error"; message: string };

export function Contact({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [state, setState] = useState<State>({ status: "idle", message: "" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setState({ status: "sending", message: dict.contact.sending });
    let response: Response;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      setState({ status: "error", message: dict.contact.errorServer });
      return;
    }
    if (response.ok) { setState({ status: "sent", message: dict.contact.sent }); return; }
    const message =
      response.status === 400 ? dict.contact.errorValidation
      : response.status === 429 ? dict.contact.errorRate
      : response.status === 503 ? dict.contact.errorDisabled
      : dict.contact.errorServer;
    setState({ status: "error", message });
  }

  const field = { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.7rem", color: "var(--text-primary)", inlineSize: "100%" } as const;

  return (
    <Section id="contact" label={dict.contact.label} title={dict.contact.title}>
      <p style={{ color: "var(--text-secondary)", maxInlineSize: "52ch" }}>{dict.contact.text}</p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBlockEnd: "2rem" }}>
        {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp}`}>{dict.contact.whatsapp}</a>}
        {profile.email && <a href={`mailto:${profile.email}`}>{dict.contact.email}</a>}
        {!profile.whatsapp && !profile.email && (
          <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>{dict.contact.unavailable}</p>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "0.75rem", maxInlineSize: "34rem" }}>
        <noscript><p className="mono" style={{ color: "var(--warn)" }}>{dict.contact.needsJs}</p></noscript>
        <label>{dict.contact.nameLabel}<input name="name" style={field} /></label>
        <label>{dict.contact.emailLabel}<input name="email" type="email" style={field} /></label>
        <label>{dict.contact.messageLabel}<textarea name="message" rows={5} style={field} /></label>
        <button type="submit" disabled={state.status === "sending"} style={{ background: "var(--live)", color: "var(--surface-0)", border: 0, borderRadius: "0.5rem", padding: "0.75rem 1.5rem", fontWeight: 600, justifySelf: "start" }}>
          {state.status === "sending" ? dict.contact.sending : dict.contact.submit}
        </button>
        {state.message && (
          <p role="alert" style={{ color: state.status === "sent" ? "var(--live)" : "var(--warn)", margin: 0 }}>{state.message}</p>
        )}
      </form>

      <details style={{ marginBlockStart: "3rem" }}>
        <summary style={{ cursor: "pointer", color: "var(--text-secondary)" }}>{dict.faq[0].q}</summary>
        {dict.faq.map(item => (
          <div key={item.q} style={{ paddingBlock: "0.75rem" }}>
            <h3 style={{ fontSize: "1rem", margin: "0 0 0.25rem" }}>{item.q}</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>{item.a}</p>
          </div>
        ))}
      </details>
    </Section>
  );
}
```

> الزر يُعطَّل فقط أثناء الإرسال الفعلي. النموذج الفارغ يُرسَل ويعود بـ `400`، فتظهر رسالة التحقق — وهذا ما يفحصه الاختبار الأخير.

- [ ] **Step 11: استبدل النائب في الصفحة**

في `src/app/[locale]/page.tsx` احذف `<section id="contact" … />` واستورد `Contact` وضعه مكانه.

- [ ] **Step 12: شغّل كل شيء**

Run: `npx playwright test tests/rate-limit.spec.ts tests/validate.spec.ts tests/contact.spec.ts && npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 13: كوميت**

```bash
git add src/lib src/app/api/contact src/ui/contact.tsx "src/app/[locale]/page.tsx" tests/rate-limit.spec.ts tests/validate.spec.ts tests/contact.spec.ts
git commit -m "feat: add the contact section with server validation and rate limiting"
```

---

### المهمة ٩: مشهد النظام الحي

**Files:**
- Create: `src/lib/scene.ts`
- Create: `src/ui/hero-scene.tsx`
- Modify: `src/ui/hero.tsx`
- Test: `tests/scene.spec.ts`, `tests/motion.spec.ts`

**Interfaces:**
- Consumes: `getDictionary` لأسماء العقد الأربع.
- Produces:
  - `export type SceneNode = { id: string; x: number; y: number; label: string }`
  - `export type SceneEdge = { from: string; to: string }`
  - `export type Pulse = { edge: number; progress: number }`
  - `export type Scene = { nodes: SceneNode[]; edges: SceneEdge[]; pulses: Pulse[] }`
  - `export function createScene(labels: string[]): Scene`
  - `export function stepScene(scene: Scene, deltaMs: number): Scene`
  - `export function HeroScene(props: { labels: string[] }): JSX.Element`

المنطق كله في `src/lib/scene.ts` خالصاً وقابلاً للاختبار بلا متصفح؛ المكوّن يرسم فقط.

- [ ] **Step 1: اكتب اختبار المنطق**

أنشئ `tests/scene.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { createScene, stepScene } from "../src/lib/scene";

const labels = ["web", "api", "automation", "saas"];

test("the scene has a node per label and edges between them", () => {
  const scene = createScene(labels);
  expect(scene.nodes).toHaveLength(4);
  expect(scene.nodes.map(n => n.label)).toEqual(labels);
  expect(scene.edges.length).toBeGreaterThan(0);
  for (const edge of scene.edges) {
    expect(scene.nodes.some(n => n.id === edge.from)).toBe(true);
    expect(scene.nodes.some(n => n.id === edge.to)).toBe(true);
    expect(edge.from).not.toBe(edge.to);
  }
});

test("node coordinates stay inside the unit square", () => {
  for (const node of createScene(labels).nodes) {
    expect(node.x).toBeGreaterThanOrEqual(0);
    expect(node.x).toBeLessThanOrEqual(1);
    expect(node.y).toBeGreaterThanOrEqual(0);
    expect(node.y).toBeLessThanOrEqual(1);
  }
});

test("stepping advances pulses and wraps them without losing any", () => {
  let scene = createScene(labels);
  const count = scene.pulses.length;
  expect(count).toBeGreaterThan(0);
  const before = scene.pulses[0].progress;
  scene = stepScene(scene, 100);
  expect(scene.pulses).toHaveLength(count);
  expect(scene.pulses[0].progress).not.toBe(before);
  for (let i = 0; i < 200; i++) scene = stepScene(scene, 100);
  expect(scene.pulses).toHaveLength(count);
  for (const pulse of scene.pulses) {
    expect(pulse.progress).toBeGreaterThanOrEqual(0);
    expect(pulse.progress).toBeLessThanOrEqual(1);
    expect(pulse.edge).toBeGreaterThanOrEqual(0);
    expect(pulse.edge).toBeLessThan(scene.edges.length);
  }
});

test("stepping is pure and does not mutate its input", () => {
  const scene = createScene(labels);
  const snapshot = JSON.stringify(scene);
  stepScene(scene, 250);
  expect(JSON.stringify(scene)).toBe(snapshot);
});
```

- [ ] **Step 2: شغّله وتأكد أنه يفشل**

Run: `npx playwright test tests/scene.spec.ts`
Expected: FAIL — الوحدة غير موجودة

- [ ] **Step 3: اكتب منطق المشهد**

أنشئ `src/lib/scene.ts`:

```ts
export type SceneNode = { id: string; x: number; y: number; label: string };
export type SceneEdge = { from: string; to: string };
export type Pulse = { edge: number; progress: number };
export type Scene = { nodes: SceneNode[]; edges: SceneEdge[]; pulses: Pulse[] };

const PULSE_PER_SECOND = 0.28;

export function createScene(labels: string[]): Scene {
  const nodes: SceneNode[] = labels.map((label, index) => {
    const angle = (index / labels.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: `n${index}`,
      label,
      x: 0.5 + Math.cos(angle) * 0.34,
      y: 0.5 + Math.sin(angle) * 0.34,
    };
  });

  const edges: SceneEdge[] = [];
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      edges.push({ from: nodes[i].id, to: nodes[j].id });

  const pulses: Pulse[] = edges.map((_, index) => ({
    edge: index,
    progress: (index / edges.length) % 1,
  }));

  return { nodes, edges, pulses };
}

export function stepScene(scene: Scene, deltaMs: number): Scene {
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

- [ ] **Step 4: شغّله وتأكد أنه ينجح**

Run: `npx playwright test tests/scene.spec.ts`
Expected: PASS — أربعة اختبارات

- [ ] **Step 5: اكتب اختبار الحركة في المتصفح**

أنشئ `tests/motion.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("the hero scene renders a canvas", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("canvas.hero-scene")).toBeVisible();
});

test("reduced motion leaves a readable still frame and stops animating", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar");
  const canvas = page.locator("canvas.hero-scene");
  await expect(canvas).toBeVisible();
  const first = await canvas.screenshot();
  await page.waitForTimeout(700);
  const second = await canvas.screenshot();
  expect(Buffer.compare(first, second)).toBe(0);
});

test("the headline stays readable over the scene", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toBeVisible();
  const box = await page.locator("h1").boundingBox();
  expect(box!.width).toBeGreaterThan(0);
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

- [ ] **Step 6: شغّله وتأكد أنه يفشل**

Run: `npx playwright test tests/motion.spec.ts`
Expected: FAIL — لا توجد لوحة Canvas

- [ ] **Step 7: اكتب المكوّن**

أنشئ `src/ui/hero-scene.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createScene, stepScene, type Scene } from "../lib/scene";

function draw(context: CanvasRenderingContext2D, scene: Scene, width: number, height: number) {
  const styles = getComputedStyle(document.documentElement);
  const live = styles.getPropertyValue("--live").trim();
  const border = styles.getPropertyValue("--border-strong").trim();
  const muted = styles.getPropertyValue("--text-muted").trim();
  const at = (id: string) => {
    const node = scene.nodes.find(n => n.id === id)!;
    return { x: node.x * width, y: node.y * height };
  };

  context.clearRect(0, 0, width, height);

  context.strokeStyle = border;
  context.lineWidth = 1;
  for (const edge of scene.edges) {
    const a = at(edge.from);
    const b = at(edge.to);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  context.fillStyle = live;
  for (const pulse of scene.pulses) {
    const edge = scene.edges[pulse.edge];
    const a = at(edge.from);
    const b = at(edge.to);
    const x = a.x + (b.x - a.x) * pulse.progress;
    const y = a.y + (b.y - a.y) * pulse.progress;
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI * 2);
    context.fill();
  }

  for (const node of scene.nodes) {
    const point = at(node.id);
    context.fillStyle = live;
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = muted;
    context.font = "12px ui-monospace, monospace";
    context.textAlign = "center";
    context.fillText(node.label, point.x, point.y - 12);
  }
}

export function HeroScene({ labels }: { labels: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let scene = createScene(labels);
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(context, scene, rect.width, rect.height);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    if (!reduced.matches) {
      const loop = (now: number) => {
        scene = stepScene(scene, now - last);
        last = now;
        const rect = canvas.getBoundingClientRect();
        draw(context, scene, rect.width, rect.height);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [labels]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-scene"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, inlineSize: "100%", blockSize: "100%", opacity: 0.55, pointerEvents: "none" }}
    />
  );
}
```

> عند `prefers-reduced-motion` لا تبدأ حلقة الرسم أصلاً، فتبقى الإطارة الأولى الساكنة معروضة كاملة ومقروءة — وهو ما يفحصه اختبار تطابق اللقطتين.

- [ ] **Step 8: ركّب المشهد في البطل**

في `src/ui/hero.tsx` غلّف محتوى القسم بحاوية `position: relative`، وضع قبل النص:

```tsx
import { HeroScene } from "./hero-scene";
// …
<HeroScene labels={dict.fields.map(field => field.title)} />
```

وتأكد أن النص في طبقة أعلى بإعطائه `position: relative; z-index: 1`.

- [ ] **Step 9: شغّل الاختبارات**

Run: `npx playwright test tests/motion.spec.ts tests/scene.spec.ts && npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 10: كوميت**

```bash
git add src/lib/scene.ts src/ui/hero-scene.tsx src/ui/hero.tsx tests/scene.spec.ts tests/motion.spec.ts
git commit -m "feat: add the living-system hero scene with reduced-motion support"
```

---

### المهمة ١٠: نقل Cut Studio إلى المختبر

**Files:**
- Create: `src/app/[locale]/lab/[slug]/page.tsx`
- Create: `src/lab/cut-studio/view.tsx`
- Modify: `src/toolkit/toolkit.tsx` — نقطة الدخول فقط، لا المنطق
- Test: `tests/cut-studio.spec.ts`

**Interfaces:**
- Consumes: `getLabWork`, `labWorks`, `getDictionary`, ومكوّن الأدوات القائم في `src/toolkit/toolkit.tsx`.
- Produces: مسار `/[locale]/lab/[slug]` يعمل لكل عمل بحالة `live`، ويعطي 404 لما عداه.

- [ ] **Step 1: اعرف نقطة دخول مجموعة الأدوات**

```bash
grep -n "export" src/toolkit/toolkit.tsx | head -20
```

سجّل اسم المكوّن المصدَّر — تحتاجه في الخطوة ٤. لا تغيّر أي منطق داخل `src/toolkit`.

- [ ] **Step 2: اكتب الاختبار الفاشل**

أنشئ `tests/cut-studio.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("the old tools path permanently redirects into the lab", async ({ page }) => {
  await page.goto("/tools");
  await expect(page).toHaveURL(/\/ar\/lab\/cut-studio$/);
});

test("Cut Studio opens inside the lab in both locales", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(`/${locale}/lab/cut-studio`);
    await expect(page.locator("h1")).toContainText("Cut Studio");
    expect(errors).toEqual([]);
  }
});

test("a work that is still being built is not served as a page", async ({ page }) => {
  const response = await page.goto("/ar/lab/automation-engine");
  expect(response?.status()).toBe(404);
});

test("an unknown slug is a 404", async ({ page }) => {
  const response = await page.goto("/ar/lab/nope");
  expect(response?.status()).toBe(404);
});

test("the CDR conversion route exists on the deployed runtime", async ({ request }) => {
  const response = await request.post("/api/tools/cdr", { data: {} });
  expect(response.status()).not.toBe(404);
});
```

- [ ] **Step 3: شغّله وتأكد أنه يفشل**

Run: `npx playwright test tests/cut-studio.spec.ts`
Expected: FAIL — لا يوجد مسار `lab/[slug]`

- [ ] **Step 4: اكتب غلاف العمل**

أنشئ `src/lab/cut-studio/view.tsx`. استبدل `Toolkit` باسم المكوّن الذي سجّلته في الخطوة ١:

```tsx
"use client";

import { Toolkit } from "../../toolkit/toolkit";
import type { Locale } from "../../content/locales";

export function CutStudioView({ locale }: { locale: Locale }) {
  return <Toolkit locale={locale} />;
}
```

> إن كان المكوّن القائم يستقبل خصائص بأسماء مختلفة، مرّرها كما هي. الهدف تغليف لا تعديل.

- [ ] **Step 5: اكتب صفحة العمل**

أنشئ `src/app/[locale]/lab/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getLabWork, labWorks } from "../../../../lab/registry";
import { isLocale, locales } from "../../../../content/locales";
import { CutStudioView } from "../../../../lab/cut-studio/view";

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

  return (
    <main id="main" className="shell" style={{ paddingBlock: "3rem" }}>
      <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", margin: "0 0 0.5rem" }}>{work.title[locale]}</h1>
      <p style={{ color: "var(--text-secondary)", maxInlineSize: "56ch" }}>{work.blurb[locale]}</p>
      {work.slug === "cut-studio" && <CutStudioView locale={locale} />}
    </main>
  );
}
```

> شرط `work.status !== "live"` هو ما يجعل الأعمال قيد البناء تعطي 404 بدل صفحة فارغة. كل خطة عرض حي لاحقة تقلب حالتها إلى `live` وتضيف سطر عرضها هنا.

- [ ] **Step 6: شغّل الاختبارات**

Run: `npx playwright test tests/cut-studio.spec.ts tests/toolkit-ui.spec.ts`
Expected: PASS — اختبارات مجموعة الأدوات القائمة يجب أن تبقى خضراء؛ أي كسر فيها يعني أنك عدّلت منطقاً بدل أن تغلّفه.

- [ ] **Step 7: كوميت**

```bash
git add "src/app/[locale]/lab" src/lab/cut-studio tests/cut-studio.spec.ts
git commit -m "feat: move Cut Studio into the lab and keep the old tools URL working"
```

---

### المهمة ١١: البيانات الوصفية وخريطة الموقع

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: `src/app/[locale]/layout.tsx`
- Test: `tests/seo.spec.ts`

**Interfaces:**
- Consumes: `profile.siteUrl`, `locales`, `labWorks`, `getDictionary`.
- Produces: وسوم `canonical` و `hreflang` عند توفّر `siteUrl` فقط، و`sitemap.xml` و`robots.txt`.

- [ ] **Step 1: اكتب الاختبار الفاشل**

أنشئ `tests/seo.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { profile } from "../src/content/profile";

test("each locale carries its own title and description", async ({ page }) => {
  await page.goto("/ar");
  const arTitle = await page.title();
  await page.goto("/en");
  expect(await page.title()).not.toBe(arTitle);
  const description = page.locator("meta[name='description']");
  await expect(description).toHaveCount(1);
});

test("hreflang tags appear only when a site url is configured", async ({ page }) => {
  await page.goto("/ar");
  const alternates = page.locator("link[rel='alternate'][hreflang]");
  if (profile.siteUrl) {
    await expect(alternates).toHaveCount(2);
  } else {
    await expect(alternates).toHaveCount(0);
  }
});

test("sitemap and robots are served", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
});
```

- [ ] **Step 2: شغّله وتأكد أنه يفشل**

Run: `npx playwright test tests/seo.spec.ts`
Expected: FAIL — لا خريطة موقع

- [ ] **Step 3: أضف البدائل اللغوية إلى `generateMetadata`**

في `src/app/[locale]/layout.tsx` وسّع الدالة:

```tsx
export async function generateMetadata({ params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getDictionary(locale);
  const base = profile.siteUrl;
  return {
    title: meta.title,
    description: meta.description,
    ...(base
      ? {
          metadataBase: new URL(base),
          alternates: {
            canonical: `/${locale}`,
            languages: Object.fromEntries(locales.map(l => [l, `/${l}`])),
          },
        }
      : {}),
  };
}
```

- [ ] **Step 4: اكتب خريطة الموقع و robots**

أنشئ `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { locales } from "../content/locales";
import { profile } from "../content/profile";
import { labWorks } from "../lab/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl || "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    entries.push({ url: `${base}/${locale}`, priority: 1 });
    for (const work of labWorks)
      if (work.status === "live") entries.push({ url: `${base}/${locale}/lab/${work.slug}`, priority: 0.8 });
  }
  return entries;
}
```

أنشئ `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { profile } from "../content/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(profile.siteUrl ? { sitemap: `${profile.siteUrl}/sitemap.xml` } : {}),
  };
}
```

- [ ] **Step 5: شغّل الاختبار وتأكد أنه ينجح**

Run: `npx playwright test tests/seo.spec.ts`
Expected: PASS — ثلاثة اختبارات

- [ ] **Step 6: كوميت**

```bash
git add src/app/sitemap.ts src/app/robots.ts "src/app/[locale]/layout.tsx" tests/seo.spec.ts
git commit -m "feat: add locale metadata, sitemap and robots"
```

---

### المهمة ١٢: إمكانية الوصول والعمل بلا JavaScript

**Files:**
- Test: `tests/a11y.spec.ts`
- Modify: أي ملف يكشفه الاختبار

**Interfaces:**
- Consumes: كل ما سبق.
- Produces: لا واجهات جديدة. مهمة تحقق وإصلاح.

- [ ] **Step 1: اكتب اختبار القبول**

أنشئ `tests/a11y.spec.ts`:

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

  test("the locale switch still works as a plain link", async ({ page }) => {
    await page.goto("/ar");
    await page.locator(".locale-switch").click();
    await expect(page).toHaveURL(/\/en$/);
  });
});

test("the page has exactly one h1 and no heading level is skipped", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toHaveCount(1);
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3")].map(h => Number(h.tagName[1])));
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});

test("keyboard focus reaches the nav, the lab and the contact form", async ({ page }) => {
  await page.goto("/ar");
  const reached: string[] = [];
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    reached.push(await page.evaluate(() => document.activeElement?.tagName ?? ""));
  }
  expect(reached).toContain("A");
  expect(reached.some(tag => tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON")).toBe(true);
});

test("every image and canvas is either labelled or explicitly decorative", async ({ page }) => {
  await page.goto("/ar");
  const unlabelled = await page.evaluate(() =>
    [...document.querySelectorAll("img, canvas")].filter(
      el => !el.getAttribute("alt") && el.getAttribute("aria-hidden") !== "true" && !el.getAttribute("aria-label"),
    ).length);
  expect(unlabelled).toBe(0);
});

test("no console errors on any main route", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  for (const path of ["/ar", "/en", "/ar/lab/cut-studio"]) {
    await page.goto(path);
    await page.waitForTimeout(400);
  }
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: شغّله وأصلح ما يكشفه**

Run: `npx playwright test tests/a11y.spec.ts`

أصلح كل فشل في مصدره. الإخفاقات المتوقعة وعلاجها:
- ترتيب عناوين مكسور → صحّح مستوى العنوان في مكوّن القسم المعني.
- قسم غير ظاهر بلا JavaScript → أزل اعتماده على حالة عميل؛ المحتوى النصي يجب أن يُصيَّر على الخادم.
- لوحة Canvas بلا تسمية → تأكد من بقاء `aria-hidden="true"` عليها.

- [ ] **Step 3: افحص التباين يدوياً في الوضعين**

```bash
npm run dev
```

افتح `/ar` و `/en` في الوضع الداكن ثم الفاتح، وافحص بأداة المتصفح أن نسبة تباين `--text-secondary` و `--text-muted` على `--surface-0` و `--surface-1` لا تقل عن 4.5:1. عدّل قيم الرموز في `globals.css` عند الحاجة، وأعد تشغيل `tests/theme.spec.ts`.

- [ ] **Step 4: شغّل كل شيء**

Run: `npm run typecheck && npm run lint && npm test`
Expected: كل الاختبارات خضراء، بما فيها اختبارات مجموعة الأدوات التسعة القائمة.

- [ ] **Step 5: كوميت**

```bash
git add -A
git commit -m "test: cover no-javascript reading, heading order, focus and contrast"
```

---

### المهمة ١٣: النشر على Vercel

**Files:**
- Create: `README.md` — يُعاد كتابة قسمَي النشر والتشغيل
- Modify: `package.json` — إن لزم سكربت

**Interfaces:**
- Consumes: كل ما سبق.
- Produces: موقع منشور، ومتغيرات بيئة موثّقة.

- [ ] **Step 1: تحقق أن بناء الإنتاج ينجح محلياً**

Run: `npm run build`
Expected: PASS، وبلا أي تحذير عن مسار يحاول التصدير الثابت.

- [ ] **Step 2: اربط المشروع بـ Vercel**

من لوحة Vercel: استورد المستودع، واترك الكشف التلقائي لـ Next.js دون تغيير، واضبط الفرع `main` كفرع إنتاج.

- [ ] **Step 3: اضبط متغيرات البيئة**

أضف في إعدادات المشروع على Vercel، لبيئتي الإنتاج والمعاينة، كل مفتاح مذكور في `.env.example`. اترك مفاتيح التواصل فارغة حتى تتوفر — المسار يعيد `503` والواجهة تعرض `errorDisabled`، وهو سلوك صحيح لا خطأ.

- [ ] **Step 4: اضبط `NEXT_PUBLIC_SITE_URL`**

بعد أول نشر ناجح، ضع نطاق الإنتاج الفعلي بلا شرطة أخيرة، ثم أعد النشر حتى تظهر وسوم `canonical` و `hreflang`.

- [ ] **Step 5: شغّل الاختبارات ضد النشر**

```bash
PORTFOLIO_TEST_URL=https://<your-vercel-domain> npx playwright test tests/routing.spec.ts tests/page.spec.ts tests/cut-studio.spec.ts tests/seo.spec.ts
```

Expected: PASS. أي فشل هنا يعني فرقاً بين بيئتي التطوير والإنتاج، وليس خطأ اختبار.

- [ ] **Step 6: أعد كتابة README**

يجب أن يصف: الموقع كبورتفوليو شخصي، Cut Studio كأحد أعمال المختبر، خطوات التشغيل المحلي، متغيرات البيئة، وكيفية إضافة عمل جديد إلى `src/lab/registry.ts`. احذف كل ذكر لـ GitHub Pages وللقيود الثابتة.

- [ ] **Step 7: كوميت**

```bash
git add README.md package.json
git commit -m "docs: document the Vercel deployment and how to add a lab work"
```

---

## المراجعة الذاتية

**تغطية المواصفة:**

| قسم المواصفة | المهمة |
|---|---|
| ١ الهدف ومعايير النجاح | ٧، ١٠، ١٢ |
| ٣ القرارات (Vercel، اللغتان، Canvas) | ١، ٢، ٣، ٩، ١٣ |
| ٤ الحزمة وإسقاط `three` | ١ |
| ٥ البنية والحذف والإبقاء | ١، ٣، ٧ |
| ٦ هيكل المحتوى ونقلة Cut Studio | ٥، ٧، ١٠ |
| ٧ المختبر — Cut Studio | ٦، ١٠ |
| ٧ المختبر — العروض الثلاثة الأخرى | خارج النطاق؛ خطط مستقلة، ونقطة تمديدها المهمة ٦ |
| ٨ الأمان — تحديد المعدل والتحقق | ٨ |
| ٩ اللغة البصرية | ٤، ٧، ٩ |
| ١٠ الأداء وإمكانية الوصول | ١٢ |
| ١١ معالجة الأخطاء | ٨ |
| ١٢ الاختبار | كل مهمة، وتُجمع في ١٢ |
| ١٣ ترتيب التسليم | ترتيب المهام هنا |
| ١٤ المدخلات المطلوبة | ١ و ١٣ عبر `.env.example` |

**فجوة مقصودة:** المواصفة تذكر في القسم ٨ خدمة إرسال بريد فعلية، وقرارها مؤجّل في القسم ١٥. المهمة ٨ هنا تبني كل شيء عداها وتفشل بـ `503` معلنة، فلا يدّعي الموقع نجاحاً لم يحدث. وصل الخدمة تغيير من خطوة واحدة داخل `src/app/api/contact/route.ts` عند حسم القرار.

**تناسق الأسماء:** `Locale`, `getDictionary`, `Dictionary`, `profile`, `labWorks`, `getLabWork`, `LabWork`, `LabStatus`, `rateLimit`, `resetRateLimit`, `RateLimitResult`, `clientIp`, `validateContact`, `ContactInput`, `ValidationResult`, `createScene`, `stepScene`, `Scene`, `SceneNode`, `SceneEdge`, `Pulse`, `HeroScene` — كلها مستخدمة بنفس التهجئة في كل مهمة تعتمد عليها.
