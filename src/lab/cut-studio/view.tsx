import Link from "next/link";
import { copy } from "@/content/site";
import { titles, toolIds } from "@/toolkit/copy";
import type { Locale } from "@/content/locales";

/** The workshop itself lives at /tools with its own shell and stylesheet, so
 *  its styles never leak into the site. This page presents it and opens it. */
export function CutStudioView({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const href = locale === "ar" ? "/tools?lang=ar" : "/tools";
  const index = locale === "ar" ? 1 : 0;
  return (
    <div className="studio-view">
      <ol className="studio-tools">
        {toolIds.map((id, position) => (
          <li key={id}>
            <span className="mono" dir="ltr">
              {String(position + 1).padStart(2, "0")}
            </span>
            <span>{titles[id][index]}</span>
          </li>
        ))}
      </ol>
      <p className="studio-text">{t.toolsText}</p>
      <a className="button button-live" href={href}>
        {t.toolsCta} <span aria-hidden="true">↗</span>
      </a>
      <p className="studio-small mono">{t.toolsSmallPrint}</p>
      <p>
        <Link href={`/${locale}`}>{t.backTop}</Link>
      </p>
    </div>
  );
}
