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
  if (!url) return fallback;

  if (url.startsWith("/media/http")) {
    return url.replace("/media/", "");
  }

  return url;
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
