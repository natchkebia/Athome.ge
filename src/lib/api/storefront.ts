import { apiRequest } from "./client";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

export type StorefrontBanner = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  ctaLabel: string;
  sortOrder: number;
};

export type StorefrontPromotionBanner = {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  endsAt?: string;
};

export type StorefrontHome = {
  heroBanners?: StorefrontBanner[];
  promotionBanners?: StorefrontPromotionBanner[];
};

export type StorefrontBrand = {
  id?: number;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  website: string;
  productCount: number;
  displayOrder: number;
};

export type StorefrontCategory = {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  productCount: number;
  sortOrder: number;
  subCategories: {
    name: string;
    slug: string;
    imageUrl?: string;
    productCount: number;
    miniCategories: {
      name: string;
      slug: string;
    }[];
  }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImageUrl?: string;
  };
};

export type StorefrontProduct = {
  id: number;
  name: string;
  shortTitle: string;
  slug: string;
  sku: string;
  sellingPrice: number;
  oldPrice?: number;
  effectivePrice: number;
  discountPercent?: number;
  currencyCode: string;
  activePromotion?: {
    promotionId: number;
    promotionName: string;
    discountType: number;
    discountValue: number;
  } | null;
  thumbnailUrl: string;
  brand: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  subCategory?: {
    name: string;
    slug: string;
  };
  stockStatus: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTopSeller: boolean;
  isDealOfDay: boolean;
  ratingAverage: number;
  ratingCount: number;
};

// PDP specs — grouped by the category attribute template. Backend returns groups
// and fields already in display order (do not re-sort). value is fully formatted
// (units appended, booleans as "Yes"/"No", multi-select joined with ", ").
export type StorefrontSpecField = {
  label: string;
  value: string;
};

export type StorefrontSpecGroup = {
  name: string;
  fields: StorefrontSpecField[];
};

// Flat attribute list (compact views). Superseded by `specifications` for the
// full spec table, but still returned.
export type StorefrontProductAttribute = {
  name: string;
  selectedValue: string;
};

// Compatible components, grouped by what the part is (Motherboard, Ram, …).
// Only ever non-empty for PC components; render groups in the order they arrive.
export type StorefrontCompatibleGroup = {
  componentType: string;
  products: StorefrontProduct[];
};

export type StorefrontStockLocation = {
  code: "tsereteli" | "saburtalo" | "warehouse" | "online";
  name: string;
  address?: string | null;
  quantity: number;
  note?: string | null;
};

export type StorefrontProductDetail = Omit<
  StorefrontProduct,
  "sellingPrice" | "effectivePrice" | "thumbnailUrl"
> & {
  model?: string;
  officialUrl?: string | null;
  pricing: {
    sellingPrice: number;
    effectivePrice: number;
    discountAmount: number;
    priceWithVat: number;
    currencyCode: string;
  };
  images: {
    url: string;
    altText: string;
    isMain: boolean;
    sortOrder: number;
  }[];
  videos: unknown[];
  descriptionHtml?: string;
  shortDescription?: string;
  technicalOverview?: string | null;
  keyFeatures: string[];
  boxContents: string[];
  subCategory?: {
    name: string;
    slug: string;
  };
  specifications: StorefrontSpecGroup[];
  attributes: StorefrontProductAttribute[];
  warehouseQuantity: number;
  supplierQuantity: number;
  totalEffectiveQuantity: number;
  stockLocations: StorefrontStockLocation[];
  relatedProducts: StorefrontProduct[];
  alternativeProducts: StorefrontProduct[];
  accessoryProducts: StorefrontProduct[];
  upsellProducts: StorefrontProduct[];
  compatibleProducts: StorefrontCompatibleGroup[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImageUrl?: string;
  } | null;
};

export type StorefrontProductReview = {
  id: number;
  productId: number;
  customerName: string;
  isVerifiedPurchase: boolean;
  rating: number;
  title: string;
  comment: string;
  pros?: string;
  cons?: string;
  adminReply?: string;
  adminRepliedAt?: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  createdAt: string;
  updatedAt: string;
};

export type StorefrontProductRatingSummary = {
  ratingAverage: number;
  totalReviews: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
  lastReviewedAtUtc?: string;
};

