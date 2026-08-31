import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

/**
 * nginx sends X-Forwarded-Proto: http so nextUrl.origin matches the internal
 * listener; it is therefore not a valid source for the public scheme.
 */
function publicOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const isLocal = host?.startsWith("localhost") || host?.startsWith("127.");
  if (host && isLocal) return `http://${host}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (!host) return request.nextUrl.origin;

  return `https://${host}`;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Flitt returns the shopper with an HTML form POST. App Router pages only
  // render GET requests, so turn that browser POST into a safe PRG redirect
  // before routing. The submitted payment status is deliberately ignored:
  // the result page verifies the authoritative state through our API.
  if (
    request.method === "POST" &&
    (pathname === "/payment/result" || pathname === "/en/payment/result")
  ) {
    const target = new URL(pathname, publicOrigin(request));
    try {
      const form = await request.formData();
      const flittOrderId = form.get("order_id");
      if (typeof flittOrderId === "string" && flittOrderId.trim()) {
        target.searchParams.set("flittOrderId", flittOrderId.trim());
      }
    } catch {
      // A malformed/empty body must still reach the neutral result screen.
    }
    return NextResponse.redirect(target, 303);
  }

  // Georgian is represented by an unprefixed URL. Canonicalize stale/malformed
  // locale paths such as /ka and /en/ka instead of trying to render them.
  if (pathname === "/ka" || pathname.startsWith("/ka/") || pathname === "/en/ka" || pathname.startsWith("/en/ka/")) {
    const normalized = pathname
      .replace(/^\/en\/ka(?=\/|$)/, "")
      .replace(/^\/ka(?=\/|$)/, "") || "/";
    return NextResponse.redirect(new URL(normalized + search, publicOrigin(request)));
  }

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
