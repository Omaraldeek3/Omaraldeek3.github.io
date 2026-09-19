import Link from "next/link";
import { copy, profile, type Locale } from "@/content/site";
import { ProjectBrief } from "./interactions";

export function Arrow() { return <span className="direction-arrow" aria-hidden="true">↗</span>; }
// Copy keeps Latin words inside Arabic sentences in [brackets]. They render as
// <bdi> so the punctuation around them stays put in RTL. Plain text in, nodes out.
export function isolated(text: string) {
  return text.split(/\[([^\]]+)\]/g).map((part, index) => index % 2 ? <bdi key={index}>{part}</bdi> : part);
}
export function SectionHeading({ label, title, text }: { label: string; title: string; text?: string }) {
  return <div className="section-heading"><span className="eyebrow">{label}</span><div><h2>{title}</h2>{text && <p>{text}</p>}</div></div>;
}
export function Contact({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const whatsapp = /^\d{7,15}$/.test(profile.whatsapp) ? `https://wa.me/${profile.whatsapp}` : null;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : null;
  return <section id="contact" className="contact-section"><div className="wrap"><span className="eyebrow">{t.contactKicker}</span><h2>{t.contactTitle}</h2><div className="contact-bottom"><p>{t.contactText}</p><div className="contact-links">{whatsapp && <a className="button button-gold" href={whatsapp} target="_blank" rel="noopener noreferrer">{t.whatsapp}<Arrow /></a>}{email && <a className="button button-outline" href={`mailto:${email}`}>{t.email}<Arrow /></a>}{!whatsapp && !email && <p className="contact-pending">{t.pendingContact}</p>}<ProjectBrief text={{prepare:t.prepare, briefTitle:t.briefTitle, briefHelp:t.briefHelp, nameLabel:t.nameLabel, ideaLabel:t.ideaLabel, briefSubmit:t.briefSubmit, briefError:t.briefError, briefDone:t.briefDone, briefNeedsJS:t.briefNeedsJS}} /></div></div></div></section>;
}
export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return <footer className="footer wrap"><div className="footer-top"><Link href={`/${locale}`} className="footer-brand">{profile.name[locale]}</Link><p>{t.footerNote}</p><a href="#top">{t.backTop}<span aria-hidden="true">↑</span></a></div><div className="footer-signature" aria-hidden="true" dir="ltr">OMAR ALDEEK</div><div className="footer-legal"><span>© {new Date().getFullYear()} {profile.name[locale]}. {t.rights}.</span><span>{profile.location[locale]}</span></div></footer>;
}
