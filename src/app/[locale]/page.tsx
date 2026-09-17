import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { copy, isLocale, profile, projects } from "@/content/site";
import { HeroComposition, HeroTitle, Process, Reveal, StackCard } from "@/components/interactions";
import { SitePreview } from "@/components/preview";
import { Arrow, Contact, Footer } from "@/components/sections";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = copy[locale];
  const featured = projects[1];
  return <>
    <main id="main">
      <section id="top" className="cinema-hero">
        <HeroComposition caption={t.featuredName}>
          <Image className="cinema-background" src="/images/interior.jpg" alt={t.cinematicAlt} fill sizes="100vw" loading="eager" fetchPriority="high" />
          <div className="cinema-shade" aria-hidden="true" />
          <Link className="hero-site-inset" href={`/${locale}/work/forma`} aria-label={`${t.viewProject}: ${featured[locale].name}`}>
            <span className="inset-caption"><span>{t.featured}</span><span className="mono">FORMA / 02</span></span>
            <SitePreview project={featured} locale={locale} imageSizes="100vw" />
          </Link>
        </HeroComposition>
        <div className="hero-content wrap">
          <div className="hero-copy"><span className="eyebrow hero-eyebrow">{t.role}<span className="hero-rule" /></span><HeroTitle lines={t.heroLines} /><p className="hero-description">{t.heroText}</p><div className="hero-buttons"><a className="button button-gold" href="#contact">{t.discuss}<Arrow /></a><a className="button button-line" href="#work">{t.explore}<span aria-hidden="true">↓</span></a></div></div>
        </div>
        <div className="hero-bottom wrap"><span>{profile.location[locale]}</span><a href="#work">{t.scroll}<span aria-hidden="true">↓</span></a><span className="mono">PORTFOLIO / 2026</span></div>
      </section>

      <section id="work" className="work-section">
        <div className="collection-heading wrap"><div><span className="eyebrow">{t.workLabel}</span><h2>{t.workTitle}</h2></div><div className="collection-intro"><span className="mono">SELECTED / 01—03</span><p>{t.workIntro}</p></div></div>
        <div className="work-stack">
          {projects.map((project, i) => <StackCard index={i} key={project.slug}>
            <div className="work-titlebar wrap"><div><span className="mono work-number">0{i + 1} /</span><h3><Link href={`/${locale}/work/${project.slug}`}>{project[locale].name}</Link></h3></div><div><span>{project[locale].type}</span><span className="project-disclosure">{t.concept}</span></div><Link href={`/${locale}/work/${project.slug}`} className="round-link" aria-label={`${t.viewProject}: ${project[locale].name}`}><Arrow /></Link></div>
            <Link className={`project-stage ${project.theme}`} href={`/${locale}/work/${project.slug}`} aria-label={`${t.viewProject}: ${project[locale].name}`}>
              <span className="stage-wordmark" aria-hidden="true" dir="ltr">{project.label}</span>
              <div className="work-preview"><SitePreview project={project} locale={locale} imageSizes={project.theme === "coffee" ? "(max-width:700px) 45vw, 44vw" : "100vw"} /></div>
              <span className="stage-action">{t.viewProject}<Arrow /></span>
            </Link>
            <div className="work-caption wrap"><p>{project[locale].summary}</p><span className="mono">WEB DESIGN & DEVELOPMENT / {project.year}</span></div>
          </StackCard>)}
        </div>
      </section>

      <section id="services" className="services-section wrap">
        <div className="services-intro"><span className="eyebrow">{t.servicesLabel}</span><h2>{t.servicesStatement}</h2><p>{t.servicesIntro}</p><a className="text-link" href="#contact">{t.discuss}<Arrow /></a></div>
        <div className="service-list">{t.services.map((service, i) => <details className="service-entry" open={i === 0} key={service.title}><summary><span className="mono">0{i + 1}</span><h3>{service.title}</h3><span className="toggle-sign" aria-hidden="true">+</span></summary><div className="service-body"><p>{service.text}</p><ul>{service.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div></details>)}</div>
      </section>

      <section id="process" className="process-section"><div className="wrap"><div className="process-heading"><div><span className="eyebrow">{t.processLabel}</span><h2>{t.processTitle}</h2></div><p>{t.processIntro}</p></div><Process steps={t.steps} /></div></section>

      <section className="about-section wrap"><div className="about-statement"><span className="eyebrow">{t.aboutLabel}</span><h2>{t.aboutStatement}</h2></div><Reveal className="about-copy"><h3>{t.aboutTitle}</h3><p>{t.aboutText}</p><div className="about-signoff"><span>{profile.name[locale]}</span><span className="mono">INDEPENDENT DESIGNER</span></div></Reveal></section>

      <section className="collaboration-section wrap"><div className="collaboration-heading"><span className="eyebrow">{t.optionsLabel}</span><h2>{t.optionsTitle}</h2><p>{t.collaborationLabel}</p></div><div className="collaboration-grid">{t.options.map((option, i) => <article key={option.title}><span className="collaboration-number mono">0{i + 1}</span><h3>{option.title}</h3><p>{option.text}</p><ul>{option.items.map(item => <li key={item}>{item}</li>)}</ul>{option.price && <strong>{option.price}</strong>}</article>)}</div><div className="collaboration-footer"><p>{t.optionsNote}</p><a className="button button-outline" href="#contact">{t.quote}<Arrow /></a></div></section>

      <section className="faq-section wrap"><div className="faq-heading"><span className="eyebrow">{t.faqLabel}</span><h2>{t.faqTitle}</h2></div><div className="faq-list">{t.faq.map((item,i) => <details key={item.q}><summary><span className="mono faq-number">0{i + 1}</span><span className="question-text">{item.q}</span><span className="toggle-sign" aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></section>
      <Contact locale={locale} />
    </main>
    <Footer locale={locale} />
  </>;
}
