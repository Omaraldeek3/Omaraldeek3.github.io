import { notFound } from "next/navigation";
import { isLocale } from "@/content/locales";
import { Hero } from "@/ui/hero";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main">
      <Hero locale={locale} />
      <section id="lab" />
      <section id="process" />
      <section id="about" />
      <section id="contact" />
    </main>
  );
}
