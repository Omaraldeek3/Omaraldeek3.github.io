"use client";

import * as m from "motion/react-m";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

const ease = [0.65, 0, 0.35, 1] as [number, number, number, number];

// One closed path: a rectangle with chamfered corners and a single notch on the
// inline-end edge. Drawn in a 0-100 box so the hero can stretch it with
// preserveAspectRatio="none"; the stroke itself never scales.
export const CONTOUR = "M0 3 L3 0 L97 0 L100 3 L100 38 L92 45 L100 52 L100 97 L97 100 L3 100 L0 97 Z";

export function HeroContour({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <>
    <svg className="hero-contour" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <m.path
        d={CONTOUR}
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 1.4, ease }}
      />
      {!reduced && <m.circle
        r="1.4"
        style={{ offsetPath: `path("${CONTOUR}")`, offsetRotate: "0deg" }}
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
