import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { copy, profile } from "@/content/site";
import { isLocale, locales } from "@/content/locales";
import { Nav } from "@/ui/nav";
import { Footer } from "@/ui/footer";
import { PointerFx } from "@/ui/pointer-fx";
import "../globals.css";
// After the base sheet, so these rules win ties with it.
import "../lab.css";
import "../motion.css";
import "../saas.css";

// Every face is served from node_modules, so a visit makes no font request to
// any third party. Tajawal is the Arabic counterpart to the Latin grotesk:
// same geometry, same weight at display size, so a headline reads the same in
// either language. Tajawal ships as static cuts, hence the weight list.
const arabic = localFont({
  src: [
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2", weight: "400" },
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-500-normal.woff2", weight: "500" },
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2", weight: "700" },
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-900-normal.woff2", weight: "900" },
  ],
  variable: "--font-ar-loaded",
  display: "swap",
});

const latin = localFont({
  src: "../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-en-loaded",
  weight: "300 700",
  display: "swap",
});

const mono = localFont({
  src: "../../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-mono-loaded",
  weight: "100 800",
  display: "swap",
});

export const viewport: Viewport = {
  // One scheme only. The site is built on a single dark surface, so a light
  // theme would be a second design, not a variant of this one.
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = copy[locale];
  return {
    title: { default: t.title, template: `%s — ${profile.name[locale]}` },
    description: t.description,
    // hreflang and canonical need a real origin; without one they are omitted
    // rather than pointing at an invented domain.
    ...(profile.siteUrl
      ? {
          metadataBase: new URL(profile.siteUrl),
          alternates: { canonical: `/${locale}`, languages: { ar: "/ar", en: "/en" } },
        }
      : {}),
    openGraph: {
      title: t.title,
      description: t.description,
      locale: locale === "ar" ? "ar_PS" : "en_US",
      type: "website",
      siteName: profile.name[locale],
    },
    twitter: { card: "summary", title: t.title, description: t.description },
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${arabic.variable} ${latin.variable} ${mono.variable}`}
    >
      <body>
        {/* Driven entirely by a scroll timeline in CSS; with no such timeline
            it stays at zero width, which is what it should show. */}
        <div className="scroll-progress" aria-hidden="true" />
        <Nav locale={locale} />
        {children}
        <Footer locale={locale} />
        <PointerFx />
      </body>
    </html>
  );
}
