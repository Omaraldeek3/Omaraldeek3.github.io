import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { copy, profile } from "@/content/site";
import { isLocale, locales } from "@/content/locales";
import { Nav } from "@/ui/nav";
import { Footer } from "@/ui/footer";
import "../globals.css";

// Every face is served from node_modules, so a visit makes no font request to
// any third party. Arabic gets two of them, the way a printed page does: a
// geometric Kufi cut for the display sizes and a humanist one for reading.
const arabic = localFont({
  src: "../../../node_modules/@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2",
  variable: "--font-ar-loaded",
  weight: "200 1000",
  display: "swap",
});

const arabicDisplay = localFont({
  src: "../../../node_modules/@fontsource-variable/noto-kufi-arabic/files/noto-kufi-arabic-arabic-wght-normal.woff2",
  variable: "--font-ar-display-loaded",
  weight: "100 900",
  display: "swap",
});

const latin = localFont({
  src: "../../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-en-loaded",
  weight: "200 800",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#14120e" },
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
  ],
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
      className={`${arabic.variable} ${arabicDisplay.variable} ${latin.variable}`}
    >
      <body>
        <Nav locale={locale} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
