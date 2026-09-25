import { StorefrontLocale } from "@/lib/i18n/locale";
import type {
  StorefrontBanner,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontHome,
  StorefrontPagedResult,
  StorefrontProduct,
} from "./storefront";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.ithome.ge"
).replace(/\/$/, "");

async function serverFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  locale: StorefrontLocale = "ka",
  revalidate = 60
): Promise<T | null> {
  const url = new URL(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  );
  if (locale) {
    url.searchParams.set("lang", locale);
  }
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.set(key, String(val));
      }
    });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Lang": locale,
      },
      next: { revalidate },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(
        `Server fetch failed for ${url.toString()}: status ${res.status}`
      );
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Server fetch error for ${url.toString()}:`, error);
    return null;
  }
}

export async function getStorefrontHomeServer(
  locale: StorefrontLocale = "ka"
): Promise<StorefrontHome> {
  const data = await serverFetch<StorefrontHome>(
    "/api/storefront/home",
    undefined,
    locale,
    60
  );
  return data ?? { heroBanners: [], promotionBanners: [] };
}

export async function getStorefrontBannersServer(
  locale: StorefrontLocale = "ka"
): Promise<StorefrontBanner[]> {
  const data = await serverFetch<StorefrontBanner[]>(
    "/api/storefront/banners",
    undefined,
    locale,
    60
  );
  return data ?? [];
}

export async function getStorefrontCategoriesServer(
  locale: StorefrontLocale = "ka"
): Promise<StorefrontCategory[]> {
  const data = await serverFetch<StorefrontCategory[]>(
    "/api/storefront/categories",
    undefined,
    locale,
    60
  );
  return data ?? [];
}

export async function getDealStorefrontProductsServer(
  limit = 48,
  locale: StorefrontLocale = "ka"
): Promise<StorefrontProduct[]> {
  const data = await serverFetch<
    StorefrontPagedResult<StorefrontProduct> | StorefrontProduct[]
  >(
    "/api/storefront/products/deals",
    { limit, InStockOnly: true },
    locale,
    60
  );
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export async function getStorefrontProductsByCategoryServer(
  categorySlug: string,
  limit = 8,
  locale: StorefrontLocale = "ka"
): Promise<StorefrontProduct[]> {
  const data = await serverFetch<StorefrontProduct[]>(
    `/api/storefront/products/by-category/${encodeURIComponent(categorySlug)}`,
    { limit, InStockOnly: true },
    locale,
    60
  );
  return data ?? [];
}

export async function getStorefrontCategoryProductsServer(
  categorySlug: string,
  limit = 8,
  locale: StorefrontLocale = "ka"
): Promise<StorefrontProduct[]> {
  const data = await serverFetch<StorefrontProduct[]>(
    `/api/storefront/categories/${encodeURIComponent(categorySlug)}/products`,
    { limit, InStockOnly: true },
    locale,
    60
  );
  return data ?? [];
}

export async function getStorefrontTablesAndChairsServer(
  limit = 12,
  locale: StorefrontLocale = "ka"
): Promise<StorefrontProduct[]> {
  const [tables, chairs] = await Promise.all([
    getStorefrontProductsByCategoryServer("table", limit, locale),
    getStorefrontProductsByCategoryServer("gaming-chair", limit, locale),
  ]);

  const combined: StorefrontProduct[] = [];
  const maxLen = Math.max(tables.length, chairs.length);
  for (let i = 0; i < maxLen; i++) {
    if (tables[i]) combined.push(tables[i]);
    if (chairs[i]) combined.push(chairs[i]);
  }
  return combined;
}

export async function getStorefrontBrandsServer(
  params: { featured?: boolean; pageSize?: number } = {},
  locale: StorefrontLocale = "ka"
): Promise<StorefrontBrand[]> {
  const data = await serverFetch<StorefrontPagedResult<StorefrontBrand>>(
    "/api/storefront/brands",
    {
      featured: params.featured,
      pageSize: params.pageSize ?? 24,
      page: 1,
    },
    locale,
    60
  );
  return data?.items ?? [];
}
