"use client";

import { useState } from "react";
import type { Locale } from "@/content/locales";
import { getStores, services, weekStart, type Booking, type Service } from "./data";
import { formatters, saasCopy } from "./copy";
import { addDays, isoDay, uid } from "./store";
import { Field, Problem, readNumber, readText } from "./ui";

const OPEN = 8 * 60;
const CLOSE = 20 * 60;
const SLOT = 30;
const durations = [30, 45, 60, 90, 120];

export function overlaps(a: Pick<Booking, "day" | "start" | "duration">, b: Pick<Booking, "day" | "start" | "duration">) {
  return a.day === b.day && a.start < b.start + b.duration && b.start < a.start + a.duration;
}

export function Bookings({ locale }: { locale: Locale }) {
  const t = saasCopy[locale];
  const f = formatters(locale);
  const [bookings, setBookings] = getStores(locale).bookings.use();
  const [offset, setOffset] = useState(0);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const today = isoDay();
  const monday = addDays(weekStart(today), offset * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const week = bookings.filter(booking => booking.day >= days[0] && booking.day <= days[6]);
  const hours = week.reduce((sum, booking) => sum + booking.duration, 0) / 60;
  const rows = (CLOSE - OPEN) / SLOT;
  const active = week.find(booking => booking.id === selected);

  const add = (form: FormData) => {
    const name = readText(form.get("name"));
    const service = readText(form.get("service")) as Service;
    const day = readText(form.get("day"));
    const [h, m] = readText(form.get("start")).split(":").map(Number);
    const start = h * 60 + m;
    const duration = readNumber(form.get("duration"));
    if (!name || !Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) {
      setError(t.bookings.invalid);
      return;
    }
    if (start < OPEN || start + duration > CLOSE) {
      setError(t.bookings.outside);
      return;
    }
    const booking: Booking = { id: uid(), name, service, day, start, duration };
    if (bookings.some(other => overlaps(other, booking))) {
      setError(t.bookings.conflict);
      return;
    }
    setBookings(all => [...all, booking]);
    setError("");
    setAdding(false);
  };

  return (
    <div className="sp-app">
      <div className="sp-toolbar">
        <div className="sp-segmented" role="group">
          <button onClick={() => setOffset(value => value - 1)} aria-label={t.bookings.prev}>
            <span aria-hidden="true" className="sp-arrow back" />
          </button>
          <button onClick={() => setOffset(0)} aria-pressed={offset === 0}>
            {t.bookings.thisWeek}
          </button>
          <button onClick={() => setOffset(value => value + 1)} aria-label={t.bookings.next}>
            <span aria-hidden="true" className="sp-arrow" />
          </button>
        </div>
        <p className="sp-week-label">
          {f.day(days[0])} – {f.day(days[6])} · {t.bookings.weekTotal}: <b>{f.number(hours)}</b>
        </p>
        <button className="sp-button" onClick={() => setAdding(open => !open)} aria-expanded={adding}>
          + {t.bookings.newBooking}
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
          <Field label={t.bookings.name}>{id => <input id={id} name="name" required />}</Field>
          <Field label={t.bookings.service}>
            {id => (
              <select id={id} name="service" defaultValue="consult">
                {services.map(service => (
                  <option key={service} value={service}>{t.bookings.services[service]}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t.bookings.day}>
            {id => (
              <select id={id} name="day" defaultValue={days.includes(today) ? today : days[0]}>
                {days.map(day => (
                  <option key={day} value={day}>{f.weekday(day)}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t.bookings.start}>
            {id => <input id={id} name="start" type="time" min="08:00" max="19:30" step="900" defaultValue="10:00" required dir="ltr" />}
          </Field>
          <Field label={t.bookings.duration}>
            {id => (
              <select id={id} name="duration" defaultValue="60">
                {durations.map(value => (
                  <option key={value} value={value}>{f.number(value)}</option>
                ))}
              </select>
            )}
          </Field>
          <div className="sp-form-actions">
            <button className="sp-button" type="submit">{t.save}</button>
            <button className="sp-button ghost" type="button" onClick={() => setAdding(false)}>{t.cancel}</button>
          </div>
          <Problem text={error} />
        </form>
      )}

      <div className="sp-calendar-wrap">
        <div className="sp-calendar" style={{ "--rows": rows } as React.CSSProperties}>
          <div className="sp-corner" />
          {days.map((day, index) => (
            <div key={day} className="sp-day-head" data-today={day === today || undefined} style={{ gridColumn: index + 2 }}>
              {f.weekday(day)}
            </div>
          ))}
          {Array.from({ length: rows / 2 }, (_, hour) => (
            <div key={hour} className="sp-hour" style={{ gridRow: `${hour * 2 + 2} / span 2` }}>
              {f.time(OPEN + hour * 60)}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={day}
              className="sp-day-col"
              data-today={day === today || undefined}
              style={{ gridColumn: index + 2, gridRow: `2 / span ${rows}` }}
            />
          ))}
          {week.map(booking => {
            const column = days.indexOf(booking.day) + 2;
            const row = Math.floor((booking.start - OPEN) / SLOT) + 2;
            const span = Math.max(1, Math.ceil(booking.duration / SLOT));
            return (
              <button
                key={booking.id}
                className="sp-booking"
                data-service={booking.service}
                aria-pressed={selected === booking.id}
                style={{ gridColumn: column, gridRow: `${row} / span ${span}` }}
                onClick={() => setSelected(selected === booking.id ? null : booking.id)}
              >
                <b>{booking.name}</b>
                <span>
                  {t.bookings.services[booking.service]} · {f.time(booking.start)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <div className="sp-booking-card" data-service={active.service}>
          <div>
            <strong>{active.name}</strong>
            <span>
              {t.bookings.services[active.service]} · {f.weekday(active.day)} · {f.time(active.start)} – {f.time(active.start + active.duration)}
            </span>
          </div>
          <button
            className="sp-button ghost sp-danger"
            onClick={() => {
              setBookings(all => all.filter(booking => booking.id !== active.id));
              setSelected(null);
            }}
          >
            {t.bookings.cancelBooking}
          </button>
        </div>
      )}
    </div>
  );
}
