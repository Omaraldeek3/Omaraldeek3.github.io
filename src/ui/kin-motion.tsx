"use client";

import { useEffect } from "react";

/**
 * The home page's motion layer, in one place:
 *
 * - Reveal: headings, text and cards rise in (with a short blur) as their
 *   section scrolls into view, staggered within each section. Content is only
 *   hidden once this script has run (`html.kin-reveal`), so without JavaScript
 *   or with reduced motion everything simply sits in place.
 * - Pin: on a wide screen each reel's grid sticks while its section scrolls
 *   on, so the figure plays its scene around a panel that holds still. A
 *   panel taller than the screen sticks at a negative top, so its whole
 *   length still scrolls past before it holds.
 * - Depth: the pointer's position, normalised to -1..1, lands on the page as
 *   --kx/--ky; the stylesheet shifts panels a few pixels by their depth, so the
 *   page leans with the mouse while the figure turns to look at it.
 */
const TARGETS = [
  ".kin-page .section-head",
  ".kin-page .section-title",
  ".kin-page .section-intro",
  ".kin-page .glow-card",
  ".kin-page .kin-panel > *",
  ".kin-page .lab-card",
  ".kin-page .process-list > li",
  ".kin-page #about .shell > p",
  ".kin-page .contact-channels",
  // Not the hero: it has its own entrance on load (globals.css, lift-in).
].join(",");

export function KinMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ——— Reveal ———
    let io: IntersectionObserver | null = null;
    if (!calm && "IntersectionObserver" in window) {
      const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
      // Stagger by order inside each section.
      const counts = new Map<Element, number>();
      for (const el of els) {
        const host = el.closest("section") ?? document.body;
        const i = counts.get(host) ?? 0;
        counts.set(host, i + 1);
        el.style.setProperty("--ki", String(Math.min(i, 8)));
        el.classList.add("kin-r");
      }
      // Anything already on screen shows at once, without a flash.
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
      }
      root.classList.add("kin-reveal");
      io = new IntersectionObserver(
        entries => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io?.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
      );
      for (const el of els) if (!el.classList.contains("is-in")) io.observe(el);
    }

    // ——— Pin ———
    const pins = Array.from(document.querySelectorAll<HTMLElement>(".kin-page .kin-reel-grid"));
    const place = () => {
      for (const g of pins) g.style.setProperty("--pin-top", `${Math.min(88, innerHeight - g.offsetHeight - 24)}px`);
    };
    place();
    window.addEventListener("resize", place);

    // ——— Depth ———
    // The values go on the few panels that lean, not on <html>: a custom
    // property on the root restyles the whole page on every pointer frame.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const leaners = Array.from(document.querySelectorAll<HTMLElement>(".kin-page .kin-panel, .kin-page .hero-corner-start, .kin-page .hero-giant"));
    let frame = 0;
    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(step);
    };
    const step = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      const kx = x.toFixed(4), ky = y.toFixed(4);
      for (const el of leaners) {
        el.style.setProperty("--kx", kx);
        el.style.setProperty("--ky", ky);
      }
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    if (fine && !calm) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io?.disconnect();
      root.classList.remove("kin-reveal");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", place);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
