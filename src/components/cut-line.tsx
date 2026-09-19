"use client";

import * as m from "motion/react-m";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

const ease = [0.65, 0, 0.35, 1] as [number, number, number, number];

// motion draws a path by setting pathLength="1" and a 1px dash. Chromium applies
// that dash in screen space when the stroke is non-scaling, so a path stretched
// by preserveAspectRatio="none" draws as broken dashes. The contours therefore
// measure their box and draw in real pixels (a 1:1 viewBox). Before that, and
// with JavaScript off, a stretched 0-100 fallback is rendered: hidden by v2.css,
// shown by the page's <noscript> style.
type Size = { w: number; h: number };
function useSize() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width), h = Math.round(entry.contentRect.height);
      if (w && h) setSize(old => old && old.w === w && old.h === h ? old : { w, h });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

// One closed path: a rectangle with chamfered corners and a single notch on the
// inline-end edge.
export const CONTOUR = "M0 3 L3 0 L97 0 L100 3 L100 38 L92 45 L100 52 L100 97 L97 100 L3 100 L0 97 Z";
function contour({ w, h }: Size) {
  const c = 14, n = Math.min(26, w * 0.08);
  return `M0 ${c} L${c} 0 L${w - c} 0 L${w} ${c} L${w} ${h * 0.38} L${w - n} ${h * 0.45} L${w} ${h * 0.52} L${w} ${h - c} L${w - c} ${h} L${c} ${h} L0 ${h - c} Z`;
}

export function HeroContour({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [ref, size] = useSize();
  const d = size && contour(size);
  return <>
    <svg ref={ref} className="hero-contour" viewBox={size ? `0 0 ${size.w} ${size.h}` : "0 0 100 100"} preserveAspectRatio="none" aria-hidden="true">
      {d ? <m.path
        d={d}
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 1.4, ease }}
      /> : <path className="contour-fallback" d={CONTOUR} />}
      {d && !reduced && <m.circle
        r="3.5"
        style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 1.4, ease }}
      />}
    </svg>
    {/* When the contour closes, the headline block moves by 2px. */}
    <m.div initial={{ y: 0 }} animate={reduced ? { y: 0 } : { y: 2 }} transition={reduced ? { duration: 0 } : { duration: 0.35, delay: 1.4, ease }}>{children}</m.div>
  </>;
}

// Decorative only, and only on a fine pointer: it never carries information.
export function PointerReadout() {
  const [readout, setReadout] = useState("X 000.0 / Y 000.0");
  const frame = useRef(0);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        setReadout(`X ${event.clientX.toFixed(1)} / Y ${event.clientY.toFixed(1)}`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); if (frame.current) window.cancelAnimationFrame(frame.current); };
  }, []);
  return <span className="hero-readout mono" aria-hidden="true">{readout}</span>;
}

// A generic in-view pathLength for a real <path>, used by the box flat and the
// footer contour. Rendered inside a server-owned <svg>.
export function DrawPath({ d, delay = 0, duration = 1.1, className }: { d: string; delay?: number; duration?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <m.path
    className={className}
    d={d}
    initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
    whileInView={{ pathLength: 1 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={reduced ? { duration: 0 } : { duration, delay, ease }}
  />;
}

export function Hairline() {
  const reduced = useReducedMotion();
  return <m.span
    className="hairline"
    aria-hidden="true"
    initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={reduced ? { duration: 0 } : { duration: 0.8, ease }}
  />;
}

// The footer part: a rounded rectangle with two holding tabs (the gaps at the
// top and bottom centre), like a part not yet broken free of the sheet. Both
// halves draw when the footer comes into view; then the signature drops 2px.
const SIGNATURE_FALLBACK = "M50.8 0 L97 0 Q100 0 100 6 L100 94 Q100 100 97 100 L50.8 100 M49.2 100 L3 100 Q0 100 0 94 L0 6 Q0 0 3 0 L49.2 0";
function signatureHalves({ w, h }: Size) {
  const r = 12, tab = 7, mid = w / 2;
  return [
    `M${mid + tab} 0 L${w - r} 0 Q${w} 0 ${w} ${r} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${mid + tab} ${h}`,
    `M${mid - tab} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} L0 ${r} Q0 0 ${r} 0 L${mid - tab} 0`,
  ];
}
export function SignatureCut({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [ref, size] = useSize();
  const duration = reduced ? 0 : 1.2;
  return <m.div className="signature-block" initial="sheet" whileInView="cut" viewport={{ once: true, amount: 0.5 }}>
    <svg ref={ref} className="footer-contour" viewBox={size ? `0 0 ${size.w} ${size.h}` : "0 0 100 100"} preserveAspectRatio="none" aria-hidden="true">
      {size ? signatureHalves(size).map((d, index) => <m.path key={index} d={d} variants={{ sheet: { pathLength: reduced ? 1 : 0 }, cut: { pathLength: 1 } }} transition={{ duration, ease }} />) : <path className="contour-fallback" d={SIGNATURE_FALLBACK} />}
    </svg>
    <m.div variants={{ sheet: { y: 0 }, cut: { y: reduced ? 0 : 2 } }} transition={reduced ? { duration: 0 } : { duration: 0.35, delay: duration, ease }}>{children}</m.div>
  </m.div>;
}
