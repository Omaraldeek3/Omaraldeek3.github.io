"use client";

import { LazyMotion, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, useEffect, useSyncExternalStore, type ReactNode, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { copy, Locale } from "@/content/site";
import * as m from "motion/react-m";

const timing = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type Text = typeof copy.en;
const loadMotionFeatures = () => import("./motion-features").then(module => module.default);
export function MotionProvider({children}:{children:ReactNode}) { return <LazyMotion features={loadMotionFeatures} strict>{children}</LazyMotion>; }

export function Navigation({ locale, name, location, text: t }: { locale: Locale; name: string; location: string; text: Pick<Text,"nav"|"navigation"|"discuss"|"menu"|"close"|"wordmarkLine"|"free"> }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const other = locale === "ar" ? "en" : "ar";
  const switchUrl = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  function close() { dialog.current?.close(); setOpen(false); trigger.current?.focus(); }
  // The header is shared with /work/[slug], so every section link is absolute:
  // a bare "#code" would point at an anchor those pages do not have.
  const toolsHref = locale === "ar" ? "/tools?lang=ar" : "/tools";
  const sections = [{ id: "code", label: t.nav[0] }, { id: "design", label: t.nav[1] }, { id: "systems", label: t.nav[2] }];
  const toolsLabel = t.nav[3];
  return <>
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <Link href={`/${locale}`} className="wordmark" aria-label={name}><span>{name}<small>{t.wordmarkLine}</small></span></Link>
      <nav className="desktop-nav" aria-label={t.navigation}>{sections.map(section => <a href={`/${locale}#${section.id}`} key={section.id}>{section.label}</a>)}<Link className="nav-tools" href={toolsHref}>{toolsLabel}<span className="nav-free">{t.free}</span></Link></nav>
      <div className="nav-actions"><Link className="language-switch" href={switchUrl} lang={other} hrefLang={other} aria-label={other === "en" ? "Switch to English" : "التبديل إلى العربية"}><span aria-hidden="true">◎</span>{other === "en" ? "EN" : "عربي"}</Link><a href={`/${locale}#contact`} className="nav-contact">{t.discuss}<span className="direction-arrow" aria-hidden="true">↗</span></a><button ref={trigger} type="button" className="menu-toggle" aria-label={t.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => { dialog.current?.showModal(); setOpen(true); }}><span /><span /></button></div>
    </header>
    <dialog ref={dialog} id="mobile-navigation" className="mobile-dialog" aria-label={t.navigation} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === dialog.current) close(); }} onKeyDown={e => {
      if (e.key !== "Tab") return;
      const items = dialog.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}><div className="mobile-dialog-inner"><button className="dialog-close" aria-label={t.close} onClick={close}>×</button><span className="eyebrow">{name}</span><nav>{sections.map((section, i) => <a href={`/${locale}#${section.id}`} key={section.id} onClick={close}><span className="mono">0{i + 1}</span>{section.label}<span className="direction-arrow">↗</span></a>)}<Link href={toolsHref} onClick={close}><span className="mono">04</span>{toolsLabel}<span className="direction-arrow">↗</span></Link></nav><p>{location}</p></div></dialog>
  </>;
}

export function PageProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  // Rendered only after hydration: the server cannot know the motion preference.
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  return !hydrated || reduced ? null : <m.div className="page-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  // Content is visible in server HTML; animations never gate reading.
  return <m.div className={className} initial={{ y: 14 }} animate={reduced ? { y: 0 } : undefined} whileInView={reduced ? undefined : { y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={reduced ? { duration: 0 } : timing}>{children}</m.div>;
}

export function HeroTitle({ lines }: { lines: string[] }) {
  const reduced = useReducedMotion();
  return <h1>{lines.map((line, i) => <m.span key={line} className={i === lines.length - 1 ? "hero-accent" : ""} initial={{ y: 14 }} animate={{ y: 0 }} transition={reduced ? { duration: 0 } : { ...timing, delay: i * 0.09 }}>{line}</m.span>)}</h1>;
}

export function ProjectBrief({ text: t }: { text: Pick<Text,"prepare"|"briefTitle"|"briefHelp"|"nameLabel"|"ideaLabel"|"briefSubmit"|"briefError"|"briefDone"|"briefNeedsJS"> }) {
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const [status, setStatus] = useState("");
  function download(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const idea = String(form.get("idea") || "").trim();
    if (!name || idea.length < 10) { setStatus(t.briefError); return; }
    const text = `${t.briefTitle}\n\n${t.nameLabel}: ${name}\n\n${t.ideaLabel}:\n${idea}\n\n${t.briefHelp}`;
    const url = URL.createObjectURL(new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "project-brief.txt"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(t.briefDone);
  }
  return <details className="brief"><summary>{t.prepare}<span aria-hidden="true">+</span></summary><noscript><p>{t.briefNeedsJS}</p></noscript><form onSubmit={download}><fieldset disabled={!hydrated}><h3>{t.briefTitle}</h3><p>{t.briefHelp}</p><label htmlFor="brief-name">{t.nameLabel}</label><input id="brief-name" name="name" required maxLength={120} autoComplete="name" /><label htmlFor="brief-idea">{t.ideaLabel}</label><textarea id="brief-idea" name="idea" required minLength={10} maxLength={5000} rows={4} /><button className="button button-mint" type="submit">{t.briefSubmit}<span aria-hidden="true">↓</span></button><p role="status" aria-live="polite">{status}</p></fieldset></form></details>;
}
