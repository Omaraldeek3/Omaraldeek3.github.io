import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./mada.css";

const arabic = localFont({
  src: [
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2", weight: "400" },
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-500-normal.woff2", weight: "500" },
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2", weight: "700" },
    { path: "../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-900-normal.woff2", weight: "900" },
  ],
  variable: "--font-mada-arabic",
  display: "swap",
});

const latin = localFont({
  src: "../../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-mada-latin",
  weight: "200 800",
  display: "swap",
});

const publicOrigin = process.env.MADA_PUBLIC_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(publicOrigin ? { metadataBase: new URL(publicOrigin) } : {}),
  title: { default: "مدى | عمل يجمعكم. ورؤية تأخذكم أبعد.", template: "%s | مدى" },
  description: "مساحة عربية لإدارة المشاريع والمهام والفريق. اجمع تفاصيل العمل، حدّد الأولويات، وتابع التقدّم من مكان واحد.",
  icons: { icon: "/mada/icon.svg" },
  openGraph: {
    title: "مدى | مساحة واحدة. رؤية أبعد.",
    description: "مشاريعك، مهامك، وفريقك. كلّها في مدى.",
    siteName: "مدى",
    locale: "ar_AR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f9fd",
  colorScheme: "light",
};

export default function MadaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} ${latin.variable}`}>
      <body className="mada-body">{children}</body>
    </html>
  );
}
