"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./gaming.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  getCategoryProductsBySlugs,
  PERIPHERAL_PARENT_CATEGORY,
  type ConfiguratorProductCard,
} from "@/lib/api/configurator";
import {
  normalizeMediaUrl,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";

const SLUG_LABELS: Record<string, string> = {
  monitor: "გეიმინგ მონიტორი",
  keyboard: "გეიმინგ კლავიატურა",
  laptop: "გეიმინგ ნოუთბუქი",
  "gaming-chair": "გეიმინგ სავარძელი",
  console: "სათამაშო კონსოლი",
};

function mapCard(card: ConfiguratorProductCard, slug: string): StorefrontProductCard {
  return {
    id: card.id,
    image: normalizeMediaUrl(card.thumbnailUrl ?? undefined),
    title: card.name ?? "",
    oldPrice:
      card.oldPrice && card.oldPrice > card.effectivePrice
        ? card.oldPrice
        : undefined,
    newPrice: card.effectivePrice,
    discount: card.discountPercent ?? 0,
    isNew: false,
    category: slug,
    slug: card.slug ?? "",
  };
}

function GamingResultsInner() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getCategoryProductsBySlugs(PERIPHERAL_PARENT_CATEGORY, [slug])
      .then((items) => {
        if (!active) return;
        setProducts((items ?? []).map((card) => mapCard(card, slug)));
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
  }, [slug]);

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: SLUG_LABELS[slug] || slug },
  ];

  if (loading) return <AtHomeLoader variant="page" />;

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={styles.container}>
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={styles.grid}>
            {products.map((item) => (
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
        )}
      </div>
    </>
  );
}

export default function GamingResultsPage() {
  return (
    <Suspense fallback={<AtHomeLoader variant="page" />}>
      <GamingResultsInner />
    </Suspense>
  );
}
