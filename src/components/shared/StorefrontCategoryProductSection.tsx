"use client";

import { useEffect, useState } from "react";
import {
  getStorefrontProductsByCategory,
  StorefrontProduct,
} from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import ProductSection from "./ProductSection";
import { usePageLoading } from "@/contexts/LoadingContext";

type StorefrontCategoryProductSectionProps = {
  icon: string;
  title: string;
  categorySlug: string;
  limit?: number;
  initialProducts?: StorefrontProduct[];
};

export default function StorefrontCategoryProductSection({
  icon,
  title,
  categorySlug,
  limit = 8,
  initialProducts,
}: StorefrontCategoryProductSectionProps) {
  const initialMapped = (initialProducts ?? [])
    .filter(
      (product) => product.isAvailable && product.stockStatus !== "OutOfStock"
    )
    .map(mapStorefrontProductToCard);

  const [products, setProducts] =
    useState<StorefrontProductCard[]>(initialMapped);
  const [loading, setLoading] = useState(initialMapped.length === 0);

  // inline ლოდერის ნაცვლად ვარეგისტრირებთ გლობალურ overlay-ში.
  usePageLoading(loading);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return;

    let isMounted = true;

    setLoading(true);

    getStorefrontProductsByCategory(categorySlug, limit)
      .then((items) => {
        if (isMounted) {
          setProducts(
            items
              .filter(
                (product) =>
                  product.isAvailable && product.stockStatus !== "OutOfStock"
              )
              .map(mapStorefrontProductToCard)
          );
        }
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, initialProducts, limit]);


  if (loading) return null;
  if (products.length === 0) return null;

  return <ProductSection icon={icon} title={title} products={products} />;
}
