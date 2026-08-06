export type StorefrontLocale = "ka" | "en";

export const LOCALE_COOKIE = "athome-locale";

export function localeFromPathname(pathname: string): StorefrontLocale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ka";
}

export function localizedPath(pathname: string, locale: StorefrontLocale) {
  // Normalize accidental locale segments as well (for example /en/ka), so a
  // language switch can never create a nested or invalid locale route.
  const withoutEnglishPrefix = pathname === "/en"
    ? "/"
    : pathname.replace(/^\/en(?=\/)/, "").replace(/^\/ka(?=\/|$)/, "") || "/";

  return locale === "en"
    ? withoutEnglishPrefix === "/"
      ? "/en"
      : `/en${withoutEnglishPrefix}`
    : withoutEnglishPrefix;
}

export function getBrowserLocale(): StorefrontLocale {
  if (typeof window === "undefined") return "ka";
  return localeFromPathname(window.location.pathname);
}
