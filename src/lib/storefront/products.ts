import { ProductCardProps } from "@/components/discount/DiscountCard";
import { StorefrontProduct, StorefrontSearchProduct } from "@/lib/api/storefront";

export type StorefrontProductCard = Omit<ProductCardProps, "id"> & {
  id: number;
};

export function normalizeMediaUrl(
  url?: string,
  // ფოტოს გარეშე პროდუქტზე — საიტის ლოგო (ნაგულისხმევი placeholder)
  fallback = "/icons/Logo.svg"
) {
  const value = url?.trim();
  if (!value) return fallback;

  const apiOrigin = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_API_URL ?? "https://api.ithome.ge").origin;
    } catch {
      return "https://api.ithome.ge";
    }
  })();

  // Legacy records sometimes wrapped an absolute source in `/media/`.
  if (value.startsWith("/media/http")) {
    return value.slice("/media/".length).replace(/^http:\/\//, "https://");
  }

  // Older cart/wishlist records contain API-relative upload paths. On the
  // storefront those otherwise resolve against localhost/ithome.ge and 404.
  const uploadPath = value
    .replace(/^\/media(?=\/uploads\/)/, "")
    .replace(/^uploads\//, "/uploads/");
  if (uploadPath.startsWith("/uploads/")) {
    return `${apiOrigin}${uploadPath}`;
  }

  // Avoid mixed-content failures for old API URLs saved before HTTPS.
  if (/^http:\/\/api\.ithome\.ge\//i.test(value)) {
    return value.replace(/^http:\/\//i, "https://");
  }

  return value;
}

export function mapStorefrontProductToCard(
  product: StorefrontProduct
): StorefrontProductCard {
  const referencePrice = product.compareAtPrice ?? 0;
  const hasDiscount = referencePrice > product.effectivePrice;

  // პროცენტი მხოლოდ compareAtPrice-დან — promotion-ის დასრულებისას ბეჯი თავისით ქრება.
  const discount = hasDiscount
    ? Math.round(
        ((referencePrice - product.effectivePrice) / referencePrice) * 100
      )
    : 0;

  return {
    id: product.id,
    image: normalizeMediaUrl(product.thumbnailUrl),
    // ქარდსა და პროდუქტის შიდა გვერდზე ერთი canonical სათაური გამოჩნდეს.
    title: product.name,
    oldPrice: hasDiscount ? referencePrice : undefined,
    newPrice: product.effectivePrice,
    discount,
    promotionLabel: product.activePromotion?.promotionName,
    isNew: product.isNewArrival,
    isAvailable: product.isAvailable,
    category: product.category.slug,
    subCategory: product.subCategory?.slug,
    slug: product.slug,
  };
}

export function mapStorefrontSearchProductToCard(
  product: StorefrontSearchProduct
): StorefrontProductCard {
  const fallbackId =
    Number(product.sku.replace(/\D/g, "").slice(-8)) || product.slug.length;

  return {
    id: product.id ?? fallbackId,
    image: normalizeMediaUrl(product.thumbnailUrl),
    title: product.name,
    oldPrice: product.compareAtPrice ?? undefined,
    newPrice: product.effectivePrice,
    discount:
      product.compareAtPrice && product.compareAtPrice > product.effectivePrice
        ? Math.round(
            ((product.compareAtPrice - product.effectivePrice) / product.compareAtPrice) *
              100
          )
      : 0,
    promotionLabel: product.promotionLabel ?? undefined,
    isAvailable: product.isAvailable ?? product.stockStatus !== "OutOfStock",
    category: "search",
    slug: product.slug,
  };
}
