"use client";

import { useState } from "react";

/** Chips that narrow the gallery by category. The cards themselves are
 *  rendered on the server; this only sets one attribute and the stylesheet
 *  hides what does not match, so without JavaScript every study stays shown. */
export function StudyFilter({
  all,
  options,
  label,
  children,
}: {
  all: string;
  options: { key: string; label: string; count: number }[];
  label: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState("all");
  return (
    <>
      <div className="study-filter" role="group" aria-label={label}>
        <button aria-pressed={active === "all"} onClick={() => setActive("all")}>
          {all}
        </button>
        {options.map(option => (
          <button key={option.key} aria-pressed={active === option.key} onClick={() => setActive(option.key)}>
            {option.label}
            <small>{option.count}</small>
          </button>
        ))}
      </div>
      <div className="studies-grid" data-filter={active}>
        {children}
      </div>
    </>
  );
}
