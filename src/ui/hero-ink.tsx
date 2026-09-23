"use client";

import { useEffect, useRef } from "react";

/** The hero is printed twice: a red plate behind the black one. This keeps the
 *  two plates out of register by an amount that grows as the page scrolls and
 *  leans towards the pointer or the finger, and snaps them back together while
 *  the sheet is pressed. Everything it changes is a transform, so no frame
 *  reflows the headline. */
export function HeroInk({ children }: { children: React.ReactNode }) {
  const hostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Reduced motion keeps the plates registered; the stylesheet hides the red
    // one outright, so there is nothing to drive here.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let leanX = 0;
    let leanY = 0;
    let press = 0;
    let frame = 0;
    let queued = false;

    const apply = () => {
      queued = false;
      const rect = host.getBoundingClientRect();
      // 0 while the hero sits at rest, 1 once its whole height has passed the
      // top edge of the viewport.
      const travelled = -rect.top / Math.max(rect.height, 1);
      const progress = Math.min(Math.max(travelled, 0), 1);
      const open = 1 - press;
      const spread = (4 + progress * 15) * open;
      host.style.setProperty("--ink-x", `${spread + leanX * 11 * open}px`);
      host.style.setProperty("--ink-y", `${spread * 0.45 + leanY * 7 * open}px`);
      host.style.setProperty("--ink-opacity", `${0.42 + progress * 0.45}`);
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      leanX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      leanY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      schedule();
    };

    const onPress = () => {
      press = 1;
      schedule();
    };

    const onRelease = () => {
      press = 0;
      schedule();
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onPress, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    apply();

    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onPress);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section className="hero" ref={hostRef}>
      {children}
    </section>
  );
}
