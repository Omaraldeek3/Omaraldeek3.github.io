export type Locale = "ar" | "en";

export const locales = ["ar", "en"] as const satisfies readonly Locale[];

/** Arabic is the site's own language. A path without a locale becomes Arabic,
 *  regardless of the visitor's browser preference; the nav carries the switch. */
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function oppositeLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/** True when the path already starts with a supported locale segment. */
export function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

/** The path a locale-less request should be sent to. */
export function localisedPath(pathname: string, locale: Locale = defaultLocale): string {
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}
