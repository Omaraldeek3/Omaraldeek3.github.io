"use client";

import * as m from "motion/react-m";
import { useEffect, useRef } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

// Decoration only. The station list beside this is server-rendered and always
// fully readable; nothing here gates reading, focus order or the DOM order.
export function FactoryTrack() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const packet = useTransform(progress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    if (reduced) return;
    const track = ref.current;
    const section = track?.closest("section");
    if (!track || !section) return;
    const stations = Array.from(section.querySelectorAll<HTMLElement>("li.station"));
    if (!stations.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let nearest: HTMLElement | null = null;
      let distance = Infinity;
      for (const station of stations) {
        const box = station.getBoundingClientRect();
        const gap = Math.abs(box.top + box.height / 2 - middle);
        if (gap < distance) { distance = gap; nearest = station; }
      }
      for (const station of stations) station.toggleAttribute("data-active", station === nearest);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      for (const station of stations) station.removeAttribute("data-active");
    };
  }, [reduced]);

  return <div className="factory-track" ref={ref} aria-hidden="true">
    <m.div className="factory-fill" style={{ scaleY: reduced ? 1 : progress }} />
    {!reduced && <m.div className="factory-packet-wrap" style={{ y: packet }}><span className="factory-packet" /></m.div>}
  </div>;
}
