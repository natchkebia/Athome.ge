import type { StorefrontProduct } from "@/lib/api/storefront";

function hasExpired(deadline: string | null | undefined, now: number | null) {
  const timestamp = Date.parse(deadline ?? "");
  return now !== null && Number.isFinite(timestamp) && timestamp <= now;
}

export function selectMobileDeals(
  products: StorefrontProduct[],
  dailyOffers: StorefrontProduct[],
  now: number | null,
) {
  // Home owns the daily selection, including products outside the deals page.
  const candidates: StorefrontProduct[] = [];
  const seen = new Set<number>();
  for (const product of [...dailyOffers.filter((item) => item.isDealOfDay), ...products]) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    candidates.push(product);
  }
  const available = (product: StorefrontProduct) =>
    product.isAvailable && product.stockStatus !== "OutOfStock";
  const daily = candidates.find((product) => product.isDealOfDay && available(product) &&
    !hasExpired(product.dealOfDayEndsAt, now));
  const discounts = candidates.filter((product) => available(product) &&
    (product.compareAtPrice ?? 0) > product.effectivePrice &&
    !hasExpired(product.activePromotion?.endsAt, now) &&
    !(product.isDealOfDay && hasExpired(product.dealOfDayEndsAt, now)));

  // A cached, expired daily offer must disappear instead of becoming a generic hero.
  const featured = daily ?? (candidates.some((product) => product.isDealOfDay) ? undefined : discounts[0]);
  const deadline = featured?.isDealOfDay ? Date.parse(featured.dealOfDayEndsAt ?? "") : NaN;
  const remaining = now !== null && Number.isFinite(deadline)
    ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;

  return { featured, remaining, discounts: discounts.filter((product) => product.id !== featured?.id) };
}
