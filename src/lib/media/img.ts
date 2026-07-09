// უბრალო <img> ტეგებისთვის (არა next/image) — ?w=-ის დამატება backend-ის
// resize allow-list-ის მიხედვით. გარე URL-ებს ხელს არ ახლებს.
const ALLOWED = [100, 200, 300, 400, 600, 800, 1200, 1600];

/** ამატებს ?w= (allow-list-ზე მიბმული). backend-ის /uploads/ სურათებზე მუშაობს. */
export function img(url?: string | null, w = 400): string {
  if (!url) return "";
  if (!url.includes("/uploads/")) return url;

  const width = ALLOWED.find((a) => w <= a) ?? 1600;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${width}`;
}

/** srcset string DPR-ისთვის (1x/2x). */
export function imgSrcset(url?: string | null, base = 400): string {
  if (!url || !url.includes("/uploads/")) return "";
  const x2 = ALLOWED.find((a) => base * 2 <= a) ?? 1600;
  return `${img(url, base)} 1x, ${img(url, x2)} 2x`;
}
