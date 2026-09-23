import type { Locale } from "@/content/locales";
import { SaasApp } from "./app";

/** The panel's data is the visitor's own and lives in their browser, so the
 *  page ships the shell and the apps render once they reach it. */
export function SaasPanelView({ locale }: { locale: Locale }) {
  return (
    <div className="saas-view">
      <SaasApp locale={locale} />
    </div>
  );
}
