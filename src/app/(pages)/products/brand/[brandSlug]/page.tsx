"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../[category]/products.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import BrandCategoryFilter, { BrandCategorySelection } from "@/components/products/BrandCategoryFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import ProductPagination, { PRODUCTS_PER_PAGE } from "@/components/products/ProductPagination";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { getAllStorefrontProducts, getStorefrontBrandFilters, StorefrontBrandFilterSet } from "@/lib/api/storefront";
import { mapStorefrontProductToCard, StorefrontProductCard } from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

const PRODUCT_LIMIT = 1000;
export default function BrandProductsPage() {
  const brandSlug = decodeURIComponent(useParams().brandSlug as string);
  const en = useStorefrontLocale() === "en";
  const [schema, setSchema] = useState<StorefrontBrandFilterSet | null>(null);
  const [selection, setSelection] = useState<BrandCategorySelection>({});
  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("default");
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  useEffect(() => {
    let active = true; setSchema(null); setSelection({});
    getStorefrontBrandFilters(brandSlug).then(data => { if (active) setSchema(data); }).catch(() => { if (active) setSchema(null); });
    return () => { active = false; };
  }, [brandSlug]);
  useEffect(() => {
    let active = true; setLoading(true); setCurrentPage(1);
    getAllStorefrontProducts({ pageSize: PRODUCT_LIMIT, brandSlug, categorySlug: selection.categorySlug, subCategorySlug: selection.subCategorySlug })
      .then(items => { if (active) setProducts(items.map(mapStorefrontProductToCard)); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [brandSlug, selection]);
  const sortedProducts = useMemo(() => {
    const result = [...products];
    if (sort === "price-asc") result.sort((a, b) => (a.newPrice ?? 0) - (b.newPrice ?? 0));
    if (sort === "price-desc") result.sort((a, b) => (b.newPrice ?? 0) - (a.newPrice ?? 0));
    if (sort === "a-z") result.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "z-a") result.sort((a, b) => b.title.localeCompare(a.title));
    return result;
  }, [products, sort]);
  const brandName = schema?.brandName ?? brandSlug;
  const breadcrumbs = [{ label: en ? "Home" : "მთავარი გვერდი", href: "/" }, { label: en ? "Brands" : "ბრენდები", href: "/brands" }, { label: brandName }];
  if (!schema && loading) return <AtHomeLoader variant="page" />;
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = sortedProducts.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);
  return <><Breadcrumb items={breadcrumbs} /><div className={`${styles.container} site-wrapper`}>
    <div className={`${styles.sidebar} ${styles.desktopSidebar}`}>{schema && <BrandCategoryFilter schema={schema} value={selection} onChange={setSelection} />}</div>
    <main className={styles.content}><div className={styles.sortbarWrapper}>
      <ProductSortBar filters={{ sort }} onChange={({ sort: next }) => { if (next) setSort(next); }} />
      {schema && <button type="button" className={styles.mobileFilterButton} onClick={() => setMobileFiltersOpen(open => !open)} aria-label={en ? "Open filters" : "ფილტრების გახსნა"} aria-expanded={mobileFiltersOpen}><img src="/icons/Frame 165292.svg" alt="" /></button>}
    </div>
    {mobileFiltersOpen && schema && <div className={styles.mobileFilterPanel}><BrandCategoryFilter schema={schema} value={selection} onChange={value => { setSelection(value); setMobileFiltersOpen(false); }} /></div>}
    {loading ? <AtHomeLoader variant="page" /> : visibleProducts.length === 0 ? <EmptyState /> : <div className={styles.grid}>{visibleProducts.map(item => <Link key={item.id} href={`/products/${item.category}/${item.slug}`} className={styles.cardLink} style={{ textDecoration: "none", color: "inherit" }}><DiscountCard {...item} id={String(item.id)} isWishlisted={wishlistProductIds.has(item.id)} onToggleWishlist={id => toggleWishlist(Number(id))} onAddToCart={id => addToCart(Number(id))} /></Link>)}</div>}
    <ProductPagination currentPage={currentPage} totalItems={sortedProducts.length} onPageChange={setCurrentPage} locale={en ? "en" : "ka"} />
    </main></div></>;
}
