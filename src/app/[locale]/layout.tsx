import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { copy, isLocale, locales, profile } from "@/content/site";
import { Navigation, PageProgress, MotionProvider } from "@/components/interactions";
import "../globals.css";

const arabic = localFont({ src: [
  { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2", weight: "400", style: "normal" },
  { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-500-normal.woff2", weight: "500", style: "normal" },
  { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2", weight: "700", style: "normal" },
], variable: "--font-arabic", preload: false, display: "swap" });
const latin = localFont({ src: "../../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2", variable: "--font-latin", display: "swap", weight: "200 800" });
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0c0c0b" };
export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = copy[locale];
  return {
    title: { default: t.title, template: `%s — ${profile.name[locale]}` }, description: t.description,
    ...(profile.siteUrl ? { metadataBase: new URL(profile.siteUrl), alternates: { canonical: `/${locale}`, languages: { ar: "/ar", en: "/en" } } } : {}),
    openGraph: { title: t.title, description: t.description, locale: locale === "ar" ? "ar_PS" : "en_US", type: "website", siteName: profile.name[locale] },
    twitter: { card: "summary", title: t.title, description: t.description },
    icons: { icon: "/icon.svg" },
  };
}
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${arabic.variable} ${latin.variable}`}><body><a className="skip-link" href="#main">{copy[locale].skip}</a><MotionProvider><PageProgress /><Navigation locale={locale} name={profile.name[locale]} location={profile.location[locale]} text={{nav:copy[locale].nav, navigation:copy[locale].navigation, discuss:copy[locale].discuss, menu:copy[locale].menu, close:copy[locale].close}} />{children}</MotionProvider></body></html>;
}