export type StorefrontProductReviewsResponse = {
  items: StorefrontProductReview[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  ratingSummary: StorefrontProductRatingSummary;
};

export type StorefrontSearchProduct = {
  id?: number;
  slug: string;
  name: string;
  sku: string;
  thumbnailUrl: string;
  effectivePrice: number;
  oldPrice?: number;
  currencyCode: string;
  brandName: string;
  categoryName: string;
  stockStatus: string;
  isAvailable?: boolean;
  ratingAverage: number;
  ratingCount: number;
};

export type StorefrontSearchSuggestion = {
  type: "product" | "brand" | "category" | string;
  label: string;
  slug: string;
  sku?: string;
  thumbnailUrl?: string;
  effectivePrice?: number;
  oldPrice?: number;
  currencyCode?: string;
};

export type StorefrontSearchResponse = {
  query: string;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  products: StorefrontSearchProduct[];
  suggestions: StorefrontSearchSuggestion[];
  facets: {
    minPrice: number;
    maxPrice: number;
    categories: {
      name: string;
      slug: string;
      count: number;
    }[];
    brands: {
      name: string;
      slug: string;
      count: number;
    }[];
    attributes?: StorefrontCategoryFilter[];
  };
};

export type StorefrontPagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type StorefrontProductsSortBy =
  | "relevance"
  | "priceAsc"
  | "priceDesc"
  | "newest"
  | "rating"
  | "topSellers";

export type StorefrontProductsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  miniCategorySlug?: string;
  brandSlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  newArrivals?: boolean;
  topSellers?: boolean;
  dealsOnly?: boolean;
  sortBy?: StorefrontProductsSortBy;
  sortDescending?: boolean;
  attr?: string[];
  range?: string[];
};

export type StorefrontFilterOption = {
  optionId: number;
  value: string;
  label: string;
  productCount: number;
  sortOrder: number;
};

export type StorefrontCategoryFilter = {
  fieldId: number;
  fieldKey: string;
  displayName: string;
  unit?: string | null;
  widgetType: "checkbox" | "select" | "radio" | "range" | "toggle" | "colorSwatch";
  sortOrder: number;
  options?: StorefrontFilterOption[];
  range?: {
    absoluteMin: number;
    absoluteMax: number;
    fieldMin?: number | null;
    fieldMax?: number | null;
    unit?: string | null;
    step: number;
  } | null;
};

export type StorefrontCategoryFilterSet = {
  categoryId: number;
  subCategoryId?: number | null;
  miniCategoryId?: number | null;
  filterCount: number;
  totalProductCount: number;
  brands: StorefrontBrandFacet[];
  filters: StorefrontCategoryFilter[];
};

export type StorefrontBrandFacet = {
  brandId: number;
  slug: string;
  name: string;
  productCount: number;
};

export function getStorefrontBanners(type?: string) {
  return apiRequest<StorefrontBanner[]>("/api/storefront/banners", {
    query: { type },
    useProxy: true,
  });
}

export function getStorefrontHome() {
  return apiRequest<StorefrontHome>("/api/storefront/home", {
    useProxy: true,
  });
}

export function getFeaturedStorefrontBrands(limit = 12) {
  return apiRequest<StorefrontBrand[]>("/api/storefront/brands/featured", {
    query: { limit },
    useProxy: true,
  });
}

export function getStorefrontCategories() {
  return apiRequest<StorefrontCategory[]>("/api/storefront/categories", {
    useProxy: true,
  });
}

export type StorefrontService = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  sortOrder: number;
};

export function getStorefrontServices() {
  return apiRequest<StorefrontService[]>("/api/storefront/services", {
    useProxy: true,
  });
}

export function getStorefrontCategory(slug: string) {
  return apiRequest<StorefrontCategory>(
    `/api/storefront/categories/${encodeURIComponent(slug)}`,
    {
      useProxy: true,
    }
  );
}

export function getStorefrontProducts(params: StorefrontProductsQuery = {}) {
  return apiRequest<StorefrontPagedResult<StorefrontProduct>>(
    "/api/storefront/products",
    {
      query: {
        Page: params.page,
        PageSize: params.pageSize,
        Search: params.search,
        CategorySlug: params.categorySlug,
        SubCategorySlug: params.subCategorySlug,
        MiniCategorySlug: params.miniCategorySlug,
        BrandSlug: params.brandSlug,
        BrandSlugs: params.brandSlugs,
        MinPrice: params.minPrice,
        MaxPrice: params.maxPrice,
        InStockOnly: params.inStockOnly ?? true,
        FeaturedOnly: params.featuredOnly,
        NewArrivals: params.newArrivals,
        TopSellers: params.topSellers,
        DealsOnly: params.dealsOnly,
        SortBy: params.sortBy,
        SortDescending: params.sortDescending,
        Attr: params.attr,
        Range: params.range,
      },
      useProxy: true,
    }
  );
}

export async function getAllStorefrontProducts(
  params: StorefrontProductsQuery = {}
) {
  const pageSize = Math.min(params.pageSize ?? 100, 100);
  const first = await getStorefrontProducts({ ...params, page: 1, pageSize });
  if (first.totalPages <= 1) return first.items;

  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      getStorefrontProducts({ ...params, page: index + 2, pageSize })
    )
  );
  return [first, ...rest].flatMap((page) => page.items);
}

