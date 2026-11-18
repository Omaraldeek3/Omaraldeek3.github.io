import { notFound } from "next/navigation";
import { isLocale } from "@/content/locales";
import { Hero } from "@/ui/hero";
import { Ribbon } from "@/ui/ribbon";
import { copy } from "@/content/site";
import { Fields } from "@/ui/fields";
import { LabSection } from "@/ui/lab-section";
import { Process } from "@/ui/process";
import { About } from "@/ui/about";
import { Contact } from "@/ui/contact";
import { FigureStage } from "@/ui/studio/figure-stage";
import { KinMotion } from "@/ui/kin-motion";
import { KinReels } from "@/ui/kin-reels";

// What the figure must never stand behind (everything but the hero, and not
// the fields section's window, which is cut out to show it).
const CONTENT = [
  ".kin-page section:not(.hero) :is(h2, h3, p, li, form, details, .glow-card, .kin-panel, .lab-card, .process-card):not(.kin-window, .kin-window *)",
  ".kin-page .ribbon",
].join(", ");

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main" className="kin-page">
      {/* The particle figure: Omar's own head ("fusion"), following the scroll
          through each section's data-scene. */}
      <KinMotion />
      <div className="kin-backdrop" aria-hidden="true">
        <FigureStage rtl={locale === "ar"} glyph="ع" className="kin-canvas kin-figure" avoid={CONTENT} />
      </div>
      <Hero locale={locale} />
      <Fields locale={locale} />
      <Ribbon label={copy[locale].ribbonLabel} />
      <KinReels locale={locale} />
      <LabSection locale={locale} />
      <Process locale={locale} />
      <About locale={locale} />
      <Contact locale={locale} />
    </main>
  );
}
