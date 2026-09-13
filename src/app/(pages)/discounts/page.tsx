"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../products/[category]/products.module.scss";
import filterStyles from "@/components/discount/DealsCategoryFilter.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import DealsCategoryFilter from "@/components/discount/DealsCategoryFilter";
import ProductPagination, { PRODUCTS_PER_PAGE } from "@/components/products/ProductPagination";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { getAllDealStorefrontProducts, getDealStorefrontCategories, type StorefrontDealCategory } from "@/lib/api/storefront";
import { mapStorefrontProductToCard, StorefrontProductCard } from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { usePaginationPage } from "@/lib/navigation/usePaginationPage";

export default function DiscountsPage() {
  const en = useStorefrontLocale() === "en";
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();
  const { currentPage, setCurrentPage } = usePaginationPage();
  const [matchingProducts, setMatchingProducts] = useState<StorefrontProductCard[]>([]);
  const [categories, setCategories] = useState<StorefrontDealCategory[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getDealStorefrontCategories()
      .then((items) => { if (active) setCategories(items); })
      .catch(() => { if (active) setCategories([]); })
      .finally(() => { if (active) setCategoriesLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    getAllDealStorefrontProducts({ categorySlugs: selectedSlugs })
      .then((response) => {
        if (!active) return;
        const availableProducts = response
          .filter((product) => product.isAvailable)
          .map(mapStorefrontProductToCard);
        setMatchingProducts(availableProducts);
        setTotalCount(availableProducts.length);
      })
      .catch(() => {
        if (!active) return;
        setMatchingProducts([]);
        setTotalCount(0);
        setLoadFailed(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedSlugs]);

  const products = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return matchingProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, matchingProducts]);

  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.slug, category.name])), [categories]);
  const updateCategories = (slugs: string[]) => {
    setSelectedSlugs(slugs);
    setCurrentPage(1);
  };
  const breadcrumbs = en
    ? [{ label: "Home", href: "/" }, { label: "Discounts" }]
    : [{ label: "მთავარი გვერდი", href: "/" }, { label: "ფასდაკლებები" }];

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={`${styles.container} site-wrapper`}>
        <div className={`${styles.sidebar} ${styles.desktopSidebar} ${filterStyles.sidebar}`}>
          <DealsCategoryFilter categories={categories} selectedSlugs={selectedSlugs} loading={categoriesLoading} onChange={updateCategories} />
        </div>

        <div className={styles.content}>
          <div className={styles.sortbarWrapper}>
            <span className={filterStyles.resultsCount}>{en ? "Found" : "ნაპოვნია"} <strong>{totalCount}</strong> {en ? "deals" : "ფასდაკლება"}</span>
            <button type="button" className={`${styles.mobileFilterButton} ${mobileFiltersOpen ? styles.mobileFilterButtonActive : ""}`} onClick={() => setMobileFiltersOpen((open) => !open)} aria-label={en ? "Toggle category filters" : "კატეგორიების ფილტრის გახსნა"} aria-expanded={mobileFiltersOpen}>
              <img src="/icons/Frame 165292.svg" alt="" />
            </button>
            <div className={styles.iconsWrapper}>
              <button className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`} onClick={() => setView("grid")} aria-label={en ? "Grid view" : "ბადით ჩვენება"} aria-pressed={view === "grid"}><span className={`${styles.viewIcon} ${styles.viewIconGrid}`} /></button>
              <button className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`} onClick={() => setView("list")} aria-label={en ? "List view" : "სიად ჩვენება"} aria-pressed={view === "list"}><span className={`${styles.viewIcon} ${styles.viewIconList}`} /></button>
            </div>
          </div>

          {mobileFiltersOpen && <div className={styles.mobileFilterPanel}><DealsCategoryFilter categories={categories} selectedSlugs={selectedSlugs} loading={categoriesLoading} onChange={updateCategories} /></div>}

          {selectedSlugs.length > 0 && (
            <div className={styles.activeFilters}>
              {selectedSlugs.map((slug) => (
                <div key={slug} className={styles.filterTag}>
                  {categoryNames.get(slug) ?? slug}
                  <button type="button" aria-label={en ? `Remove ${categoryNames.get(slug) ?? slug}` : `${categoryNames.get(slug) ?? slug} ფილტრის მოხსნა`} onClick={() => updateCategories(selectedSlugs.filter((item) => item !== slug))}>×</button>
                </div>
              ))}
            </div>
          )}

          {loading ? <AtHomeLoader variant="section" /> : loadFailed || products.length === 0 ? <EmptyState /> : (
            <div className={`${styles.grid} ${view === "list" ? styles.gridListView : ""}`}>
              {products.map((item) => (
                <Link key={item.id} href={`/products/${item.category}/${item.slug}`} className={styles.cardLink} style={{ textDecoration: "none", color: "inherit" }}>
                  <DiscountCard {...item} id={String(item.id)} layout={view} isWishlisted={wishlistProductIds.has(item.id)} onToggleWishlist={(id) => toggleWishlist(Number(id))} onAddToCart={(id) => addToCart(Number(id))} />
                </Link>
              ))}
            </div>
          )}

          <ProductPagination currentPage={currentPage} totalItems={totalCount} onPageChange={setCurrentPage} locale={en ? "en" : "ka"} />
        </div>
      </div>
    </>
  );
}
