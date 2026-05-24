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
import AtHomeLoader from "./AtHomeLoader";

type StorefrontCategoryProductSectionProps = {
  icon: string;
  title: string;
  categorySlug: string;
  limit?: number;
};

export default function StorefrontCategoryProductSection({
  icon,
  title,
  categorySlug,
  limit = 8,
}: StorefrontCategoryProductSectionProps) {
  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    getStorefrontProductsByCategory(categorySlug, limit)
      .then((items: StorefrontProduct[]) => {
        if (isMounted) setProducts(items.map(mapStorefrontProductToCard));
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
  }, [categorySlug, limit]);

  if (loading) return <AtHomeLoader variant="section" />;
  if (products.length === 0) return null;

  return <ProductSection icon={icon} title={title} products={products} />;
}
