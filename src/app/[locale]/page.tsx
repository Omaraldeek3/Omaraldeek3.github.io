import { notFound } from "next/navigation";
import { copy } from "@/content/site";
import { isLocale } from "@/content/locales";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main">
      <h1>{copy[locale].heroLines[0]}</h1>
    </main>
  );
}
