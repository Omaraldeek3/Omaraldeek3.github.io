"use client";
import { useRef, type ReactNode } from "react";

/* The phone menu. A <details> opens and closes with no script at all; the
   script only closes it again once a link is followed or Escape is pressed. */
export function NavMenu({ label, children }: { label: string; children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };
  return (
    <details
      ref={menu}
      className="nav-menu"
      onClick={event => { if ((event.target as HTMLElement).closest("a")) close(); }}
      onKeyDown={event => { if (event.key === "Escape") close(); }}
    >
      <summary aria-label={label}>
        <span aria-hidden="true" />
      </summary>
      <div className="nav-menu-panel">{children}</div>
    </details>
  );
}
