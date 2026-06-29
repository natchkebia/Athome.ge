"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import DiscountCard from "@/components/discount/DiscountCard";
import EmptyState from "@/components/products/EmptyState";
import ProductFilter from "@/components/products/ProductFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  searchStorefrontProducts,
  StorefrontSearchResponse,
} from "@/lib/api/storefront";
import { mapStorefrontSearchProductToCard } from "@/lib/storefront/products";
import layout from "@/app/(pages)/products/[category]/products.module.scss";
import styles from "./SearchResultsPage.module.scss";
import { useCommerce } from "@/contexts/CommerceContext";

type SearchResultsPageProps = {
  initialQuery: string;
  initialCategorySlug?: string;
  initialBrandSlug?: string;
};

// backend PageSize-ს 100-ზე ჭრის → ყველა გვერდს ვიღებთ, რომ ნაპოვნი ყველა პროდუქტი
// ჩაიტვირთოს (და client-side ფილტრიც სრულ ნაკრებზე იმუშაოს). ჭერი — 5 გვერდი.
const SEARCH_PAGE_SIZE = 100;
const SEARCH_MAX_PAGES = 5;

export default function SearchResultsPage({
  initialQuery,
  initialCategorySlug,
  initialBrandSlug,
}: SearchResultsPageProps) {
  const [data, setData] = useState<StorefrontSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();
  const query = initialQuery.trim();

  const [filters, setFilters] = useState({
    price: [0, 8500] as [number, number],
    brands: [] as string[],
    condition: [] as string[],
    processor: [] as string[],
    ram: [] as string[],
    gpu: [] as string[],
    color: [] as string[],
    screen: [] as string[],
    sort: "default",
  });
  const [filtersActive, setFiltersActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let isMounted = true;

    if (!query && !initialCategorySlug && !initialBrandSlug) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setVisibleCount(9);

    searchStorefrontProducts({
      query,
      categorySlug: initialCategorySlug,
      brandSlug: initialBrandSlug,
      page: 1,
      pageSize: SEARCH_PAGE_SIZE,
    })
      .then(async (first) => {
        const pages = Math.min(first.totalPages || 1, SEARCH_MAX_PAGES);
        if (pages <= 1) return first;

        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            searchStorefrontProducts({
              query,
              categorySlug: initialCategorySlug,
              brandSlug: initialBrandSlug,
              page: i + 2,
              pageSize: SEARCH_PAGE_SIZE,
            })
          )
        );

        return {
          ...first,
          products: [first, ...rest].flatMap((r) => r.products),
        };
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

  const products = useMemo(
    () => data?.products.map(mapStorefrontSearchProductToCard) ?? [],
    [data]
  );

  const filteredProducts = useMemo(() => {
    if (!filtersActive) return products;
    let result = [...products];

    result = result.filter(
      (p) =>
        (p.newPrice ?? 0) >= filters.price[0] &&
        (p.newPrice ?? 0) <= filters.price[1]
    );

    const filterKeys: (keyof typeof filters)[] = [
      "brands",
      "condition",
      "processor",
      "ram",
      "gpu",
      "color",
      "screen",
    ];

    filterKeys.forEach((key) => {
      const values = filters[key] as string[];
      if (values.length > 0) {
        result = result.filter((p) =>
          values.some((v) => p.title.toLowerCase().includes(v.toLowerCase()))
        );
      }
    });

    if (filters.sort === "price-asc")
      result.sort((a, b) => (a.newPrice ?? 0) - (b.newPrice ?? 0));
    if (filters.sort === "price-desc")
      result.sort((a, b) => (b.newPrice ?? 0) - (a.newPrice ?? 0));
    if (filters.sort === "a-z")
      result.sort((a, b) => a.title.localeCompare(b.title));
    if (filters.sort === "z-a")
      result.sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [products, filters, filtersActive]);

  const handleUpdateFilters = (newValues: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    setFiltersActive(true);
    setVisibleCount(9);
  };

  const allFilterKeys = [
    "brands",
    "condition",
    "processor",
    "ram",
    "gpu",
    "color",
    "screen",
  ] as const;

  type FilterKey = (typeof allFilterKeys)[number];

  const activeFilters = allFilterKeys.flatMap((key) =>
    (filters[key] as string[]).map((value: string) => ({ key, value }))
  );

  const priceActive =
    filters.price[0] !== 0 || filters.price[1] !== 8500
      ? {
          key: "price" as const,
          value: `${filters.price[0]}₾ - ${filters.price[1]}₾`,
        }
      : null;

  const allActiveFilters = priceActive
    ? [priceActive, ...activeFilters]
    : activeFilters;

  const handleRemoveFilter = (key: string, value: string) => {
    if (key === "price") {
      setFilters((prev) => ({ ...prev, price: [0, 8500] }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: (prev[key as FilterKey] as string[]).filter((v) => v !== value),
      }));
    }
    setFiltersActive(true);
    setVisibleCount(9);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

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
      <div className={`${layout.container} site-wrapper`}>
        <div className={layout.sidebar}>
          <ProductFilter filters={filters} onChange={handleUpdateFilters} />
        </div>

        <div className={layout.content}>
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

          <div className={styles.sortbar}>
            <ProductSortBar filters={filters} onChange={handleUpdateFilters} />
            <div className={styles.icons}>
              <button
                className={`${layout.viewBtn} ${
                  view === "grid" ? layout.viewBtnActive : ""
                }`}
                onClick={() => setView("grid")}
                aria-label="ბადით ჩვენება"
                aria-pressed={view === "grid"}
              >
                <span className={`${layout.viewIcon} ${layout.viewIconGrid}`} />
              </button>
              <button
                className={`${layout.viewBtn} ${
                  view === "list" ? layout.viewBtnActive : ""
                }`}
                onClick={() => setView("list")}
                aria-label="სიად ჩვენება"
                aria-pressed={view === "list"}
              >
                <span className={`${layout.viewIcon} ${layout.viewIconList}`} />
              </button>
            </div>
          </div>

          {allActiveFilters.length > 0 && (
            <div className={layout.activeFilters}>
              {allActiveFilters.map((filter) => (
                <div
                  key={`${filter.key}-${filter.value}`}
                  className={layout.filterTag}
                >
                  {filter.value}
                  <button
                    onClick={() => handleRemoveFilter(filter.key, filter.value)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {visibleProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              className={`${layout.grid} ${
                view === "list" ? layout.gridListView : ""
              }`}
            >
              {visibleProducts.map((item) => (
                <Link
                  key={`${item.slug}-${item.id}`}
                  href={`/products/search/${item.slug}`}
                  className={styles.cardLink}
                >
                  <DiscountCard
                    {...item}
                    id={String(item.id)}
                    layout={view}
                    isWishlisted={wishlistProductIds.has(item.id)}
                    onToggleWishlist={(id) => toggleWishlist(Number(id))}
                    onAddToCart={(id) => addToCart(Number(id))}
                  />
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className={layout.ShowMore}>
              <button onClick={handleShowMore}>მეტის ნახვა</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
