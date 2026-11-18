"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/content/locales";

const INITIAL_CLOCK = "12:40:45";

function formatClock(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Non-interactive OS status capsule inside the top bar, matching the floating
 *  telemetry strip in the Kin OS interface without adding focusable stops. */
export function NavStatus({ locale }: { locale: Locale }) {
  const [clock, setClock] = useState(INITIAL_CLOCK);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const id = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="nav-status" aria-hidden="true">
      <span className="nav-status-grid">∷</span>
      <span className="nav-status-clock mono" dir="ltr">
        {clock}
      </span>
      <span className="nav-status-live">
        <i />
        {locale === "ar" ? "نظام عمر · حي" : "Omar OS"}
      </span>
    </span>
  );
}
