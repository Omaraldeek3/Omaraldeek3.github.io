"use client";

import { useState } from "react";
import type { Locale } from "@/content/locales";
import { getStores, invoiceState, invoiceTotals, type Invoice, type LineItem } from "./data";
import { formatters, saasCopy } from "./copy";
import { addDays, isoDay, uid } from "./store";
import { Badge, Empty, Field, Problem } from "./ui";

type Filter = "all" | "draft" | "sent" | "paid" | "overdue";
const filters: Filter[] = ["all", "draft", "sent", "overdue", "paid"];

const tone = { draft: "muted", sent: "info", paid: "good", overdue: "warn" } as const;

function blankLine(): LineItem {
  return { id: uid(), desc: "", qty: 1, price: 0 };
}

export function Invoices({ locale }: { locale: Locale }) {
  const t = saasCopy[locale];
  const f = formatters(locale);
  const [invoices, setInvoices] = getStores(locale).invoices.use();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [client, setClient] = useState("");
  const [dueIn, setDueIn] = useState(14);
  const [tax, setTax] = useState(16);
  const [lines, setLines] = useState<LineItem[]>([blankLine()]);
  const [error, setError] = useState("");

  const today = isoDay();
  const shown = invoices
    .filter(invoice => filter === "all" || invoiceState(invoice, today) === filter)
    .sort((a, b) => (a.issued < b.issued ? 1 : -1));

  const draft: Invoice = {
    id: "draft",
    number: "",
    client,
    issued: today,
    due: addDays(today, dueIn),
    items: lines,
    tax,
    status: "draft",
  };
  const draftTotals = invoiceTotals(draft);

  const setLine = (id: string, patch: Partial<LineItem>) =>
    setLines(all => all.map(line => (line.id === id ? { ...line, ...patch } : line)));

  const create = () => {
    const items = lines.filter(line => line.desc.trim() && line.qty > 0 && line.price >= 0);
    if (!client.trim() || items.length === 0 || !Number.isFinite(dueIn) || dueIn < 0) {
      setError(t.invoices.invalid);
      return;
    }
    const highest = invoices.reduce((max, invoice) => Math.max(max, Number(invoice.number.replace(/\D/g, "")) || 0), 1040);
    setInvoices(all => [
      { ...draft, id: uid(), number: `INV-${highest + 1}`, client: client.trim(), items },
      ...all,
    ]);
    setClient("");
    setLines([blankLine()]);
    setError("");
    setDrafting(false);
  };

  const setStatus = (id: string, status: Invoice["status"]) =>
    setInvoices(all => all.map(invoice => (invoice.id === id ? { ...invoice, status } : invoice)));

  const exportCsv = () => {
    const rows = [["number", "client", "issued", "due", "status", "subtotal", "tax", "total"]];
    for (const invoice of invoices) {
      const totals = invoiceTotals(invoice);
      rows.push([
        invoice.number, invoice.client, invoice.issued, invoice.due, invoiceState(invoice, today),
        totals.subtotal.toFixed(2), totals.tax.toFixed(2), totals.total.toFixed(2),
      ]);
    }
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoices.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="sp-app">
      <div className="sp-toolbar">
        <div className="sp-segmented" role="group">
          {filters.map(key => (
            <button
              key={key}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {key === "all" ? t.invoices.filterAll : t.invoices.states[key]}
            </button>
          ))}
        </div>
        <div className="sp-toolbar-end">
          <button className="sp-button ghost" onClick={exportCsv}>{t.invoices.exportCsv}</button>
          <button className="sp-button" onClick={() => setDrafting(value => !value)} aria-expanded={drafting}>
            + {t.invoices.newInvoice}
          </button>
        </div>
      </div>

      {drafting && (
        <form
          className="sp-form sp-invoice-form"
          onSubmit={event => {
            event.preventDefault();
            create();
          }}
        >
          <div className="sp-form-row">
            <Field label={t.invoices.client}>
              {id => <input id={id} value={client} onChange={event => setClient(event.target.value)} required />}
            </Field>
            <Field label={t.invoices.dueIn}>
              {id => (
                <input id={id} type="number" min="0" max="120" value={dueIn} dir="ltr"
                  onChange={event => setDueIn(event.target.valueAsNumber)} />
              )}
            </Field>
            <Field label={`${t.invoices.tax} %`}>
              {id => (
                <input id={id} type="number" min="0" max="50" value={tax} dir="ltr"
                  onChange={event => setTax(Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : 0)} />
              )}
            </Field>
          </div>
          <div className="sp-lines">
            {lines.map((line, index) => (
              <div className="sp-line" key={line.id}>
                <Field label={`${t.invoices.item} ${index + 1}`}>
                  {id => <input id={id} value={line.desc} onChange={event => setLine(line.id, { desc: event.target.value })} />}
                </Field>
                <Field label={t.invoices.qty}>
                  {id => (
                    <input id={id} type="number" min="1" value={line.qty} dir="ltr"
                      onChange={event => setLine(line.id, { qty: event.target.valueAsNumber || 0 })} />
                  )}
                </Field>
                <Field label={t.invoices.price}>
                  {id => (
                    <input id={id} type="number" min="0" step="0.01" value={line.price} dir="ltr"
                      onChange={event => setLine(line.id, { price: event.target.valueAsNumber || 0 })} />
                  )}
                </Field>
                <button
                  type="button"
                  className="sp-icon sp-danger"
                  aria-label={`${t.remove} ${index + 1}`}
                  disabled={lines.length === 1}
                  onClick={() => setLines(all => all.filter(item => item.id !== line.id))}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="sp-link" onClick={() => setLines(all => [...all, blankLine()])}>
              + {t.invoices.addLine}
            </button>
          </div>
          <dl className="sp-totals">
            <div><dt>{t.invoices.subtotal}</dt><dd>{f.money(draftTotals.subtotal)}</dd></div>
            <div><dt>{t.invoices.tax} ({f.number(tax)}%)</dt><dd>{f.money(draftTotals.tax)}</dd></div>
            <div className="sp-grand"><dt>{t.total}</dt><dd>{f.money(draftTotals.total)}</dd></div>
          </dl>
          <div className="sp-form-actions">
            <button className="sp-button" type="submit">{t.save}</button>
            <button className="sp-button ghost" type="button" onClick={() => setDrafting(false)}>{t.cancel}</button>
          </div>
          <Problem text={error} />
        </form>
      )}

      {shown.length === 0 ? (
        <Empty text={t.none} />
      ) : (
        <div className="sp-table-wrap">
          <table className="sp-table">
            <thead>
              <tr>
                <th>{t.invoices.number}</th>
                <th>{t.invoices.client}</th>
                <th>{t.invoices.issued}</th>
                <th>{t.invoices.due}</th>
                <th className="num">{t.invoices.amount}</th>
                <th>{t.invoices.status}</th>
                <th><span className="sr-only">{t.invoices.view}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(invoice => {
                const state = invoiceState(invoice, today);
                const totals = invoiceTotals(invoice);
                const expanded = open === invoice.id;
                return (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    state={state}
                    total={totals.total}
                    expanded={expanded}
                    onToggle={() => setOpen(expanded ? null : invoice.id)}
                    onSend={() => setStatus(invoice.id, "sent")}
                    onPaid={() => setStatus(invoice.id, "paid")}
                    onRemove={() => setInvoices(all => all.filter(item => item.id !== invoice.id))}
                    locale={locale}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InvoiceRow({
  invoice, state, total, expanded, onToggle, onSend, onPaid, onRemove, locale,
}: {
  invoice: Invoice;
  state: keyof typeof tone;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onSend: () => void;
  onPaid: () => void;
  onRemove: () => void;
  locale: Locale;
}) {
  const t = saasCopy[locale];
  const f = formatters(locale);
  const totals = invoiceTotals(invoice);
  return (
    <>
      <tr data-state={state}>
        <td className="mono" dir="ltr">{invoice.number}</td>
        <td>{invoice.client}</td>
        <td>{f.day(invoice.issued)}</td>
        <td>{f.day(invoice.due)}</td>
        <td className="num">{f.money(total)}</td>
        <td><Badge tone={tone[state]}>{t.invoices.states[state]}</Badge></td>
        <td className="sp-row-actions">
          <button className="sp-link" onClick={onToggle} aria-expanded={expanded}>
            {t.invoices.view}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="sp-detail-row">
          <td colSpan={7}>
            <div className="sp-invoice-sheet">
              <ul>
                {invoice.items.map(item => (
                  <li key={item.id}>
                    <span>{item.desc}</span>
                    <span dir="ltr">{f.number(item.qty)} × {f.money(item.price)}</span>
                    <b>{f.money(item.qty * item.price)}</b>
                  </li>
                ))}
              </ul>
              <dl className="sp-totals">
                <div><dt>{t.invoices.subtotal}</dt><dd>{f.money(totals.subtotal)}</dd></div>
                <div><dt>{t.invoices.tax} ({f.number(invoice.tax)}%)</dt><dd>{f.money(totals.tax)}</dd></div>
                <div className="sp-grand"><dt>{t.total}</dt><dd>{f.money(totals.total)}</dd></div>
              </dl>
              <div className="sp-form-actions">
                {invoice.status === "draft" && <button className="sp-button" onClick={onSend}>{t.invoices.markSent}</button>}
                {invoice.status === "sent" && <button className="sp-button" onClick={onPaid}>{t.invoices.markPaid}</button>}
                <button className="sp-button ghost sp-danger" onClick={onRemove}>{t.remove}</button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
