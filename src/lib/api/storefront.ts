import { apiRequest } from "./client";

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
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  website: string;
  productCount: number;
  displayOrder: number;
};

export type StorefrontCategory = {
  name: string;
  slug: string;
  description?: string;
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
  stockStatus: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTopSeller: boolean;
  isDealOfDay: boolean;
  ratingAverage: number;
  ratingCount: number;
};

export type StorefrontProductDetail = Omit<
  StorefrontProduct,
  "sellingPrice" | "effectivePrice" | "thumbnailUrl"
> & {
  model?: string;
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
  keyFeatures: string[];
  boxContents: string[];
  subCategory?: {
    name: string;
    slug: string;
  };
  specifications: {
    groupName?: string;
    name?: string;
    value?: string;
    sortOrder?: number;
  }[];
  attributes: {
    name?: string;
    value?: string;
    groupName?: string;
  }[];
  warehouseQuantity: number;
  supplierQuantity: number;
  totalEffectiveQuantity: number;
  relatedProducts: StorefrontProduct[];
  accessoryProducts: StorefrontProduct[];
  compatibleProducts: StorefrontProduct[];
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
  ratingAverage: number;
  ratingCount: number;
};

export type StorefrontSearchSuggestion = {
  type: "product" | "brand" | "category" | string;
  label: string;
  slug: string;
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
  };
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

export function getStorefrontCategory(slug: string) {
  return apiRequest<StorefrontCategory>(
    `/api/storefront/categories/${encodeURIComponent(slug)}`,
    {
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
      query: { limit },
      useProxy: true,
    }
  );
}

export function getStorefrontProductsByBrand(brandSlug: string, limit = 24) {
  return apiRequest<StorefrontProduct[]>(
    `/api/storefront/products/by-brand/${encodeURIComponent(brandSlug)}`,
    {
      query: { limit },
      useProxy: true,
    }
  );
}

export function getFeaturedStorefrontProducts(limit = 8) {
  return apiRequest<StorefrontProduct[]>("/api/storefront/products/featured", {
    query: { limit },
    useProxy: true,
  });
}

export function getNewArrivalStorefrontProducts(limit = 8) {
  return apiRequest<StorefrontProduct[]>(
    "/api/storefront/products/new-arrivals",
    {
      query: { limit },
      useProxy: true,
    }
  );
}

export function getBestSellerStorefrontProducts(limit = 8) {
  return apiRequest<StorefrontProduct[]>(
    "/api/storefront/products/best-sellers",
    {
      query: { limit },
      useProxy: true,
    }
  );
}

export function getDealStorefrontProducts(limit = 6) {
  return apiRequest<StorefrontProduct[]>("/api/storefront/products/deals", {
    query: { limit },
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

export function searchStorefrontProducts({
  query,
  page = 1,
  pageSize = 24,
  categorySlug,
  brandSlug,
}: {
  query: string;
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  brandSlug?: string;
}) {
  return apiRequest<StorefrontSearchResponse>("/api/storefront/search", {
    query: {
      Query: query,
      Page: page,
      PageSize: pageSize,
      CategorySlug: categorySlug,
      BrandSlug: brandSlug,
    },
    useProxy: true,
  });
}

export function getStorefrontSearchSuggestions(query: string) {
  return apiRequest<StorefrontSearchSuggestion[]>(
    "/api/storefront/search/suggest",
    {
      query: { query },
      useProxy: true,
    }
  );
}
