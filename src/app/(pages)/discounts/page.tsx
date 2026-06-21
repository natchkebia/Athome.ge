"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./discounts.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { getDealStorefrontProducts } from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";

const DEALS_LIMIT = 48;
const PAGE_STEP = 12;

export default function DiscountsPage() {
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();
  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getDealStorefrontProducts(DEALS_LIMIT)
      .then((items) => {
        if (active) setProducts(items.map(mapStorefrontProductToCard));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "ფასდაკლებები" },
  ];

  if (loading) return <AtHomeLoader variant="page" />;

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={styles.container}>
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className={styles.grid}>
              {visibleProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.category}/${item.slug}`}
                  className={styles.cardLink}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <DiscountCard
                    {...item}
                    id={String(item.id)}
                    isWishlisted={wishlistProductIds.has(item.id)}
                    onToggleWishlist={(id) => toggleWishlist(Number(id))}
                    onAddToCart={(id) => addToCart(Number(id))}
                  />
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className={styles.showMore}>
                <button onClick={() => setVisibleCount((p) => p + PAGE_STEP)}>
                  მეტის ნახვა
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
