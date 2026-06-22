"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetail from "@/components/products/ProductDetail";
import {
  getStorefrontProduct,
  StorefrontProductDetail,
} from "@/lib/api/storefront";
import EmptyState from "@/components/products/EmptyState";
import AtHomeLoader from "@/components/shared/AtHomeLoader";

type Params = {
  category: string;
  slug: string;
};

export default function ProductDetailPage() {
  const { category, slug } = useParams<Params>();
  const [product, setProduct] = useState<StorefrontProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    getStorefrontProduct(slug)
      .then((details) => {
        if (isMounted) setProduct(details);
      })
      .catch(() => {
        if (isMounted) setProduct(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) return <AtHomeLoader variant="page" />;
  if (!product) return <EmptyState />;

  return (
    <div>
      <div className="site-wrapper">
        <ProductDetail
          product={product}
          routeCategory={category}
          routeSlug={slug}
        />
      </div>
    </div>
  );
}
