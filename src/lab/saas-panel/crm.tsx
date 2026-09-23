"use client";

import { useState } from "react";
import type { Locale } from "@/content/locales";
import { getStores, stages, type Lead, type Stage } from "./data";
import { formatters, saasCopy } from "./copy";
import { isoDay, uid } from "./store";
import { Field, Problem, readNumber, readText } from "./ui";

export function Crm({ locale }: { locale: Locale }) {
  const t = saasCopy[locale];
  const f = formatters(locale);
  const [leads, setLeads] = getStores(locale).leads.use();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? leads.filter(lead => `${lead.name} ${lead.company}`.toLowerCase().includes(needle))
    : leads;

  const move = (id: string, stage: Stage) =>
    setLeads(all => all.map(lead => (lead.id === id ? { ...lead, stage } : lead)));

  const step = (lead: Lead, by: number) => {
    const next = stages[stages.indexOf(lead.stage) + by];
    if (next) move(lead.id, next);
  };

  const add = (form: FormData) => {
    const name = readText(form.get("name"));
    const company = readText(form.get("company"));
    const value = readNumber(form.get("value"));
    if (!name || !Number.isFinite(value) || value < 0) {
      setError(t.crm.invalid);
      return;
    }
    const stage = (readText(form.get("stage")) as Stage) || "new";
    setLeads(all => [{ id: uid(), name, company, value, stage, created: isoDay() }, ...all]);
    setError("");
    setAdding(false);
  };

  return (
    <div className="sp-app">
      <div className="sp-toolbar">
        <input
          className="sp-search"
          type="search"
          placeholder={t.search}
          aria-label={t.search}
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button className="sp-button" onClick={() => setAdding(open => !open)} aria-expanded={adding}>
          + {t.crm.addLead}
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
          <Field label={t.crm.name}>{id => <input id={id} name="name" required />}</Field>
          <Field label={t.crm.company}>{id => <input id={id} name="company" />}</Field>
          <Field label={t.crm.value}>
            {id => <input id={id} name="value" type="number" min="0" step="50" required dir="ltr" />}
          </Field>
          <Field label={t.crm.stage}>
            {id => (
              <select id={id} name="stage" defaultValue="new">
                {stages.map(stage => (
                  <option key={stage} value={stage}>
                    {t.crm.stages[stage]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="sp-form-actions">
            <button className="sp-button" type="submit">{t.save}</button>
            <button className="sp-button ghost" type="button" onClick={() => setAdding(false)}>
              {t.cancel}
            </button>
          </div>
          <Problem text={error} />
        </form>
      )}

      <p className="sp-hint">{t.crm.dragHint}</p>

      <div className="sp-board">
        {stages.map(stage => {
          const column = visible.filter(lead => lead.stage === stage);
          const sum = column.reduce((total, lead) => total + lead.value, 0);
          return (
            <section
              key={stage}
              className="sp-column"
              data-stage={stage}
              data-over={over === stage || undefined}
              onDragOver={event => {
                event.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver(current => (current === stage ? null : current))}
              onDrop={event => {
                event.preventDefault();
                const id = event.dataTransfer.getData("text/plain") || dragged;
                if (id) move(id, stage);
                setDragged(null);
                setOver(null);
              }}
            >
              <header>
                <h3>{t.crm.stages[stage]}</h3>
                <span className="sp-count">{f.number(column.length)}</span>
              </header>
              <p className="sp-column-sum">{f.money(sum)}</p>
              <ul>
                {column.map(lead => (
                  <li
                    key={lead.id}
                    className="sp-lead"
                    draggable
                    data-dragging={dragged === lead.id || undefined}
                    onDragStart={event => {
                      event.dataTransfer.setData("text/plain", lead.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDragged(lead.id);
                    }}
                    onDragEnd={() => {
                      setDragged(null);
                      setOver(null);
                    }}
                  >
                    <strong>{lead.name}</strong>
                    {lead.company && <span>{lead.company}</span>}
                    <div className="sp-lead-foot">
                      <b>{f.money(lead.value)}</b>
                      <small>{f.day(lead.created)}</small>
                    </div>
                    <div className="sp-lead-actions">
                      <button
                        type="button"
                        aria-label={`${t.crm.back}: ${lead.name}`}
                        disabled={stage === stages[0]}
                        onClick={() => step(lead, -1)}
                      >
                        <span aria-hidden="true" className="sp-arrow back" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${t.remove}: ${lead.name}`}
                        className="sp-danger"
                        onClick={() => setLeads(all => all.filter(item => item.id !== lead.id))}
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        aria-label={`${t.crm.forward}: ${lead.name}`}
                        disabled={stage === stages[stages.length - 1]}
                        onClick={() => step(lead, 1)}
                      >
                        <span aria-hidden="true" className="sp-arrow" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
