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
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import { useContactProduct } from "@/components/shared/ContactProductContext";

type Params = {
  category: string;
  slug: string;
};

export default function ProductDetailPage() {
  const { category, slug } = useParams<Params>();
  const [product, setProduct] = useState<StorefrontProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProduct: setContactProduct } = useContactProduct();

  useEffect(() => {
    if (!product?.sku) {
      setContactProduct(null);
      return;
    }

    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    setContactProduct({ name: product.name, sku: product.sku, url: url.toString() });

    return () => setContactProduct(null);
  }, [product?.name, product?.sku, setContactProduct]);

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

  const productType = product.subCategory ?? product.category;
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    {
      label: productType.name,
      href: `/products/${productType.slug}`,
    },
    { label: product.name },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            image: product.images?.map((image) => image.url),
            offers: {
              "@type": "Offer",
              price: product.pricing.effectivePrice,
              priceCurrency: product.pricing.currencyCode || "GEL",
              availability:
                product.isAvailable && product.stockStatus !== "OutOfStock"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb items={breadcrumbs} />
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
