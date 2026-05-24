"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import DiscountCard from "@/components/discount/DiscountCard";
import EmptyState from "@/components/products/EmptyState";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  searchStorefrontProducts,
  StorefrontSearchResponse,
} from "@/lib/api/storefront";
import { mapStorefrontSearchProductToCard } from "@/lib/storefront/products";
import styles from "./SearchResultsPage.module.scss";

type SearchResultsPageProps = {
  initialQuery: string;
  initialCategorySlug?: string;
  initialBrandSlug?: string;
};

export default function SearchResultsPage({
  initialQuery,
  initialCategorySlug,
  initialBrandSlug,
}: SearchResultsPageProps) {
  const [data, setData] = useState<StorefrontSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const query = initialQuery.trim();

  useEffect(() => {
    let isMounted = true;

    if (!query && !initialCategorySlug && !initialBrandSlug) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    searchStorefrontProducts({
      query,
      categorySlug: initialCategorySlug,
      brandSlug: initialBrandSlug,
    })
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch(() => {
        if (isMounted) setData(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialBrandSlug, initialCategorySlug, query]);

  const products = data?.products.map(mapStorefrontSearchProductToCard) ?? [];
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "ძებნა" },
  ];

  if (loading) return <AtHomeLoader variant="page" />;

  if (!data) {
    return (
      <>
        <Breadcrumb items={breadcrumbs} />
        <EmptyState />
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <main className={`${styles.wrapper} site-wrapper`}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>ძებნის შედეგები</span>
            <h1>{query || "ყველა პროდუქტი"}</h1>
          </div>
          <p>{data.totalCount} პროდუქტი მოიძებნა</p>
        </header>

        {data.suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {data.suggestions.slice(0, 8).map((suggestion) => (
              <Link
                key={`${suggestion.type}-${suggestion.slug}`}
                href={
                  suggestion.type === "brand"
                    ? `/products/brand/${suggestion.slug}`
                    : suggestion.type === "category"
                    ? `/products/${suggestion.slug}`
                    : `/products/search/${suggestion.slug}`
                }
              >
                {suggestion.label}
              </Link>
            ))}
          </div>
        )}

        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((item) => (
              <Link
                key={`${item.slug}-${item.id}`}
                href={`/products/search/${item.slug}`}
                className={styles.cardLink}
              >
                <DiscountCard {...item} id={String(item.id)} />
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>ამ ძებნაზე პროდუქტი ვერ მოიძებნა.</div>
        )}
      </main>
    </>
  );
}
