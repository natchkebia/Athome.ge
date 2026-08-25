"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import DiscountCard from "@/components/discount/DiscountCard";
import EmptyState from "@/components/products/EmptyState";
import DynamicProductFilter, {
  type DynamicFilterValues,
} from "@/components/products/DynamicProductFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  searchStorefrontProducts,
  type StorefrontCategoryFilterSet,
  type StorefrontSearchResponse,
} from "@/lib/api/storefront";
import { mapStorefrontSearchProductToCard } from "@/lib/storefront/products";
import layout from "@/app/(pages)/products/[category]/products.module.scss";
import styles from "./SearchResultsPage.module.scss";
import { useCommerce } from "@/contexts/CommerceContext";

type Props = {
  initialQuery: string;
  initialCategorySlug?: string;
  initialBrandSlug?: string;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export default function SearchResultsPage({
  initialQuery,
  initialCategorySlug,
  initialBrandSlug,
}: Props) {
  const query = initialQuery.trim();
  const initializedFor = useRef("");
  const [data, setData] = useState<StorefrontSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 1]);
  const [filterValues, setFilterValues] = useState<DynamicFilterValues>({
    price: [0, 1],
    brandSlugs: initialBrandSlug ? [initialBrandSlug] : [],
    inStockOnly: true,
    attributes: {},
    ranges: {},
  });
  const [sortFilters, setSortFilters] = useState({
    price: [0, 1] as [number, number],
    brands: [] as string[], condition: [] as string[], processor: [] as string[],
    ram: [] as string[], gpu: [] as string[], color: [] as string[], screen: [] as string[],
    sort: "default",
  });
  const [visibleCount, setVisibleCount] = useState(9);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  useEffect(() => {
    let active = true;
    const requestKey = `${query}|${initialCategorySlug ?? ""}|${initialBrandSlug ?? ""}`;
    const firstForQuery = initializedFor.current !== requestKey;
    const attr = Object.entries(filterValues.attributes)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => `${key}:${values.join("|")}`);
    const range = Object.entries(filterValues.ranges)
      .filter(([, bounds]) => bounds.length === 2)
      .map(([key, bounds]) => `${key}:${bounds[0]}:${bounds[1]}`);
    const priceIsFiltered =
      !firstForQuery &&
      (filterValues.price[0] !== priceBounds[0] || filterValues.price[1] !== priceBounds[1]);
    const request = (page: number) =>
      searchStorefrontProducts({
        query,
        categorySlug: initialCategorySlug,
        brandSlugs: filterValues.brandSlugs,
        inStockOnly: filterValues.inStockOnly,
        attr,
        range,
        minPrice: priceIsFiltered ? filterValues.price[0] : undefined,
        maxPrice: priceIsFiltered ? filterValues.price[1] : undefined,
        page,
        pageSize: PAGE_SIZE,
      });

    if (!query && !initialCategorySlug && filterValues.brandSlugs.length === 0) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setVisibleCount(9);
    request(1)
      .then(async (first) => {
        const pages = Math.min(first.totalPages || 1, MAX_PAGES);
        const rest = pages > 1
          ? await Promise.all(Array.from({ length: pages - 1 }, (_, i) => request(i + 2)))
          : [];
        return { ...first, products: [first, ...rest].flatMap((page) => page.products) };
      })
      .then((result) => {
        if (!active) return;
        setData(result);
        if (firstForQuery) {
          const bounds: [number, number] = [
            Math.floor(result.facets.minPrice ?? 0),
            Math.max(1, Math.ceil(result.facets.maxPrice ?? 1)),
          ];
          initializedFor.current = requestKey;
          setPriceBounds(bounds);
          setFilterValues((current) => ({ ...current, price: bounds }));
          setSortFilters((current) => ({ ...current, price: bounds }));
        }
      })
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filterValues, initialBrandSlug, initialCategorySlug, priceBounds, query]);

  const schema = useMemo<StorefrontCategoryFilterSet | null>(() => {
    if (!data?.facets) return null;
    return {
      categoryId: 0,
      filterCount: data.facets.attributes?.length ?? 0,
      totalProductCount: data.totalCount,
      brands: (data.facets.brands ?? []).map((brand, index) => ({
        brandId: index + 1,
        slug: brand.slug,
        name: brand.name,
        productCount: brand.count,
      })),
      filters: data.facets.attributes ?? [],
    };
  }, [data]);

  const products = useMemo(() => {
    const result = data?.products.map(mapStorefrontSearchProductToCard) ?? [];
    if (sortFilters.sort === "price-asc") result.sort((a, b) => (a.newPrice ?? 0) - (b.newPrice ?? 0));
    if (sortFilters.sort === "price-desc") result.sort((a, b) => (b.newPrice ?? 0) - (a.newPrice ?? 0));
    if (sortFilters.sort === "a-z") result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortFilters.sort === "z-a") result.sort((a, b) => b.title.localeCompare(a.title));
    return result;
  }, [data, sortFilters.sort]);
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const breadcrumbs = [{ label: "მთავარი გვერდი", href: "/" }, { label: "ძებნა" }];

  if (loading && !data) return <AtHomeLoader variant="page" />;
  if (!data) return <><Breadcrumb items={breadcrumbs} /><EmptyState /></>;

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={`${layout.container} site-wrapper`}>
        <div className={layout.sidebar}>
          {schema && (
            <DynamicProductFilter
              schema={schema}
              values={filterValues}
              priceBounds={priceBounds}
              onChange={setFilterValues}
            />
          )}
        </div>
        <div className={layout.content}>
          <header className={styles.header}>
            <div><span className={styles.eyebrow}>ძებნის შედეგები</span><h1>{query || "ყველა პროდუქტი"}</h1></div>
            <p>{data.totalCount} პროდუქტი მოიძებნა</p>
          </header>
          {data.suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {data.suggestions.slice(0, 8).map((suggestion) => (
                <Link key={`${suggestion.type}-${suggestion.slug}`} href={suggestion.type === "brand" ? `/products/brand/${suggestion.slug}` : suggestion.type === "category" ? `/products/${suggestion.slug}` : `/products/search/${suggestion.slug}`}>{suggestion.label}</Link>
              ))}
            </div>
          )}
          <div className={styles.sortbar}>
            <ProductSortBar filters={sortFilters} onChange={(next) => setSortFilters((current) => ({ ...current, ...next }))} />
            <div className={styles.icons}>
              <button className={`${layout.viewBtn} ${view === "grid" ? layout.viewBtnActive : ""}`} onClick={() => setView("grid")} aria-label="ბადით ჩვენება" aria-pressed={view === "grid"}><span className={`${layout.viewIcon} ${layout.viewIconGrid}`} /></button>
              <button className={`${layout.viewBtn} ${view === "list" ? layout.viewBtnActive : ""}`} onClick={() => setView("list")} aria-label="სიად ჩვენება" aria-pressed={view === "list"}><span className={`${layout.viewIcon} ${layout.viewIconList}`} /></button>
            </div>
          </div>
          {loading ? <AtHomeLoader variant="section" /> : visibleProducts.length === 0 ? <EmptyState /> : (
            <div className={`${layout.grid} ${view === "list" ? layout.gridListView : ""}`}>
              {visibleProducts.map((item) => (
                <Link key={`${item.slug}-${item.id}`} href={`/products/search/${item.slug}`} className={styles.cardLink}>
                  <DiscountCard {...item} id={String(item.id)} layout={view} isWishlisted={wishlistProductIds.has(item.id)} onToggleWishlist={(id) => toggleWishlist(Number(id))} onAddToCart={(id) => addToCart(Number(id))} />
                </Link>
              ))}
            </div>
          )}
          {hasMore && <div className={layout.ShowMore}><button onClick={() => setVisibleCount((count) => count + 9)}>მეტის ნახვა</button></div>}
        </div>
      </div>
    </>
  );
}
