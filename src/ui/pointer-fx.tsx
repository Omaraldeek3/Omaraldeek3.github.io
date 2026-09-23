"use client";

import { useEffect } from "react";

/** One listener for the whole page. It only ever writes CSS custom properties,
 *  and the stylesheet decides what they do, so with JavaScript off (or on a
 *  touch screen) every element simply keeps its resting look.
 *
 *  - `.glow-card`  gets --mx/--my: where the pointer is, for a soft spotlight.
 *  - `[data-tilt]` gets --rx/--ry/--px/--py: a small 3D lean and a parallax.
 *  - `.magnetic`   gets --tx/--ty: it leans a few pixels toward the pointer.
 *  - `.hero`       gets --hx/--hy: its warm light drifts after the pointer.
 */
export function PointerFx() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;
    let pulled: HTMLElement | null = null;

    const settle = (element: HTMLElement | null, names: string[]) => {
      if (!element) return;
      for (const name of names) element.style.removeProperty(name);
    };

    const apply = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const target = event.target instanceof Element ? event.target : null;

      const glow = target?.closest<HTMLElement>(".glow-card");
      if (glow) {
        const box = glow.getBoundingClientRect();
        glow.style.setProperty("--mx", `${event.clientX - box.left}px`);
        glow.style.setProperty("--my", `${event.clientY - box.top}px`);
      }

      if (calm.matches) return;

      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilt !== tilted) {
        settle(tilted, ["--rx", "--ry", "--px", "--py"]);
        tilted = tilt;
      }
      if (tilt) {
        const box = tilt.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        tilt.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
        tilt.style.setProperty("--px", `${(x * 18).toFixed(1)}px`);
        tilt.style.setProperty("--py", `${(y * 14).toFixed(1)}px`);
      }

      const magnet = target?.closest<HTMLElement>(".magnetic") ?? null;
      if (magnet !== pulled) {
        settle(pulled, ["--tx", "--ty"]);
        pulled = magnet;
      }
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const x = event.clientX - (box.left + box.width / 2);
        const y = event.clientY - (box.top + box.height / 2);
        magnet.style.setProperty("--tx", `${(x * 0.18).toFixed(1)}px`);
        magnet.style.setProperty("--ty", `${(y * 0.28).toFixed(1)}px`);
      }

      const hero = target?.closest<HTMLElement>(".hero");
      if (hero) {
        const box = hero.getBoundingClientRect();
        hero.style.setProperty("--hx", `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`);
        hero.style.setProperty("--hy", `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`);
      }
    };

    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      settle(tilted, ["--rx", "--ry", "--px", "--py"]);
      settle(pulled, ["--tx", "--ty"]);
      tilted = null;
      pulled = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
