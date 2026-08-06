import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

/**
 * nginx sends X-Forwarded-Proto: http so nextUrl.origin matches the internal
 * listener; it is therefore not a valid source for the public scheme.
 */
function publicOrigin(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;

  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  return `${isLocal ? "http" : "https"}://${host}`;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  // The rewrite below is executed as a proxied fetch, so middleware runs a second
  // time on the rewritten path. X-Lang marks that pass — without this guard
  // "/en" -> "/" -> "/en" loops forever.
  const isRewrittenPass = request.headers.get("x-lang") !== null;

  if (!isEnglishPath && savedLocale === "en" && !isRewrittenPass) {
    const target = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.redirect(new URL(target + search, publicOrigin(request)));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Lang", isEnglishPath || savedLocale === "en" ? "en" : "ka");

  if (isEnglishPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/en" ? "/" : pathname.slice(3);
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images|media).*)"],
};
