import { previewCopy } from "@/content/previews";
import Image from "next/image";
import type { Locale, Project } from "@/content/site";
import { demoCopy } from "@/content/demo";

export function SitePreview({ project, locale, priority = false, interactive = false, imageSizes }: { project: Project; locale: Locale; priority?: boolean; interactive?: boolean; imageSizes?: string }) {
  const t = previewCopy[locale][project.theme as keyof typeof previewCopy.en];
  return <div className={`site-preview ${project.theme}`} dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="preview-window">
      <div className="preview-browser" dir="ltr"><div><i /><i /><i /></div><span>{project.slug}.concept</span><span>↗</span></div>
      <div className="preview-nav"><strong>{t.brand}<span className="brand-dot">.</span></strong><div>{t.nav.map((n, i) => interactive ? <a key={n} href={`#demo-section-${i}`}>{n}</a> : <span key={n}>{n}</span>)}</div>{!interactive && <span className="preview-menu" aria-hidden="true">☰</span>}</div>
      <div className="preview-body">
        <div className="preview-copy"><span className="preview-eyebrow">{t.eyebrow}</span><div className="preview-heading">{t.title}</div><p>{t.text}</p>{interactive ? <a className="preview-cta" href="#demo-section-1">{t.action}<span aria-hidden="true">↗</span></a> : <span className="preview-cta">{t.action}<span aria-hidden="true">↗</span></span>}</div>
        {project.theme === "coffee" && <div className="preview-image coffee-image"><Image src="/images/coffee.jpg" alt={locale === "ar" ? "حبوب قهوة محمصة بتفاصيلها الغنية" : "Richly textured roasted coffee beans"} fill sizes={imageSizes || "(max-width: 700px) 85vw, 45vw"} loading={priority ? "eager" : "lazy"} /><span className="coffee-stamp" aria-hidden="true">F<br />✳</span><span className="image-caption">{t.small}</span></div>}
        {project.theme === "interior" && <div className="preview-image interior-image"><Image src="/images/interior.jpg" alt={locale === "ar" ? "مساحة معيشة هادئة بألوان طبيعية وأثاث معاصر" : "A calm living space with natural tones and contemporary furniture"} fill sizes={imageSizes || "92vw"} loading={priority ? "eager" : "lazy"} /><span className="image-caption">{t.small}</span></div>}
        {project.theme === "business" && <div className="business-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="orbit-dot" /><span className="orbit-caption">M<br />—</span></div>}
      </div>
      <div className="preview-footer"><span>{t.foot}</span><span dir="ltr">{project.number} / 03</span></div>
    </div>
  </div>;
}

export function DemoContent({ project, locale }: { project: Project; locale: Locale }) {
  const t = previewCopy[locale][project.theme as keyof typeof previewCopy.en];
  return <div className={`demo-extra ${project.theme}`}><span className="eyebrow">{t.foot}</span><h2>{t.small}</h2><div className="demo-columns">{t.nav.map((title, i) => <section id={`demo-section-${i}`} key={title}><span className="mono">0{i + 1}</span><h3>{title}</h3><p>{demoCopy[locale][project.theme as keyof typeof demoCopy.en][i]}</p></section>)}</div></div>;
}
