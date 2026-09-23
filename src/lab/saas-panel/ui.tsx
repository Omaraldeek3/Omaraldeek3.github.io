"use client";

import { useId } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <label className="sp-field" htmlFor={id}>
      <span>{label}</span>
      {children(id)}
    </label>
  );
}

export function Kpi({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="sp-kpi" data-tone={tone}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className="sp-badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="sp-empty">{text}</p>;
}

export function Problem({ text }: { text: string }) {
  return text ? (
    <p className="sp-problem" role="alert">
      {text}
    </p>
  ) : null;
}

/** A number from a form field, or NaN when it is empty or not a number. */
export function readNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return NaN;
  return Number(value);
}

export function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
