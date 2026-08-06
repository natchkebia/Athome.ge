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
  // The strikethrough/original price can come via oldPrice OR sellingPrice —
  // deals carry the original in oldPrice while sellingPrice == effectivePrice.
  const referencePrice = Math.max(
    product.oldPrice ?? 0,
    product.sellingPrice ?? 0
  );
  const hasDiscount = referencePrice > product.effectivePrice;

  const discount =
    product.discountPercent ??
    (hasDiscount
      ? Math.round(
          ((referencePrice - product.effectivePrice) / referencePrice) * 100
        )
      : 0);

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
    oldPrice: product.oldPrice,
    newPrice: product.effectivePrice,
    discount:
      product.oldPrice && product.oldPrice > product.effectivePrice
        ? Math.round(
            ((product.oldPrice - product.effectivePrice) / product.oldPrice) *
              100
          )
        : 0,
    category: "search",
    slug: product.slug,
  };
}
