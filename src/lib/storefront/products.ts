import { ProductCardProps } from "@/components/discount/DiscountCard";
import { StorefrontProduct, StorefrontSearchProduct } from "@/lib/api/storefront";

export type StorefrontProductCard = Omit<ProductCardProps, "id"> & {
  id: number;
};

export function normalizeMediaUrl(url?: string) {
  if (!url) return "/images/discountPc.png";

  if (url.startsWith("/media/http")) {
    return url.replace("/media/", "");
  }

  return url;
}

export function mapStorefrontProductToCard(
  product: StorefrontProduct
): StorefrontProductCard {
  const discount =
    product.discountPercent ??
    (product.sellingPrice > product.effectivePrice
      ? Math.round(
          ((product.sellingPrice - product.effectivePrice) /
            product.sellingPrice) *
            100
        )
      : 0);

  return {
    id: product.id,
    image: normalizeMediaUrl(product.thumbnailUrl),
    title: product.shortTitle || product.name,
    oldPrice:
      product.sellingPrice > product.effectivePrice
        ? product.sellingPrice
        : undefined,
    newPrice: product.effectivePrice,
    discount,
    isNew: product.isNewArrival,
    category: product.category.slug,
    slug: product.slug,
  };
}

export function mapStorefrontSearchProductToCard(
  product: StorefrontSearchProduct
): StorefrontProductCard {
  return {
    id: Number(product.sku.replace(/\D/g, "").slice(-8)) || product.slug.length,
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
