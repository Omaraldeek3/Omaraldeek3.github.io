import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale, profile } from "@/content/site";
import { HeroTitle } from "@/components/interactions";
import { HeroContour, Hairline, PointerReadout } from "@/components/cut-line";
import { isolated } from "@/components/sections";

// With JavaScript off the decorative strokes must still be drawn, so the
// motion initial states are overridden here. <noscript> keeps this page-scoped.
const NO_SCRIPT_STYLE = ".v2 .hero-contour path,.v2 .footer-contour path,.v2 .studio-box path,.v2 .hairline{stroke-dasharray:none !important;transform:none !important}";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = copy[locale];
  // Every Arabic entry point to Cut Studio uses the query, never a path.
  const toolsHref = locale === "ar" ? "/tools?lang=ar" : "/tools";
  return <div className="v2">
    <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLE }} />
    <main id="main">
      <section id="top" className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <span className="reg-mark reg-mark-tl" aria-hidden="true" />
        <span className="reg-mark reg-mark-tr" aria-hidden="true" />
        <span className="reg-mark reg-mark-bl" aria-hidden="true" />
        <span className="reg-mark reg-mark-br" aria-hidden="true" />
        <PointerReadout />
        <div className="wrap hero-copy">
          <span className="hero-eyebrow">{t.heroEyebrow}</span>
          <div className="hero-headline">
            <HeroContour><HeroTitle lines={t.heroLines} /></HeroContour>
          </div>
          <p className="hero-lead">{t.heroLead}</p>
          <div className="hero-actions">
            <Link className="button button-cut" href={toolsHref}>{t.heroCtaTools}<span aria-hidden="true">↗</span></Link>
            <a className="button button-outline" href="#systems-flow">{t.heroCtaFactory}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="wrap hero-rail">
          <span>{profile.location[locale]}</span>
          <a href="#code">{t.heroScroll}<span aria-hidden="true">↓</span></a>
        </div>
      </section>
      <section className="layers">
        <div className="wrap">
          <div className="layers-head"><h2>{t.layersLabel}</h2></div>
          <div className="layers-rows">
            {t.layers.map((layer, index) => <article className={`layer layer-${layer.id}`} id={layer.id} key={layer.id}>
              <Hairline />
              <span className="layer-numeral" aria-hidden="true">{`0${index + 1}`}</span>
              <span className="layer-tag mono" dir="ltr">{layer.tag}</span>
              <h3>{layer.title}</h3>
              <p className="layer-text">{isolated(layer.text)}</p>
              <a className="layer-proof" href={layer.proofHref}>{isolated(layer.proof)}<span aria-hidden="true">↗</span></a>
            </article>)}
          </div>
        </div>
      </section>
    </main>
  </div>;
}
