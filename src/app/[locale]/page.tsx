import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale, profile, projects } from "@/content/site";
import { HeroTitle } from "@/components/interactions";
import { HeroContour, Hairline, PointerReadout } from "@/components/cut-line";
import { FactoryTrack } from "@/components/factory";
import { BoxFlat } from "@/components/box-flat";
import { titles, toolIds } from "@/toolkit/copy";
import { SitePreview } from "@/components/preview";
import { Contact, Footer, isolated, validUrl } from "@/components/sections";

// With JavaScript off the decorative strokes must still be drawn, so the
// motion initial states are overridden here. <noscript> keeps this page-scoped.
const NO_SCRIPT_STYLE = ".v2 .hero-contour path,.v2 .footer-contour path,.v2 .studio-box path,.v2 .hairline{stroke-dasharray:none !important;transform:none !important}.v2 .contour-fallback{visibility:visible}";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = copy[locale];
  // Every Arabic entry point to Cut Studio uses the query, never a path.
  const toolsHref = locale === "ar" ? "/tools?lang=ar" : "/tools";
  // The channel link renders only when the profile holds a valid https URL.
  const youtube = validUrl(profile.links.youtube);
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
      <section id="systems-flow" className="factory">
        <div className="wrap">
          <div className="factory-head">
            <span className="eyebrow">{t.factoryLabel}</span>
            <h2>{t.factoryTitle}</h2>
            <p className="factory-intro">{t.factoryIntro}</p>
          </div>
          <div className="factory-body">
            <div className="factory-list">
              <FactoryTrack />
              <ol className="factory-stations">
                {t.stations.map(station => <li className="station" key={station.code}>
                  <span className="station-code mono" dir="ltr">{station.code}</span>
                  <div className="station-body">
                    <h3>{station.title}</h3>
                    <p className="station-text">{isolated(station.text)}</p>
                    <div className="station-tags">{station.tags.map(tag => <span key={tag} dir="ltr">{tag}</span>)}</div>
                  </div>
                </li>)}
              </ol>
            </div>
            <aside className="oversight">
              <h3>{t.oversightTitle}</h3>
              <p>{isolated(t.oversightText)}</p>
              <div className="oversight-tags">{t.oversightTags.map(tag => <span key={tag} dir="ltr">{tag}</span>)}</div>
            </aside>
          </div>
          {youtube && <p className="factory-channel"><a href={youtube} target="_blank" rel="noopener noreferrer">{t.watchChannel}<span aria-hidden="true">↗</span></a></p>}
        </div>
      </section>
      <section id="cut-studio" className="studio">
        <div className="wrap studio-inner">
          <BoxFlat />
          <div className="studio-copy">
            <span className="eyebrow">{t.toolsLabel}</span>
            <h2>{isolated(t.toolsTitle)}</h2>
            <p className="studio-text">{isolated(t.toolsText)}</p>
            <ol className="studio-tools">
              {toolIds.map((id, index) => <li key={id}><span className="mono" dir="ltr">{String(index + 1).padStart(2, "0")}</span><span className="name">{titles[id][locale === "ar" ? 1 : 0]}</span></li>)}
            </ol>
            <div className="studio-actions"><Link className="button button-sheet" href={toolsHref}>{t.toolsCta}<span aria-hidden="true">↗</span></Link></div>
            <p className="studio-small">{isolated(t.toolsSmallPrint)}</p>
          </div>
        </div>
      </section>
      <section id="studies" className="studies">
        <div className="wrap">
          <div className="studies-head">
            <span className="eyebrow">{t.studiesLabel}</span>
            <h2>{t.studiesTitle}</h2>
            <p className="studies-intro">{t.studiesIntro}</p>
          </div>
          <div className="studies-strip">
            {projects.map(project => <Link className="study" href={`/${locale}/work/${project.slug}`} key={project.slug}>
              <div className="study-frame"><SitePreview project={project} locale={locale} imageSizes="(max-width: 1024px) 78vw, 30vw" /></div>
              <div className="study-meta">
                <h3>{project[locale].name}</h3>
                <span className="study-disclosure">{t.concept}</span>
              </div>
            </Link>)}
          </div>
        </div>
      </section>
      <section className="principles">
        <div className="wrap">
          <h2>{t.principlesTitle}</h2>
          <ol className="principle-list">
            {t.principles.map((principle, index) => <li key={principle}><span className="mono" dir="ltr">{`0${index + 1}`}</span>{principle}</li>)}
          </ol>
        </div>
      </section>
      <Contact locale={locale} />
    </main>
    <Footer locale={locale} cut />
  </div>;
}
