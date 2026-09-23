"use client";

import type { Locale } from "@/content/locales";
import { getStores, invoiceState, invoiceTotals, stockState, weekStart } from "./data";
import { formatters, saasCopy } from "./copy";
import { addDays, isoDay } from "./store";
import { Empty, Kpi } from "./ui";
import type { AppId } from "./app";

export function Overview({ locale, open }: { locale: Locale; open: (app: AppId) => void }) {
  const t = saasCopy[locale];
  const f = formatters(locale);
  const stores = getStores(locale);
  const [leads] = stores.leads.use();
  const [invoices] = stores.invoices.use();
  const [bookings] = stores.bookings.use();
  const [products] = stores.products.use();

  const today = isoDay();
  const monday = weekStart(today);
  const sunday = addDays(monday, 6);

  const pipeline = leads
    .filter(lead => lead.stage !== "won" && lead.stage !== "lost")
    .reduce((sum, lead) => sum + lead.value, 0);
  const closed = leads.filter(lead => lead.stage === "won" || lead.stage === "lost");
  const winRate = closed.length ? Math.round((100 * leads.filter(lead => lead.stage === "won").length) / closed.length) : 0;
  const collected = invoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
  const outstanding = invoices
    .filter(invoice => invoice.status === "sent")
    .reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
  const weekCount = bookings.filter(booking => booking.day >= monday && booking.day <= sunday).length;
  const lowItems = products.filter(product => stockState(product) !== "ok");

  // Six calendar months ending with this one, each summing the invoices paid
  // that were issued in it.
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const key = isoDay(date).slice(0, 7);
    const sum = invoices
      .filter(invoice => invoice.status === "paid" && invoice.issued.startsWith(key))
      .reduce((total, invoice) => total + invoiceTotals(invoice).total, 0);
    return { key, label: f.month(`${key}-01`), sum };
  });
  const peak = Math.max(1, ...months.map(month => month.sum));

  const alerts = [
    ...invoices
      .filter(invoice => invoiceState(invoice, today) === "overdue")
      .map(invoice => ({ key: invoice.id, app: "invoices" as const, tone: "warn", title: t.overview.overdue, text: `${invoice.number} · ${invoice.client} · ${f.money(invoiceTotals(invoice).total)}` })),
    ...lowItems.map(product => ({
      key: product.id,
      app: "inventory" as const,
      tone: stockState(product) === "out" ? "bad" : "warn",
      title: stockState(product) === "out" ? t.overview.out : t.overview.low,
      text: `${product.name} · ${f.number(product.stock)} / ${f.number(product.min)}`,
    })),
    ...bookings
      .filter(booking => booking.day === today)
      .map(booking => ({ key: booking.id, app: "bookings" as const, tone: "info", title: t.overview.today, text: `${booking.name} · ${f.time(booking.start)}` })),
  ];

  return (
    <div className="sp-app">
      <div className="sp-kpis">
        <Kpi label={t.overview.pipeline} value={f.money(pipeline)} />
        <Kpi label={t.overview.collected} value={f.money(collected)} tone="good" />
        <Kpi label={t.overview.outstanding} value={f.money(outstanding)} tone={outstanding ? "warn" : undefined} />
        <Kpi label={t.overview.weekBookings} value={f.number(weekCount)} />
        <Kpi label={t.overview.conversion} value={`${f.number(winRate)}%`} />
        <Kpi label={t.overview.lowStock} value={f.number(lowItems.length)} tone={lowItems.length ? "warn" : "good"} />
      </div>

      <div className="sp-split">
        <section className="sp-panel">
          <h3>{t.overview.revenue}</h3>
          <div className="sp-chart" role="img" aria-label={months.map(month => `${month.label}: ${f.money(month.sum)}`).join("، ")}>
            {months.map(month => (
              <div className="sp-chart-col" key={month.key}>
                <span className="sp-chart-value">{month.sum ? f.money(month.sum) : "—"}</span>
                <span className="sp-chart-bar" style={{ blockSize: `${Math.max(2, (month.sum / peak) * 100)}%` }} />
                <span className="sp-chart-label">{month.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sp-panel">
          <h3>{t.overview.attention}</h3>
          {alerts.length === 0 ? (
            <Empty text={t.overview.allGood} />
          ) : (
            <ul className="sp-alerts">
              {alerts.map(alert => (
                <li key={alert.key}>
                  <button onClick={() => open(alert.app)} data-tone={alert.tone}>
                    <b>{alert.title}</b>
                    <span>{alert.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
