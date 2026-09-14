"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./products.module.scss";
import DiscountCard from "@/components/discount/DiscountCard";
import CategoryCard from "@/components/categorSection/CategoriCard";
import DynamicProductFilter, {
  DynamicFilterValues,
} from "@/components/products/DynamicProductFilter";
import ProductSortBar from "@/components/products/ProductSortBar";
import ProductPagination, {
  PRODUCTS_PER_PAGE,
} from "@/components/products/ProductPagination";
import EmptyState from "@/components/products/EmptyState";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  getStorefrontCategories,
  getStorefrontProducts,
  getAllStorefrontProducts,
  getStorefrontCategoryFilters,
  StorefrontCategory,
  StorefrontCategoryFilterSet,
} from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";
import { usePaginationPage } from "@/lib/navigation/usePaginationPage";

// ყველა პროდუქტი ჩაიტვირთოს (endpoint limit-ს არ ჭრის); 1000 ფარავს ყველაზე დიდ კატეგორიას.
const PRODUCT_LIMIT = 1000;
const FILTER_QUERY_PARAM = "filters";
type CategoryLevel = "categories" | "subcategories" | "minicategories";

type PersistedFilters = {
  price: [number, number];
  brandSlugs: string[];
  attributes: Record<string, string[]>;
  ranges: Record<string, number[]>;
  sort: string;
};

function parsePersistedFilters(
  raw: string | null,
  priceBounds: [number, number]
): PersistedFilters | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedFilters>;
    const parsedPrice = Array.isArray(parsed.price) ? parsed.price : [];
    const minPrice = Number(parsedPrice[0]);
    const maxPrice = Number(parsedPrice[1]);
    const price: [number, number] =
      Number.isFinite(minPrice) && Number.isFinite(maxPrice)
        ? [
            Math.max(priceBounds[0], Math.min(minPrice, priceBounds[1])),
            Math.max(priceBounds[0], Math.min(maxPrice, priceBounds[1])),
          ]
        : priceBounds;

    const attributes = Object.fromEntries(
      Object.entries(parsed.attributes ?? {}).flatMap(([key, values]) =>
        Array.isArray(values)
          ? [[key, values.filter((value): value is string => typeof value === "string")]]
          : []
      )
    );
    const ranges = Object.fromEntries(
      Object.entries(parsed.ranges ?? {}).flatMap(([key, values]) =>
        Array.isArray(values) && values.length === 2 && values.every(Number.isFinite)
          ? [[key, values.map(Number)]]
          : []
      )
    );
    const allowedSorts = new Set([
      "default",
      "price-asc",
      "price-desc",
      "a-z",
      "z-a",
    ]);

    return {
      price: price[0] <= price[1] ? price : priceBounds,
      brandSlugs: Array.isArray(parsed.brandSlugs)
        ? parsed.brandSlugs.filter(
            (value): value is string => typeof value === "string"
          )
        : [],
      attributes,
      ranges,
      sort:
        typeof parsed.sort === "string" && allowedSorts.has(parsed.sort)
          ? parsed.sort
          : "default",
    };
  } catch {
    return null;
  }
}

function hasDynamicFilters(
  values: DynamicFilterValues,
  priceBounds: [number, number]
) {
  return (
    values.price[0] !== priceBounds[0] ||
    values.price[1] !== priceBounds[1] ||
    values.brandSlugs.length > 0 ||
    Object.values(values.attributes).some((items) => items.length > 0) ||
    Object.values(values.ranges).some((items) => items.length === 2)
  );
}

// ქვეკატეგორიის ბარათების ფონის ფერები (მთავარი გვერდის კატეგორიების მსგავსი).
const SUBCAT_BG = [
  "#F0F8F8",
  "#F8F2F8",
  "#F9EEEE",
  "#F6F8FB",
  "#F6F8FB",
  "#F6F8FB",
  "#F6F8FB",
  "#F7F7FC",
];

function ProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFilterQueryRef = useRef(searchParams.get(FILTER_QUERY_PARAM));
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [filterSchema, setFilterSchema] =
    useState<StorefrontCategoryFilterSet | null>(null);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 8500]);
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilterValues>({
    price: [0, 8500],
    brandSlugs: [],
    inStockOnly: true,
    attributes: {},
    ranges: {},
  });
  const [dynamicFiltersActive, setDynamicFiltersActive] = useState(false);
  // undefined = ჯერ იტვირთება; null = ვერ მოიძებნა; object = ჩატვირთულია.
  const [categoryDetails, setCategoryDetails] =
    useState<StorefrontCategory | null | undefined>(undefined);
  const [categoryLevel, setCategoryLevel] =
    useState<CategoryLevel | null | undefined>(undefined);
  const [categoryName, setCategoryName] = useState("");
  const [resolvedCategorySlug, setResolvedCategorySlug] = useState("");
  const [subcatImages, setSubcatImages] = useState<Record<string, string>>({});
  // ქვეკატეგორიის ნამდვილი რაოდენობა — ხის productCount არასანდოა, ამიტომ
  // listing-ის იმავე წყაროდან (products endpoint totalCount) ვიღებთ.
  const [subcatCounts, setSubcatCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { currentPage, setCurrentPage } = usePaginationPage();
  const [view, setView] = useState<"grid" | "list">("grid");
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  const params = useParams();
  // [category] param ინახავს ნებისმიერი დონის slug-ს (category/sub/mini) —
  // by-category endpoint ყველა მათგანზე ზუსტად იმ დონის პროდუქტებს აბრუნებს.
  const category = decodeURIComponent(params.category as string);

  useEffect(() => {
    initialFilterQueryRef.current = searchParams.get(FILTER_QUERY_PARAM);
  }, [category, searchParams]);

  useEffect(() => {
    let isMounted = true;
    setCategoryDetails(undefined);
    setCategoryLevel(undefined);
    setResolvedCategorySlug("");

    getStorefrontCategories()
      .then((categories) => {
        if (!isMounted) return;

        const topCategory = categories.find((item) => item.slug === category);
        if (topCategory) {
          setCategoryDetails(topCategory);
          setCategoryLevel("categories");
          setCategoryName(topCategory.name);
          setResolvedCategorySlug(category);
          return;
        }

        for (const top of categories) {
          const subCategory = top.subCategories.find(
            (item) => item.slug === category
          );
          if (subCategory) {
            setCategoryDetails(null);
            setCategoryLevel("subcategories");
            setCategoryName(subCategory.name);
            setResolvedCategorySlug(category);
            return;
          }

          for (const sub of top.subCategories) {
            const miniCategory = sub.miniCategories.find(
              (item) => item.slug === category
            );
            if (miniCategory) {
              setCategoryDetails(null);
              setCategoryLevel("minicategories");
              setCategoryName(miniCategory.name);
              setResolvedCategorySlug(category);
              return;
            }
          }
        }

        setCategoryDetails(null);
        setCategoryLevel(null);
        setCategoryName(category);
        setResolvedCategorySlug(category);
      })
      .catch(() => {
        if (isMounted) {
          setCategoryDetails(null);
          setCategoryLevel(null);
          setCategoryName(category);
          setResolvedCategorySlug(category);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category]);

  useEffect(() => {
    if (categoryLevel === undefined || resolvedCategorySlug !== category) return;

    let active = true;
    setFilterSchema(null);
    setDynamicFiltersActive(false);
    if (categoryLevel === null) return;

    getStorefrontCategoryFilters(category, categoryLevel)
      .then((schema) => {
        if (active) setFilterSchema(schema);
      })
      .catch(() => {
        if (active) setFilterSchema(null);
      });

    return () => {
      active = false;
    };
  }, [category, categoryLevel, resolvedCategorySlug]);

  useEffect(() => {
    // კატეგორიის დეტალებს ველოდებით; თუ ქვეკატეგორიები აქვს, პროდუქტებს არ ვტვირთავთ
    // (ნაცვლად ბრტყელი სიისა — ქვეკატეგორიების grid გამოჩნდება).
    if (
      categoryDetails === undefined ||
      categoryLevel === undefined ||
      resolvedCategorySlug !== category
    ) {
      return;
    }
    if (categoryDetails && (categoryDetails.subCategories?.length ?? 0) > 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);
    // Legacy by-category endpoint backend-ზე შედეგებს ჭრის (მაგ. 92-დან 28).
    // Paged products endpoint სრულ totalCount-ს აბრუნებს ყველა დონეზე.
    const productsRequest = getAllStorefrontProducts({
      pageSize: PRODUCT_LIMIT,
      categorySlug: categoryLevel === "categories" ? category : undefined,
      subCategorySlug: categoryLevel === "subcategories" ? category : undefined,
      miniCategorySlug: categoryLevel === "minicategories" ? category : undefined,
    });

    productsRequest
      .then((list) => {
        if (!isMounted) return;
        const cards = list.map(mapStorefrontProductToCard);
        setProducts(cards);
        const highestPrice = Math.max(
          0,
          ...cards.map((product) => product.newPrice ?? 0)
        );
        const nextBounds: [number, number] = [
          0,
          Math.max(1, Math.ceil(highestPrice / 100) * 100),
        ];
        const restored = parsePersistedFilters(
          initialFilterQueryRef.current,
          nextBounds
        );
        const nextDynamicFilters: DynamicFilterValues = restored
          ? {
              price: restored.price,
              brandSlugs: restored.brandSlugs,
              inStockOnly: true,
              attributes: restored.attributes,
              ranges: restored.ranges,
            }
          : {
              price: nextBounds,
              brandSlugs: [],
              inStockOnly: true,
              attributes: {},
              ranges: {},
            };
        setPriceBounds(nextBounds);
        setDynamicFilters(nextDynamicFilters);
        setDynamicFiltersActive(
          restored !== null && hasDynamicFilters(nextDynamicFilters, nextBounds)
        );
        setFilters((current) => ({
          ...current,
          sort: restored?.sort ?? "default",
        }));
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
  }, [category, categoryDetails, categoryLevel, resolvedCategorySlug]);

  const filterSubCategoryId = filterSchema?.subCategoryId;
  const filterMiniCategoryId = filterSchema?.miniCategoryId;
  const hasFilterSchema = filterSchema !== null;

  useEffect(() => {
    if (!dynamicFiltersActive || !hasFilterSchema) return;
    let active = true;

    const attr = Object.entries(dynamicFilters.attributes)
      .filter(([, values]) => values.length > 0)
      .map(([fieldKey, values]) => `${fieldKey}:${values.join("|")}`);
    const range = Object.entries(dynamicFilters.ranges)
      .filter(([, bounds]) => bounds.length === 2)
      .map(([fieldKey, bounds]) => `${fieldKey}:${bounds[0]}:${bounds[1]}`);

    const baseQuery = {
      pageSize: PRODUCT_LIMIT,
      brandSlugs: dynamicFilters.brandSlugs,
      inStockOnly: dynamicFilters.inStockOnly,
      categorySlug:
        !filterSubCategoryId && !filterMiniCategoryId
          ? category
          : undefined,
      subCategorySlug:
        filterSubCategoryId && !filterMiniCategoryId
          ? category
          : undefined,
      miniCategorySlug: filterMiniCategoryId ? category : undefined,
      minPrice:
        dynamicFilters.price[0] !== priceBounds[0]
          ? dynamicFilters.price[0]
          : undefined,
      maxPrice:
        dynamicFilters.price[1] !== priceBounds[1]
          ? dynamicFilters.price[1]
          : undefined,
    };

    setLoading(true);

    void (async () => {
      try {
        // Facet schema იმავე არჩევანებით ახლდება: სხვა ფილტრებში მხოლოდ
        // მიმდინარე შედეგებთან თავსებადი option-ები და count-ები რჩება.
        if (!categoryLevel) return;

        const nextSchemaPromise = getStorefrontCategoryFilters(
          category,
          categoryLevel,
          {
            attr,
            range,
            brandSlugs: dynamicFilters.brandSlugs,
            inStockOnly: dynamicFilters.inStockOnly,
            minPrice: baseQuery.minPrice,
            maxPrice: baseQuery.maxPrice,
          }
        );

        // Backend-ის products endpoint მრავალ Attr-ს ამ ეტაპზე სრულად არ
        // კვეთს. ამიტომ თითო field-ის შედეგებს ცალ-ცალკე ვიღებთ:
        // ერთი field-ის option-ები OR-ია, სხვადასხვა field-ები კი AND.
        const groups = await Promise.all([
          ...Object.entries(dynamicFilters.attributes)
            .filter(([, values]) => values.length > 0)
            .map(async ([fieldKey, values]) => {
              return getAllStorefrontProducts({
                ...baseQuery,
                attr: [`${fieldKey}:${values.join("|")}`],
              });
            }),
          ...Object.entries(dynamicFilters.ranges)
            .filter(([, bounds]) => bounds.length === 2)
            .map(async ([fieldKey, bounds]) => {
              return getAllStorefrontProducts({
                ...baseQuery,
                range: [`${fieldKey}:${bounds[0]}:${bounds[1]}`],
              });
            }),
        ]);

        const resultItems =
          groups.length === 0
            ? await getAllStorefrontProducts(baseQuery)
            : groups[0].filter((product) =>
                groups
                  .slice(1)
                  .every((group) =>
                    group.some((candidate) => candidate.id === product.id)
                  )
              );
        const nextSchema = await nextSchemaPromise;

        if (active) {
          setFilterSchema(nextSchema);
          setProducts(resultItems.map(mapStorefrontProductToCard));
        }
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [
    category,
    categoryLevel,
    dynamicFilters,
    dynamicFiltersActive,
    hasFilterSchema,
    filterSubCategoryId,
    filterMiniCategoryId,
    priceBounds,
  ]);

  // ქვეკატეგორიის ბარათზე ვაჩვენებთ იმავე მარაგში არსებული პროდუქტების
  // პირველ ფოტოს და ზუსტად იმავე სრული სიის რაოდენობას, რასაც შიდა გვერდი.
  useEffect(() => {
    const subs = categoryDetails?.subCategories ?? [];
    if (subs.length === 0) {
      setSubcatImages({});
      setSubcatCounts({});
      return;
    }

    let isMounted = true;

    Promise.all(
      subs.map((sub) =>
        getAllStorefrontProducts({
          subCategorySlug: sub.slug,
          pageSize: PRODUCT_LIMIT,
        })
          .then((items) => ({
            image: items[0]
              ? mapStorefrontProductToCard(items[0]).image
              : "",
            count: items.length,
          }))
          .catch(() => ({ image: "", count: undefined }))
      )
    ).then((results) => {
      if (!isMounted) return;
      const imageMap: Record<string, string> = {};
      const countMap: Record<string, number> = {};
      subs.forEach((sub, index) => {
        imageMap[sub.slug] = sub.imageUrl?.trim() || results[index].image;
        if (typeof results[index].count === "number") {
          countMap[sub.slug] = results[index].count as number;
        }
      });
      setSubcatImages(imageMap);
      setSubcatCounts(countMap);
    });

    return () => {
      isMounted = false;
    };
  }, [categoryDetails]);

  const filteredProducts = useMemo(() => {
    const result = [...products];

    if (filters.sort === "price-asc")
      result.sort((a, b) => (a.newPrice ?? 0) - (b.newPrice ?? 0));
    if (filters.sort === "price-desc")
      result.sort((a, b) => (b.newPrice ?? 0) - (a.newPrice ?? 0));
    if (filters.sort === "a-z")
      result.sort((a, b) => a.title.localeCompare(b.title));
    if (filters.sort === "z-a")
      result.sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [products, filters.sort]);

  const persistFilters = (
    values: DynamicFilterValues,
    sort: string = filters.sort
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const shouldPersist =
      hasDynamicFilters(values, priceBounds) || sort !== "default";

    if (shouldPersist) {
      nextParams.set(
        FILTER_QUERY_PARAM,
        JSON.stringify({
          price: values.price,
          brandSlugs: values.brandSlugs,
          attributes: values.attributes,
          ranges: values.ranges,
          sort,
        } satisfies PersistedFilters)
      );
    } else {
      nextParams.delete(FILTER_QUERY_PARAM);
    }
    nextParams.delete("page");

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const applyDynamicFilters = (values: DynamicFilterValues) => {
    setDynamicFilters(values);
    setDynamicFiltersActive(true);
    persistFilters(values);
  };

  const handleUpdateFilters = (newValues: Partial<typeof filters>) => {
    const nextSort = newValues.sort ?? filters.sort;
    setFilters((prev) => ({ ...prev, ...newValues }));
    persistFilters(dynamicFilters, nextSort);
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
    setCurrentPage(1);
  };

  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(
    pageStart,
    pageStart + PRODUCTS_PER_PAGE
  );
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: categoryDetails?.name || categoryName || category },
  ];

  const subCategories = categoryDetails?.subCategories ?? [];

  // კატეგორიის დეტალები ჯერ იტვირთება.
  if (categoryDetails === undefined) return <AtHomeLoader variant="page" />;

  // კატეგორიას ქვეკატეგორიები აქვს → დაჯგუფებული landing (ბრტყელი სიის ნაცვლად).
  if (subCategories.length > 0) {
    return (
      <>
        <Breadcrumb items={breadcrumbs} />
        <div className={styles.subcatPage}>
          <h1 className={styles.subcatTitle}>
            {categoryDetails?.name || category}
          </h1>
          <div className={styles.subcatGrid}>
            {subCategories.map((sub, index) => (
              <CategoryCard
                key={sub.slug}
                title={sub.name}
                image={subcatImages[sub.slug] || undefined}
                bgColor={SUBCAT_BG[index % SUBCAT_BG.length]}
                slug={sub.slug}
                count={subcatCounts[sub.slug] ?? sub.productCount}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (loading && !dynamicFiltersActive) return <AtHomeLoader variant="page" />;
  if (products.length === 0 && !dynamicFiltersActive) {
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
        <div className={`${styles.sidebar} ${styles.desktopSidebar}`}>
          {filterSchema && (
            <DynamicProductFilter
              schema={filterSchema}
              values={dynamicFilters}
              priceBounds={priceBounds}
              onChange={(values) => {
                applyDynamicFilters(values);
              }}
            />
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.sortbarWrapper}>
            <ProductSortBar filters={filters} onChange={handleUpdateFilters} />
            {filterSchema && (
              <button
                type="button"
                className={`${styles.mobileFilterButton} ${
                  mobileFiltersOpen ? styles.mobileFilterButtonActive : ""
                }`}
                onClick={() => setMobileFiltersOpen((current) => !current)}
                aria-label="ფილტრების გახსნა"
                aria-expanded={mobileFiltersOpen}
              >
                <img src="/icons/Frame 165292.svg" alt="" />
              </button>
            )}
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

          {filterSchema && mobileFiltersOpen && (
            <div className={styles.mobileFilterPanel}>
              <DynamicProductFilter
                schema={filterSchema}
                values={dynamicFilters}
                priceBounds={priceBounds}
                compact
                onChange={(values) => {
                  applyDynamicFilters(values);
                }}
              />
            </div>
          )}

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

          <ProductPagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
          />

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
