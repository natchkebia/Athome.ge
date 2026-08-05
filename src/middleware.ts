import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  // Keep ordinary in-site links in the chosen language without duplicating every route.
  if (!isEnglishPath && savedLocale === "en") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Lang", isEnglishPath ? "en" : "ka");

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
