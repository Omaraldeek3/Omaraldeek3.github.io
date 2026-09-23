"use client";

import { useState } from "react";
import type { Locale } from "@/content/locales";
import { getStores, stockState, type Product } from "./data";
import { formatters, saasCopy } from "./copy";
import { isoDay, uid } from "./store";
import { Badge, Field, Kpi, Problem, readNumber, readText } from "./ui";

const tone = { ok: "good", low: "warn", out: "bad" } as const;

export function Inventory({ locale }: { locale: Locale }) {
  const t = saasCopy[locale];
  const f = formatters(locale);
  const stores = getStores(locale);
  const [products, setProducts] = stores.products.use();
  const [movements, setMovements] = stores.movements.use();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [rowError, setRowError] = useState<{ id: string; text: string } | null>(null);

  const value = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const low = products.filter(product => stockState(product) !== "ok").length;
  const units = products.reduce((sum, product) => sum + product.stock, 0);

  const adjust = (product: Product, direction: 1 | -1) => {
    const amount = amounts[product.id] ?? 1;
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (direction === -1 && amount > product.stock) {
      setRowError({ id: product.id, text: t.inventory.notEnough });
      return;
    }
    setRowError(null);
    const change = direction * amount;
    setProducts(all => all.map(item => (item.id === product.id ? { ...item, stock: item.stock + change } : item)));
    setMovements(all => [
      { id: uid(), productId: product.id, change, day: isoDay(), note: direction === 1 ? t.inventory.restock : t.inventory.sale },
      ...all,
    ].slice(0, 40));
  };

  const add = (form: FormData) => {
    const name = readText(form.get("name"));
    const sku = readText(form.get("sku")).toUpperCase();
    const stock = readNumber(form.get("stock"));
    const min = readNumber(form.get("min"));
    const price = readNumber(form.get("price"));
    if (!name || !sku || ![stock, min, price].every(n => Number.isFinite(n) && n >= 0)) {
      setError(t.inventory.invalid);
      return;
    }
    setProducts(all => [...all, { id: uid(), name, sku, stock, min, price }]);
    setError("");
    setAdding(false);
  };

  const names = new Map(products.map(product => [product.id, product.name]));

  return (
    <div className="sp-app">
      <div className="sp-kpis">
        <Kpi label={t.inventory.value} value={f.money(value)} />
        <Kpi label={t.inventory.stock} value={f.number(units)} />
        <Kpi label={t.overview.lowStock} value={f.number(low)} tone={low ? "warn" : "good"} />
      </div>

      <div className="sp-toolbar">
        <span />
        <button className="sp-button" onClick={() => setAdding(open => !open)} aria-expanded={adding}>
          + {t.inventory.newProduct}
        </button>
      </div>

      {adding && (
        <form
          className="sp-form"
          onSubmit={event => {
            event.preventDefault();
            add(new FormData(event.currentTarget));
          }}
        >
          <Field label={t.inventory.name}>{id => <input id={id} name="name" required />}</Field>
          <Field label={t.inventory.sku}>{id => <input id={id} name="sku" required dir="ltr" />}</Field>
          <Field label={t.inventory.stock}>{id => <input id={id} name="stock" type="number" min="0" required dir="ltr" />}</Field>
          <Field label={t.inventory.min}>{id => <input id={id} name="min" type="number" min="0" required dir="ltr" />}</Field>
          <Field label={t.inventory.price}>{id => <input id={id} name="price" type="number" min="0" step="0.01" required dir="ltr" />}</Field>
          <div className="sp-form-actions">
            <button className="sp-button" type="submit">{t.save}</button>
            <button className="sp-button ghost" type="button" onClick={() => setAdding(false)}>{t.cancel}</button>
          </div>
          <Problem text={error} />
        </form>
      )}

      <div className="sp-table-wrap">
        <table className="sp-table sp-stock-table">
          <thead>
            <tr>
              <th>{t.inventory.name}</th>
              <th>{t.inventory.sku}</th>
              <th>{t.inventory.stock}</th>
              <th className="num">{t.inventory.price}</th>
              <th>{t.invoices.status}</th>
              <th>{t.inventory.adjust}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const state = stockState(product);
              const fill = Math.min(100, (product.stock / Math.max(1, product.min * 2)) * 100);
              return (
                <tr key={product.id} data-state={state}>
                  <td>
                    {product.name}
                    {rowError?.id === product.id && <Problem text={rowError.text} />}
                  </td>
                  <td className="mono" dir="ltr">{product.sku}</td>
                  <td>
                    <div className="sp-meter" data-state={state}>
                      <span style={{ inlineSize: `${fill}%` }} />
                    </div>
                    <small>
                      {f.number(product.stock)} / {t.inventory.min} {f.number(product.min)}
                    </small>
                  </td>
                  <td className="num">{f.money(product.price)}</td>
                  <td><Badge tone={tone[state]}>{t.inventory.states[state]}</Badge></td>
                  <td>
                    <div className="sp-adjust">
                      <button aria-label={`${t.inventory.out}: ${product.name}`} onClick={() => adjust(product, -1)}>−</button>
                      <input
                        type="number"
                        min="1"
                        aria-label={`${t.inventory.adjust}: ${product.name}`}
                        value={amounts[product.id] ?? 1}
                        dir="ltr"
                        onChange={event => setAmounts(all => ({ ...all, [product.id]: event.target.valueAsNumber }))}
                      />
                      <button aria-label={`${t.inventory.in}: ${product.name}`} onClick={() => adjust(product, 1)}>+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="sp-panel">
        <h3>{t.inventory.movements}</h3>
        <ul className="sp-moves">
          {movements.slice(0, 8).map(move => (
            <li key={move.id}>
              <span className="sp-move-change" data-in={move.change > 0 || undefined} dir="ltr">
                {move.change > 0 ? "+" : "−"}
                {f.number(Math.abs(move.change))}
              </span>
              <span>{names.get(move.productId) ?? "—"}</span>
              <small>{move.note} · {f.day(move.day)}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
