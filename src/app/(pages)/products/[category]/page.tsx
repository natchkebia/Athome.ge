"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./products.module.scss";
import DiscountCard, {
  ProductCardProps,
} from "@/components/discount/DiscountCard";
import ProductFilter from "@/components/products/ProductFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";

export default function ProductsPage() {
  // --- საერთო state ყველა ფილტრისთვის
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

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersActive, setFiltersActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  // --- კატეგორიის წამოღება URL-დან
  const params = useParams();
  const category = decodeURIComponent(params.category as string);

  // --- ფეიქ მონაცემები (დროებით)
  useEffect(() => {
    const fakeData: ProductCardProps[] = [
      {
        id: "1",
        image: "/images/discountPc.png",
        title:
          "ASUS ROG Strix G16 / Intel / RTX 4070 / 32GB / Black / New / 16",
        oldPrice: 9900,
        newPrice: 6900,
        discount: 8,
        category: "laptops",
        slug: "asus-rog-strix-g16",
      },
      {
        id: "2",
        image: "/images/discountPc.png",
        title:
          "Lenovo Legion 5 / AMD / RTX 4060 / 16GB / Gray / Second-hand / 14",
        oldPrice: 8500,
        newPrice: 4900,
        discount: 10,
        category: "laptops",
        slug: "lenovo-legion-5",
      },
      {
        id: "3",
        image: "/images/discountPc.png",
        title: "Dell Alienware / Intel / RTX 4080 / 64GB / White / New / 16",
        oldPrice: 9500,
        newPrice: 8500,
        discount: 12,
        category: "laptops",
        slug: "dell-alienware",
      },
      {
        id: "4",
        image: "/images/discountPc.png",
        title: "Gigabyte Aorus / AMD / RTX 4050 / 16GB / Black / New / 15",
        oldPrice: 7600,
        newPrice: 5600,
        discount: 9,
        category: "laptops",
        slug: "gigabyte-aorus",
      },
      {
        id: "5",
        image: "/images/discountPc.png",
        title:
          "Apple MacBook / Apple Silicon / Integrated / 16GB / Gray / New / 14",
        oldPrice: 10500,
        newPrice: 9500,
        discount: 5,
        category: "laptops",
        slug: "apple-macbook",
      },
      {
        id: "6",
        image: "/images/discountPc.png",
        title:
          "ASUS ROG Strix G16 / Intel / RTX 4070 / 32GB / Black / New / 16",
        oldPrice: 9900,
        newPrice: 6900,
        discount: 8,
        category: "laptops",
        slug: "asus-rog-strix-g16",
      },
      {
        id: "7",
        image: "/images/discountPc.png",
        title:
          "Lenovo Legion 5 / AMD / RTX 4060 / 16GB / Gray / Second-hand / 14",
        oldPrice: 8500,
        newPrice: 4900,
        discount: 10,
        category: "laptops",
        slug: "lenovo-legion-5",
      },
      {
        id: "8",
        image: "/images/discountPc.png",
        title: "Dell Alienware / Intel / RTX 4080 / 64GB / White / New / 16",
        oldPrice: 9500,
        newPrice: 8500,
        discount: 12,
        category: "laptops",
        slug: "dell-alienware",
      },
      {
        id: "9",
        image: "/images/discountPc.png",
        title: "Gigabyte Aorus / AMD / RTX 4050 / 16GB / Black / New / 15",
        oldPrice: 7600,
        newPrice: 5600,
        discount: 9,
        category: "laptops",
        slug: "gigabyte-aorus",
      },
      {
        id: "10",
        image: "/images/discountPc.png",
        title:
          "Apple MacBook / Apple Silicon / Integrated / 16GB / Gray / New / 14",
        oldPrice: 10500,
        newPrice: 9500,
        discount: 5,
        category: "laptops",
        slug: "apple-macbook",
      },
      {
        id: "11",
        image: "/images/discountPc.png",
        title:
          "ASUS ROG Strix G16 / Intel / RTX 4070 / 32GB / Black / New / 16",
        oldPrice: 9900,
        newPrice: 6900,
        discount: 8,
        category: "laptops",
        slug: "asus-rog-strix-g16",
      },
      {
        id: "12",
        image: "/images/discountPc.png",
        title:
          "Lenovo Legion 5 / AMD / RTX 4060 / 16GB / Gray / Second-hand / 14",
        oldPrice: 8500,
        newPrice: 4900,
        discount: 10,
        category: "laptops",
        slug: "lenovo-legion-5",
      },
      {
        id: "13",
        image: "/images/discountPc.png",
        title: "Dell Alienware / Intel / RTX 4080 / 64GB / White / New / 16",
        oldPrice: 9500,
        newPrice: 8500,
        discount: 12,
        category: "laptops",
        slug: "dell-alienware",
      },
      {
        id: "14",
        image: "/images/discountPc.png",
        title: "Gigabyte Aorus / AMD / RTX 4050 / 16GB / Black / New / 15",
        oldPrice: 7600,
        newPrice: 5600,
        discount: 9,
        category: "laptops",
        slug: "gigabyte-aorus",
      },
      {
        id: "15",
        image: "/images/discountPc.png",
        title:
          "Apple MacBook / Apple Silicon / Integrated / 16GB / Gray / New / 14",
        oldPrice: 10500,
        newPrice: 9500,
        discount: 5,
        category: "laptops",
        slug: "apple-macbook",
      },
      {
        id: "16",
        image: "/images/discountPc.png",
        title:
          "ASUS ROG Strix G16 / Intel / RTX 4070 / 32GB / Black / New / 16",
        oldPrice: 9900,
        newPrice: 6900,
        discount: 8,
        category: "laptops",
        slug: "asus-rog-strix-g16",
      },
      {
        id: "17",
        image: "/images/discountPc.png",
        title:
          "Lenovo Legion 5 / AMD / RTX 4060 / 16GB / Gray / Second-hand / 14",
        oldPrice: 8500,
        newPrice: 4900,
        discount: 10,
        category: "laptops",
        slug: "lenovo-legion-5",
      },
      {
        id: "18",
        image: "/images/discountPc.png",
        title: "Dell Alienware / Intel / RTX 4080 / 64GB / White / New / 16",
        oldPrice: 9500,
        newPrice: 8500,
        discount: 12,
        category: "laptops",
        slug: "dell-alienware",
      },
      {
        id: "19",
        image: "/images/discountPc.png",
        title: "Gigabyte Aorus / AMD / RTX 4050 / 16GB / Black / New / 15",
        oldPrice: 7600,
        newPrice: 5600,
        discount: 9,
        category: "laptops",
        slug: "gigabyte-aorus",
      },
      {
        id: "20",
        image: "/images/discountPc.png",
        title:
          "Apple MacBook / Apple Silicon / Integrated / 16GB / Gray / New / 14",
        oldPrice: 10500,
        newPrice: 9500,
        discount: 5,
        category: "laptops",
        slug: "apple-macbook",
      },
    ];

    setProducts(fakeData);
    setLoading(false);
  }, []);

  // --- ფილტრაცია და სორტირება
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

  // --- ფილტრების განახლება
  const handleUpdateFilters = (newValues: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    setFiltersActive(true);
    setVisibleCount(9);
  };

  // --- აქტიური ფილტრები
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

  // --- Breadcrumb
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: category },
  ];

  // --- Loading / Empty state
  if (loading) return <div className={styles.loader}>იტვირთება...</div>;
  if (products.length === 0) {
    return (
      <>
        <Breadcrumb items={breadcrumbs} />
        <EmptyState />
      </>
    );
  }

  // --- ძირითადი რენდერი
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
            <div className={styles.grid}>
              {visibleProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.category}/${item.slug}`}
                  className={styles.cardLink}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <DiscountCard {...item} />
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
