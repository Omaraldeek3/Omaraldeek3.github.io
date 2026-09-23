import Link from "next/link";
import { copy, profile } from "@/content/site";
import { oppositeLocale, type Locale } from "@/content/locales";

// Anchors and links only, so the whole nav works with JavaScript disabled.
export function Nav({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const other = oppositeLocale(locale);
  return (
    <header className="site-nav">
      <a className="skip-link" href="#main">{t.skip}</a>
      <nav className="shell site-nav-inner" aria-label={t.navigation}>
        <Link className="wordmark" href={`/${locale}`}>
          <span className="wordmark-dot" aria-hidden="true" />
          {profile.name[locale]}
        </Link>
        <div className="nav-links">
          <a href="#lab">{t.nav2.lab}</a>
          <a href="#process">{t.nav2.process}</a>
          <a href="#about">{t.nav2.about}</a>
          <a href="#contact">{t.nav2.contact}</a>
        </div>
        <Link className="locale-switch" href={`/${other}`} lang={other}>
          {t.nav2.switchTo}
        </Link>
      </nav>
    </header>
  );
}
