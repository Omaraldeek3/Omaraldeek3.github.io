import Link from "next/link";
import { copy, profile } from "@/content/site";
import { oppositeLocale, type Locale } from "@/content/locales";
import { NavMenu } from "./nav-menu";

// Links only, so the whole nav works with JavaScript disabled. Each section
// link carries the locale, so it also leads home from a lab page.
export function Nav({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const other = oppositeLocale(locale);
  const links = (["lab", "process", "about", "contact"] as const).map(id => (
    <Link key={id} href={`/${locale}#${id}`}>{t.nav2[id]}</Link>
  ));
  return (
    <header className="site-nav">
      <a className="skip-link" href="#main">{t.skip}</a>
      <nav className="site-nav-inner" aria-label={t.navigation}>
        <Link className="wordmark" href={`/${locale}`}>
          <span className="wordmark-dot" aria-hidden="true">
            {locale === "ar" ? "ع" : "O"}
          </span>
          {profile.name[locale]}
        </Link>
        <div className="nav-links">{links}</div>
        <Link className="locale-switch" href={`/${other}`} lang={other}>
          {t.nav2.switchTo}
        </Link>
        <NavMenu label={t.menu}>{links}</NavMenu>
      </nav>
    </header>
  );
}