export function getStorefrontCategoryFilters(
  slug: string,
  level: "categories" | "subcategories" | "minicategories",
  params: {
    attr?: string[];
    range?: string[];
    brandSlug?: string;
    brandSlugs?: string[];
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
  } = {}
) {
  return apiRequest<StorefrontCategoryFilterSet>(
    `/api/storefront/${level}/${encodeURIComponent(slug)}/filters`,
    {
      query: {
        IncludeEmptyOptions: false,
        IncludeProductCounts: true,
        Attr: params.attr,
        Range: params.range,
        BrandSlug: params.brandSlug,
        BrandSlugs: params.brandSlugs,
        InStockOnly: params.inStockOnly ?? true,
        MinPrice: params.minPrice,
        MaxPrice: params.maxPrice,
      },
      useProxy: true,
    }
  );
}

export function getStorefrontProductsByCategory(
  categorySlug: string,
  limit = 24
) {
  return apiRequest<StorefrontProduct[]>(
    `/api/storefront/products/by-category/${encodeURIComponent(categorySlug)}`,
    {
      query: { limit, InStockOnly: true },
      useProxy: true,
    }
  );
}

// Returns a top-level category's full product set. (For sub/mini slugs this
// returns empty — callers should fall back to getStorefrontProductsByCategory.)
export function getStorefrontCategoryProducts(
  categorySlug: string,
  limit = 24
) {
  return apiRequest<StorefrontProduct[]>(
    `/api/storefront/categories/${encodeURIComponent(categorySlug)}/products`,
    {
      query: { limit, InStockOnly: true },
      useProxy: true,
    }
  );
}

export function getStorefrontProductsByBrand(brandSlug: string, limit = 24) {
  return apiRequest<StorefrontProduct[]>(
    `/api/storefront/products/by-brand/${encodeURIComponent(brandSlug)}`,
    {
      query: { limit, InStockOnly: true },
      useProxy: true,
    }
  );
}

export function getFeaturedStorefrontProducts(limit = 8) {
  return apiRequest<StorefrontProduct[]>("/api/storefront/products/featured", {
    query: { limit, InStockOnly: true },
    useProxy: true,
  });
}

export function getNewArrivalStorefrontProducts(limit = 8) {
  return apiRequest<StorefrontProduct[]>(
    "/api/storefront/products/new-arrivals",
    {
      query: { limit, InStockOnly: true },
      useProxy: true,
    }
  );
}

export function getBestSellerStorefrontProducts(limit = 8) {
  return apiRequest<StorefrontProduct[]>(
    "/api/storefront/products/best-sellers",
    {
      query: { limit, InStockOnly: true },
      useProxy: true,
    }
  );
}

export function getDealStorefrontProducts(limit = 6) {
  return apiRequest<StorefrontProduct[]>("/api/storefront/products/deals", {
    query: { limit, InStockOnly: true },
    useProxy: true,
  });
}

export function getStorefrontProduct(slug: string) {
  return apiRequest<StorefrontProductDetail>(
    `/api/storefront/products/${encodeURIComponent(slug)}`,
    {
      useProxy: true,
    }
  );
}

export function getStorefrontProductReviews(productId: number, pageSize = 6) {
  return apiRequest<StorefrontProductReviewsResponse>(
    `/api/storefront/products/${productId}/reviews`,
    {
      query: {
        Page: 1,
        PageSize: pageSize,
        SortBy: "newest",
      },
      useProxy: true,
    }
  );
}

export type SubmitProductReviewPayload = {
  rating: number;
  title?: string;
  comment?: string;
  pros?: string;
  cons?: string;
  customerName?: string;
  customerEmail?: string;
};

// Backend returns a submission result, not the review itself — new reviews go
// through admin moderation before appearing in the public list.
export type ReviewSubmissionResult = {
  id: number;
  status: string; // e.g. "pending" | "approved"
  message: string;
};

