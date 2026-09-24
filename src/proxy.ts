import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasLocalePrefix, localisedPath } from "./content/locales";

// Middleware is called Proxy from Next.js 16 on, and the file sits next to
// `app` — here that means src/, not the repository root.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocalePrefix(pathname)) return;

  const url = request.nextUrl.clone();
  url.pathname = localisedPath(pathname);
  return NextResponse.redirect(url);
}

// `tools` is excluded because Cut Studio is a locale-less app with its own
// shell; its interface language comes from the ?lang query, not the path.
// `vendor` and `models` are the runtimes and AI models it loads as files.
export const config = {
  matcher: ["/((?!_next|api|tools|vendor|models|favicon.ico|icon.svg|images|sitemap.xml|robots.txt).*)"],
};
