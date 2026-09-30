import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasLocalePrefix, localisedPath } from "./content/locales";

// Middleware is called Proxy from Next.js 16 on, and the file sits next to
// `app` — here that means src/, not the repository root.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/mada" || pathname.startsWith("/mada/")) return NextResponse.next();
  if (hasLocalePrefix(pathname)) return;

  const url = request.nextUrl.clone();
  url.pathname = localisedPath(pathname);
  return NextResponse.redirect(url);
}

// `tools` is excluded so the redirect to Cut Studio's own site applies as is.
export const config = {
  matcher: ["/((?!_next|api|tools|favicon.ico|icon.svg|images|sitemap.xml|robots.txt).*)"],
};
