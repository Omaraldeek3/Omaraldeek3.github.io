"use client";

import { LazyMotion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState, useEffect, useSyncExternalStore, type ReactNode, type CSSProperties, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { copy, Locale } from "@/content/site";
import * as m from "motion/react-m";
import { useMediaQuery } from "@/components/use-media-query";

const timing = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
const spring = { stiffness: 120, damping: 24, mass: 0.6 };
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
  return reduced ? null : <m.div className="page-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  // Content is visible in server HTML; animations never gate reading.
  return <m.div className={className} initial={{ y: reduced ? 0 : 14 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={reduced ? { duration: 0 } : timing}>{children}</m.div>;
}

export function HeroTitle({ lines }: { lines: string[] }) {
  const reduced = useReducedMotion();
  return <h1>{lines.map((line, i) => <m.span key={line} className={i === lines.length - 1 ? "hero-accent" : ""} initial={{ y: reduced ? 0 : 14 }} animate={{ y: 0 }} transition={reduced ? { duration: 0 } : { ...timing, delay: i * 0.09 }}>{line}</m.span>)}</h1>;
}

export function HeroComposition(props: { children: ReactNode; caption: string }) {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 701px) and (prefers-reduced-motion: no-preference)");
  if (enabled) return <InteractiveHeroComposition {...props} />;
  return <div className="hero-composition"><div className="composition-cards">{props.children}</div><div className="composition-caption"><span className="caption-line" aria-hidden="true" />{props.caption}<span className="mono">01 / 03</span></div></div>;
}

function InteractiveHeroComposition({ children, caption }: { children: ReactNode; caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(y, spring), rotateY = useSpring(x, spring);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, -36]);
  return <div className="hero-composition" ref={ref} onPointerMove={e => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - box.left) / box.width - 0.5) * 5);
    y.set(-((e.clientY - box.top) / box.height - 0.5) * 5);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>
    <div className="composition-grid" aria-hidden="true" />
    <m.div className="composition-cards" initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} transition={reduced ? { duration: 0 } : { ...timing, delay: 0.12 }} style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, y: reduced ? 0 : lift }}>{children}</m.div>
    <div className="composition-caption"><span className="caption-line" aria-hidden="true" />{caption}<span className="mono">01 / 03</span></div>
  </div>;
}

export function StackCard(props: { children: ReactNode; index: number }) {
  const enabled = useMediaQuery("(min-width: 1025px) and (min-height: 850px) and (prefers-reduced-motion: no-preference)");
  if (enabled) return <AnimatedStackCard {...props} />;
  return <article className="work-card" style={{"--card-index":props.index} as CSSProperties}>{props.children}</article>;
}

function AnimatedStackCard({ children, index }: { children: ReactNode; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 18%", "end 10%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);
  return <m.article ref={ref} className="work-card" style={{ "--card-index": index, scale: reduced ? 1 : scale } as CSSProperties} >{children}</m.article>;
}

export function Process({ steps }: { steps: Text["steps"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const vertical = useMediaQuery("(max-width: 700px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  return <div ref={ref} className="process-timeline"><div className="process-track" aria-hidden="true"><m.div style={{ scaleX: reduced || vertical ? 1 : scrollYProgress, scaleY: reduced || !vertical ? 1 : scrollYProgress }} /></div><ol className="process-list">{steps.map((step, i) => <li key={step.title}><span className="step-number mono">0{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></div>;
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
