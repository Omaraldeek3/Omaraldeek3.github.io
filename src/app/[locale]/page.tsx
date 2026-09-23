import { notFound } from "next/navigation";
import { isLocale } from "@/content/locales";
import { Hero } from "@/ui/hero";
import { Stats } from "@/ui/stats";
import { Ribbon } from "@/ui/ribbon";
import { copy } from "@/content/site";
import { Fields } from "@/ui/fields";
import { LabSection } from "@/ui/lab-section";
import { Process } from "@/ui/process";
import { About } from "@/ui/about";
import { Contact } from "@/ui/contact";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main">
      <Hero locale={locale} />
      <Stats locale={locale} />
      <Ribbon label={copy[locale].ribbonLabel} />
      <Fields locale={locale} />
      <LabSection locale={locale} />
      <Process locale={locale} />
      <About locale={locale} />
      <Contact locale={locale} />
    </main>
  );
}
