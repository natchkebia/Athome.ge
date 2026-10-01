// უბრალო <img> ტეგებისთვის (არა next/image) — ?w=-ის დამატება backend-ის
// resize allow-list-ის მიხედვით. გარე URL-ებს ხელს არ ახლებს.
const ALLOWED = [100, 200, 300, 400, 600, 800, 1200, 1600] as const;

function allowedWidth(requestedWidth: number) {
  return ALLOWED.find((width) => requestedWidth <= width) ?? 1600;
}

/** ამატებს ?w= (allow-list-ზე მიბმული). backend-ის /uploads/ სურათებზე მუშაობს. */
export function img(url?: string | null, w = 400): string {
  if (!url) return "";
  if (!url.includes("/uploads/")) return url;

  const [withoutHash, hash = ""] = url.split("#", 2);
  const [pathname, query = ""] = withoutHash.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("w", String(allowedWidth(w)));

  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
}

/** srcset string DPR-ისთვის (1x/2x). */
export function imgSrcset(url?: string | null, base = 400): string {
  if (!url || !url.includes("/uploads/")) return "";
  return `${img(url, base)} 1x, ${img(url, allowedWidth(base * 2))} 2x`;
}
