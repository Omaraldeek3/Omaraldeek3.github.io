import Link from "next/link";
import { copy, profile, type Locale } from "@/content/site";
import { ProjectBrief } from "./interactions";
import { SignatureCut } from "./cut-line";

export function Arrow() { return <span className="direction-arrow" aria-hidden="true">↗</span>; }
// One gate for every profile link: a full https URL, or nothing at all.
export function validUrl(value: string) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : null; } catch { return null; }
}
// Copy keeps Latin words inside Arabic sentences in [brackets]. They render as
// <bdi> so the punctuation around them stays put in RTL. Plain text in, nodes out.
export function isolated(text: string) {
  return text.split(/\[([^\]]+)\]/g).map((part, index) => index % 2 ? <bdi key={index}>{part}</bdi> : part);
}
// Brand names are the same in both languages, so they are not in `copy`.
const linkLabels: Record<keyof typeof profile.links, string> = { github: "GitHub", linkedin: "LinkedIn", youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram", x: "X", behance: "Behance" };
export function Contact({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const whatsapp = /^\d{7,15}$/.test(profile.whatsapp) ? `https://wa.me/${profile.whatsapp}` : null;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : null;
  const links = (Object.keys(linkLabels) as (keyof typeof linkLabels)[]).flatMap(key => { const href = validUrl(profile.links[key]); return href ? [{ key, href }] : []; });
  return <section id="contact" className="contact-section"><div className="wrap"><span className="eyebrow">{t.discuss}</span><h2>{t.contactTitle}</h2><div className="contact-bottom"><div className="contact-links">{whatsapp && <a className="button button-gold" href={whatsapp} target="_blank" rel="noopener noreferrer">{t.whatsapp}<Arrow /></a>}{email && <a className="button button-outline" href={`mailto:${email}`}>{t.email}<Arrow /></a>}{links.map(link => <a className="button button-outline" key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" dir="ltr">{linkLabels[link.key]}<Arrow /></a>)}{!whatsapp && !email && !links.length && <p className="contact-pending">{t.pendingContact}</p>}<ProjectBrief text={{prepare:t.prepare, briefTitle:t.briefTitle, briefHelp:t.briefHelp, nameLabel:t.nameLabel, ideaLabel:t.ideaLabel, briefSubmit:t.briefSubmit, briefError:t.briefError, briefDone:t.briefDone, briefNeedsJS:t.briefNeedsJS}} /></div></div></div></section>;
}
// The signature is plain HTML text. The cut contour around it is decoration
// and only drawn on the home page, where v2.css styles it.
export function Footer({ locale, cut = false }: { locale: Locale; cut?: boolean }) {
  const t = copy[locale];
  const toolsHref = locale === "ar" ? "/tools?lang=ar" : "/tools";
  const signature = <p className="footer-signature" dir="ltr">OMAR ALDEEK</p>;
  return <footer className="footer wrap">
    {cut ? <SignatureCut>{signature}</SignatureCut> : signature}
    {cut && ["tl", "tr", "bl", "br"].map(corner => <span className={`reg-mark reg-mark-${corner}`} aria-hidden="true" key={corner} />)}
    <div className="footer-legal">
      <span>© {new Date().getFullYear()} · {profile.name[locale]} · {profile.location[locale]}</span>
      <Link className="cut-link" href={toolsHref}>{t.nav[3]}<span aria-hidden="true">↗</span></Link>
      <a href="#top">{t.backTop}<span aria-hidden="true">↑</span></a>
    </div>
  </footer>;
}
