import { copy, profile } from "@/content/site";
import type { Locale } from "@/content/locales";

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <footer className="site-footer">
      <div className="shell site-footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name[locale]} — {t.rights}
        </span>
        <span className="mono">{profile.location[locale]}</span>
        <span className="site-footer-note">{t.footerNote}</span>
      </div>
    </footer>
  );
}
