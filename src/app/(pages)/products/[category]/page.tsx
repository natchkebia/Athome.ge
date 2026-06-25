"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./products.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import ProductFilter from "@/components/products/ProductFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  getStorefrontCategory,
  getStorefrontCategoryProducts,
  getStorefrontProductsByCategory,
  StorefrontCategory,
} from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";

const PRODUCT_LIMIT = 24;

function ProductsPageInner() {
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

  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [categoryDetails, setCategoryDetails] =
    useState<StorefrontCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersActive, setFiltersActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  const params = useParams();
  // [category] param ინახავს ნებისმიერი დონის slug-ს (category/sub/mini) —
  // by-category endpoint ყველა მათგანზე ზუსტად იმ დონის პროდუქტებს აბრუნებს.
  const category = decodeURIComponent(params.category as string);

  useEffect(() => {
    let isMounted = true;

    getStorefrontCategory(category)
      .then((details) => {
        if (isMounted) setCategoryDetails(details);
      })
      .catch(() => {
        if (isMounted) setCategoryDetails(null);
      });

    return () => {
      isMounted = false;
    };
  }, [category]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setVisibleCount(9);

    // eslint-disable-next-line no-console
    console.log("[CATEGORY PAGE] by-category slug:", category);

    // მთავარი კატეგორიებისთვის — /categories/{slug}/products (სრული კონტენტი).
    // sub/mini slug-ზე ეს ცარიელია → fallback by-category/{slug} (exact-level).
    getStorefrontCategoryProducts(category, PRODUCT_LIMIT)
      .then(async (items) => {
        const list =
          items.length > 0
            ? items
            : await getStorefrontProductsByCategory(category, PRODUCT_LIMIT);
        if (!isMounted) return;
        setProducts(list.map(mapStorefrontProductToCard));
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
  }, [category]);

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
    { label: categoryDetails?.name || category },
  ];

  if (loading) return <AtHomeLoader variant="page" />;
  if (products.length === 0) {
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
      <div className={`${styles.container} site-wrapper`}>
        <div className={styles.sidebar}>
          <ProductFilter filters={filters} onChange={handleUpdateFilters} />
        </div>

        <div className={styles.content}>
          <div className={styles.sortbarWrapper}>
            <ProductSortBar filters={filters} onChange={handleUpdateFilters} />
            <div className={styles.iconsWrapper}>
              <button
                className={`${styles.viewBtn} ${
                  view === "grid" ? styles.viewBtnActive : ""
                }`}
                onClick={() => setView("grid")}
                aria-label="ბადით ჩვენება"
                aria-pressed={view === "grid"}
              >
                <span className={`${styles.viewIcon} ${styles.viewIconGrid}`} />
              </button>
              <button
                className={`${styles.viewBtn} ${
                  view === "list" ? styles.viewBtnActive : ""
                }`}
                onClick={() => setView("list")}
                aria-label="სიად ჩვენება"
                aria-pressed={view === "list"}
              >
                <span className={`${styles.viewIcon} ${styles.viewIconList}`} />
              </button>
            </div>
          </div>

          {allActiveFilters.length > 0 && (
            <div className={styles.activeFilters}>
              {allActiveFilters.map((filter) => (
                <div
                  key={`${filter.key}-${filter.value}`}
                  className={styles.filterTag}
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
              className={`${styles.grid} ${
                view === "list" ? styles.gridListView : ""
              }`}
            >
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
            <div className={styles.ShowMore}>
              <button onClick={handleShowMore}>მეტის ნახვა</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<AtHomeLoader variant="page" />}>
      <ProductsPageInner />
    </Suspense>
  );
}
