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
  categorySlug?: string;
  categorySlugs?: string[];
  limit?: number;
  initialProducts?: StorefrontProduct[];
};

export default function StorefrontCategoryProductSection({
  icon,
  title,
  categorySlug,
  categorySlugs,
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

    const slugs = categorySlugs ?? (categorySlug ? [categorySlug] : []);
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(
      slugs.map((slug) => getStorefrontProductsByCategory(slug, limit))
    )
      .then((results) => {
        if (isMounted) {
          const combined: StorefrontProduct[] = [];
          const maxLen = Math.max(...results.map((r) => r.length), 0);
          for (let i = 0; i < maxLen; i++) {
            for (const list of results) {
              if (list[i]) combined.push(list[i]);
            }
          }
          setProducts(
            combined
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
  }, [categorySlug, categorySlugs, initialProducts, limit]);


  if (loading) return null;
  if (products.length === 0) return null;

  return <ProductSection icon={icon} title={title} products={products} />;
}