export function submitStorefrontProductReview(
  productId: number,
  payload: SubmitProductReviewPayload
) {
  const tokens = getStoredAuthTokens();
  return apiRequest<ReviewSubmissionResult>(
    `/api/storefront/products/${productId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      token: tokens?.accessToken ?? null,
      useProxy: true,
    }
  );
}

const STOREFRONT_SEARCH_ALIASES: Array<[string, string]> = [
  ["ნოუთბუქის ნაწილები", "laptop parts"],
  ["კომპიუტერის ნაწილები", "computer parts"],
  ["სავარძლები და მაგიდები", "chair desk"],
  ["ნოუთბუქები", "laptop"],
  ["ნოუთბუქი", "laptop"],
  ["ლეპტოპები", "laptop"],
  ["ლეპტოპი", "laptop"],
  ["კომპიუტერები", "computer"],
  ["კომპიუტერი", "computer"],
  ["მონიტორები", "monitor"],
  ["მონიტორი", "monitor"],
  ["ტელევიზორები", "television"],
  ["ტელევიზორი", "television"],
  ["პროექტორები", "projector"],
  ["პროექტორი", "projector"],
  ["კლავიატურები", "keyboard"],
  ["კლავიატურა", "keyboard"],
  ["მაუსები", "mouse"],
  ["მაუსი", "mouse"],
  ["ყურსასმენები", "headset"],
  ["ყურსასმენი", "headset"],
  ["პრინტერები", "printer"],
  ["პრინტერი", "printer"],
  ["სავარძლები", "chair"],
  ["სავარძელი", "chair"],
  ["მაგიდები", "desk"],
  ["მაგიდა", "desk"],
];

function normalizeStorefrontSearchQuery(query: string) {
  return STOREFRONT_SEARCH_ALIASES.reduce(
    (value, [alias, replacement]) => value.replaceAll(alias, replacement),
    query.trim().toLocaleLowerCase("ka-GE"),
  );
}

export function searchStorefrontProducts({
  query,
  page = 1,
  pageSize = 24,
  categorySlug,
  brandSlug,
  brandSlugs,
  inStockOnly,
  attr,
  range,
  minPrice,
  maxPrice,
}: {
  query: string;
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  brandSlug?: string;
  brandSlugs?: string[];
  inStockOnly?: boolean;
  attr?: string[];
  range?: string[];
  minPrice?: number;
  maxPrice?: number;
}) {
  return apiRequest<StorefrontSearchResponse>("/api/storefront/search", {
    query: {
      Query: normalizeStorefrontSearchQuery(query),
      Page: page,
      PageSize: pageSize,
      CategorySlug: categorySlug,
      BrandSlug: brandSlug,
      BrandSlugs: brandSlugs,
      InStockOnly: inStockOnly ?? true,
      Attr: attr,
      Range: range,
      MinPrice: minPrice,
      MaxPrice: maxPrice,
    },
    useProxy: true,
  });
}

// კატეგორიების facets აბრუნებს მხოლოდ storefront-ში ხილულ კატეგორიებს რეალური
// რაოდენობით (categories endpoint-ის productCount არასანდოა — მთელ კატალოგს ითვლის).
export async function getStorefrontVisibleCategorySlugs(): Promise<Set<string>> {
  const result = await apiRequest<StorefrontSearchResponse>(
    "/api/storefront/search",
    {
      query: { PageSize: 1, InStockOnly: true },
      useProxy: true,
    }
  );

  return new Set(
    (result.facets?.categories ?? [])
      .filter((category) => category.count > 0)
      .map((category) => category.slug)
  );
}

export async function getStorefrontSearchSuggestions(query: string) {
  const normalizedSearchQuery = normalizeStorefrontSearchQuery(query);
  const [suggestionsResult, productsResult] = await Promise.allSettled([
    apiRequest<StorefrontSearchSuggestion[]>("/api/storefront/search/suggest", {
      query: { query: normalizedSearchQuery },
      useProxy: true,
    }),
    searchStorefrontProducts({ query, page: 1, pageSize: 8 }),
  ]);

  const suggestions =
    suggestionsResult.status === "fulfilled" ? suggestionsResult.value : [];
  const products =
    productsResult.status === "fulfilled" ? productsResult.value.products : [];
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const productSuggestions: StorefrontSearchSuggestion[] = products.map(
    (product) => ({
      type: "product",
      label: product.name,
      slug: product.slug,
      sku: product.sku,
      thumbnailUrl: product.thumbnailUrl,
      effectivePrice: product.effectivePrice,
      oldPrice: product.oldPrice,
      currencyCode: product.currencyCode,
    }),
  );

  // კოდის ზუსტი დამთხვევა ყოველთვის პირველ პოზიციაზე გამოჩნდეს.
  productSuggestions.sort((a, b) => {
    const aExact = a.sku?.toLocaleLowerCase() === normalizedQuery ? 1 : 0;
    const bExact = b.sku?.toLocaleLowerCase() === normalizedQuery ? 1 : 0;
    return bExact - aExact;
  });

  const merged = [...productSuggestions, ...suggestions];
  return merged
    .filter(
      (suggestion, index, items) =>
        items.findIndex(
          (item) => item.type === suggestion.type && item.slug === suggestion.slug,
        ) === index,
    )
    .slice(0, 8);
}
