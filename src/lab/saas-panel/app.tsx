"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/content/locales";
import { saasCopy } from "./copy";
import { resetAll, useMounted } from "./store";
import { Overview } from "./overview";
import { Crm } from "./crm";
import { Invoices } from "./invoices";
import { Bookings } from "./bookings";
import { Inventory } from "./inventory";

export const appIds = ["overview", "crm", "invoices", "bookings", "inventory"] as const;
export type AppId = (typeof appIds)[number];

const icons: Record<AppId, React.ReactNode> = {
  overview: <path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 7h6V4h-6z" />,
  crm: <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M17 11a3 3 0 1 0 0-6M22 21v-1a5 5 0 0 0-4-4.9" />,
  invoices: <path d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h5" />,
  bookings: <path d="M4 5h16v16H4zM4 10h16M9 2v5M15 2v5M8 14h3v3H8z" />,
  inventory: <path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10" />,
};

// The open app lives in the URL hash, so a link can point straight at one.
const subscribeHash = (listener: () => void) => {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
};
const readHash = () => window.location.hash.slice(1);
const serverHash = () => "";

export function SaasApp({ locale }: { locale: Locale }) {
  const t = saasCopy[locale];
  const mounted = useMounted();
  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const active: AppId = (appIds as readonly string[]).includes(hash) ? (hash as AppId) : "overview";

  const open = (app: AppId) => {
    history.replaceState(null, "", `#${app}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div className="sp-shell">
      <aside className="sp-side">
        <div className="sp-brand">
          <span className="sp-brand-mark" aria-hidden="true">▤</span>
          <span>{t.brand}</span>
        </div>
        <nav aria-label={t.brand}>
          {appIds.map(app => (
            <button
              key={app}
              className="sp-nav-item"
              aria-current={active === app ? "page" : undefined}
              onClick={() => open(app)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">{icons[app]}</svg>
              <span>{t.apps[app]}</span>
            </button>
          ))}
        </nav>
        <p className="sp-storage">
          <span aria-hidden="true" className="sp-dot" />
          {t.storageNote}
        </p>
        <button
          className="sp-reset"
          onClick={() => {
            if (window.confirm(t.resetConfirm)) resetAll();
          }}
        >
          {t.reset}
        </button>
      </aside>

      <section className="sp-main" aria-live="polite">
        <header className="sp-head">
          <h2>{t.apps[active]}</h2>
          <p>{t.appsHint[active]}</p>
        </header>
        {!mounted ? (
          <p className="sp-loading">{t.loading}</p>
        ) : (
          <div className="sp-view" key={active}>
            {active === "overview" && <Overview locale={locale} open={open} />}
            {active === "crm" && <Crm locale={locale} />}
            {active === "invoices" && <Invoices locale={locale} />}
            {active === "bookings" && <Bookings locale={locale} />}
            {active === "inventory" && <Inventory locale={locale} />}
          </div>
        )}
      </section>
    </div>
  );
}
