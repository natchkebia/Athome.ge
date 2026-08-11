"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../[category]/products.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import ProductFilter from "@/components/products/ProductFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { getStorefrontProducts } from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";

// ყველა პროდუქტი ჩაიტვირთოს (endpoint limit-ს არ ჭრის); 1000 ფარავს ყველაზე დიდ ბრენდს.
const PRODUCT_LIMIT = 1000;

export default function BrandProductsPage() {
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
  const [loading, setLoading] = useState(true);
  const [filtersActive, setFiltersActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  const params = useParams();
  const brandSlug = decodeURIComponent(params.brandSlug as string);
  const brandName = products[0]?.title ? products[0].title : brandSlug;
  const brandLabel = products[0]?.category ? brandSlug : brandName;

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setVisibleCount(9);
    getStorefrontProducts({
      page: 1,
      pageSize: PRODUCT_LIMIT,
      brandSlug,
    })
      .then((response) => {
        if (!isMounted) return;

        setProducts(response.items.map(mapStorefrontProductToCard));
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
  }, [brandSlug]);

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

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "ბრენდები" },
    { label: brandLabel },
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
              <img src="/icons/formater1.svg" alt="formater" />
              <img src="/icons/formater2.svg" alt="formater" />
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <EmptyState />
          ) : (
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
          )}

          {hasMore && (
            <div className={styles.ShowMore}>
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + 9, filteredProducts.length)
                  )
                }
              >
                მეტის ნახვა
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
