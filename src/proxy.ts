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

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|icon.svg|images|sitemap.xml|robots.txt).*)"],
};
