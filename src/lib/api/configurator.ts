import { apiRequest } from "./client";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import type { StorefrontCategoryFilter } from "./storefront";

// Backend slot enum (system-unit only). Peripherals/OS are NOT supported by the
// configurator backend yet — those slots stay on local data until backend adds them.
export type ConfiguratorSlot =
  | "cpu"
  | "motherboard"
  | "ram"
  | "gpu"
  | "psu"
  | "case"
  | "cpuCooler"
  | "liquidCooler"
  | "storageDrive"
  | "storageSsd"
  | "storageHdd"
  | "caseFan";

// Maps the frontend category keys (configuratorTypes) to backend slot values.
// Keys with no backend slot (os + peripherals) are intentionally absent.
export const FRONTEND_TO_BACKEND_SLOT: Record<string, ConfiguratorSlot> = {
  processor: "cpu",
  motherboard: "motherboard",
  ram: "ram",
  gpu: "gpu",
  psu: "psu",
  cooler: "cpuCooler",
  case: "case",
  drive: "storageHdd",
  storage: "storageSsd",
  storageDrive: "storageDrive",
  caseFan: "caseFan",
};

// Peripherals are NOT part of the configurator backend — they live in the normal
// catalog under the "gaming-zone" category, filtered by sub-category slug.
export const PERIPHERAL_PARENT_CATEGORY = "gaming-zone";

// frontend peripheral key === backend sub-category slug (1:1)
export const PERIPHERAL_SLUGS = new Set([
  "monitor",
  "headphones",
  "keyboard",
  "mouse",
  "microphone",
  "speaker",
]);

export type ConfiguratorSpecBadge = {
  label?: string | null;
  value?: string | null;
};

export type ConfiguratorProductCard = {
  id: number;
  name?: string | null;
  slug?: string | null;
  sku?: string | null;
  thumbnailUrl?: string | null;
  effectivePrice: number;
  oldPrice?: number | null;
  discountPercent?: number | null;
  currencyCode?: string | null;
  brandName?: string | null;
  brandSlug?: string | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  hasOwnStock?: boolean | null;
  compatibilityStatus?: "compatible" | "unknown" | "unchecked" | null;
  ratingAverage: number;
  ratingCount: number;
  keySpecs: ConfiguratorSpecBadge[];
};

export type ConfiguratorBrandFacet = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
};

export type ConfiguratorProductsResponse = {
  items: ConfiguratorProductCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  brands: ConfiguratorBrandFacet[];
  filters: StorefrontCategoryFilter[];
  hiddenByCompatibility: number;
  hiddenByStock: number;
  unknownCount: number;
};

export type ConfiguratorSlotDefinition = {
  slot: ConfiguratorSlot;
  productCount: number;
  isRecommended: boolean;
  displayOrder: number;
};

export type ConfiguratorBuildSlot = {
  slot: ConfiguratorSlot;
  productId: number;
};

export type ConfiguratorIssue = {
  severity?: string | null;
  ruleCode?: string | null;
  message?: string | null;
  detail?: string | null;
  resolutionHint?: string | null;
  involvedProductIds?: number[];
};

export type ConfiguratorBuildSlotSummary = {
  slot: ConfiguratorSlot;
  productId: number;
  productName?: string | null;
  thumbnailUrl?: string | null;
  price: number;
  stockQuantity?: number | null;
  stockStatus?: string | null;
  hasIssue: boolean;
};

export type ConfiguratorBuildSummary = {
  totalPrice: number;
  currencyCode?: string | null;
  filledSlots: number;
  recommendedSlots: number;
  slots: ConfiguratorBuildSlotSummary[];
};

export type ConfiguratorCheckResult = {
  verdict: "compatible" | "hasWarnings" | "incompatible" | "partialBuild";
  isCompatible: boolean;
  blockingCount: number;
  warningCount: number;
  checkedPairs: number;
  slotIssues: {
    slot: ConfiguratorSlot;
    productId: number;
    productName?: string | null;
    hasBlockingIssue: boolean;
    issues: ConfiguratorIssue[];
  }[];
  allIssues: ConfiguratorIssue[];
  summary: ConfiguratorBuildSummary;
  power?: {
    measuredCoreWatts: number;
    estimatedTotalWatts: number;
    recommendedPsuWatts: number;
    psuRatedWatts: number;
    loadPercent: number;
    hasMeasuredCore: boolean;
  } | null;
  errorMessage?: string | null;
};

export type SaveBuildResponse = {
  id?: number;
  shareToken?: string | null;
  shareUrl?: string | null;
  expiresAt: string | null;
  savedToProfile?: boolean;
};

export type ProfileConfiguratorBuild = {
  id: number;
  name: string;
  createdAt: string;
  itemCount: number;
  totalPrice: number;
  unavailableCount: number;
  shareUrl?: string | null;
};

export type AddBuildToCartResponse = {
  addedCount: number;
  skipped: { productId: number; name: string; reason: string }[];
};

export type LoadedBuild = {
  name?: string | null;
  createdAt: string;
  slots: ConfiguratorBuildSlotSummary[];
  summary: ConfiguratorBuildSummary;
};

// ---- Functions ----

export type SlotProductsQuery = {
  search?: string;
  brandSlug?: string;
  brandSlugs?: string[];
  selectedIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  attributes?: Record<string, string[]>;
  ranges?: Record<string, number[]>;
  inStockOnly?: boolean;
};

export function getConfiguratorSlots() {
  return apiRequest<ConfiguratorSlotDefinition[]>(
    "/api/storefront/configurator/slots",
    { useProxy: true },
  );
}

export function getConfiguratorSlotProducts(
  slot: ConfiguratorSlot,
  params: SlotProductsQuery = {}
) {
  return apiRequest<ConfiguratorProductsResponse>(
    `/api/storefront/configurator/slots/${encodeURIComponent(slot)}/products`,
    {
      query: {
        search: params.search,
        brandSlug: params.brandSlug,
        brandSlugs: params.brandSlugs,
        selectedIds: params.selectedIds,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        page: params.page,
        pageSize: params.pageSize ?? 1000,
        sortBy: params.sortBy,
        attr: Object.entries(params.attributes ?? {})
          .filter(([, values]) => values.length > 0)
          .map(([code, values]) => `${code}:${values.join("|")}`),
        range: Object.entries(params.ranges ?? {})
          .filter(([, bounds]) => bounds.length >= 2)
          .map(([code, bounds]) => `${code}:${bounds[0] ?? ""}:${bounds[1] ?? ""}`),
        inStockOnly: params.inStockOnly || undefined,
      },
      useProxy: true,
    }
  );
}

// Fetch peripheral products from the normal catalog (returns a plain array).
export function getCategoryProductsBySlugs(
  categorySlug: string,
  slugs: string[],
  limit?: number
) {
  const query: Record<string, string> = {};
  // apiRequest only sets one value per key; for a single slug that's enough.
  if (slugs.length === 1) query.slugs = slugs[0];
  // ლიმიტის გარეშე backend default 24-ს აბრუნებს — ლისტინგ-გვერდი explicit limit-ს გადასცემს.
  if (limit !== undefined) query.limit = String(limit);
  return apiRequest<ConfiguratorProductCard[]>(
    `/api/storefront/categories/${encodeURIComponent(categorySlug)}/products`,
    { query, useProxy: true }
  );
}

export function checkConfiguratorBuild(
  slots: ConfiguratorBuildSlot[],
  includeSuggestions = false
) {
  return apiRequest<ConfiguratorCheckResult>(
    "/api/storefront/configurator/check",
    {
      method: "POST",
      body: JSON.stringify({ slots, includeSuggestions }),
      useProxy: true,
    }
  );
}

export function saveConfiguratorBuild(
  name: string,
  slots: ConfiguratorBuildSlot[]
) {
  const tokens = getStoredAuthTokens();
  return apiRequest<SaveBuildResponse>(
    "/api/storefront/configurator/builds",
    {
      method: "POST",
      body: JSON.stringify({ name, slots }),
      token: tokens?.accessToken ?? null,
      useProxy: true,
    }
  );
}

export function getConfiguratorBuild(token: string) {
  return apiRequest<LoadedBuild>(
    `/api/storefront/configurator/builds/${encodeURIComponent(token)}`,
    { useProxy: true }
  );
}

function profileToken() {
  return getStoredAuthTokens()?.accessToken ?? null;
}

export function getProfileConfiguratorBuilds() {
  return apiRequest<ProfileConfiguratorBuild[]>("/api/profile/configurator-builds", {
    token: profileToken(),
    useProxy: true,
  });
}

export function getProfileConfiguratorBuild(id: number) {
  return apiRequest<LoadedBuild>(`/api/profile/configurator-builds/${id}`, {
    token: profileToken(),
    useProxy: true,
  });
}

export function deleteProfileConfiguratorBuild(id: number) {
  return apiRequest<void>(`/api/profile/configurator-builds/${id}`, {
    method: "DELETE",
    token: profileToken(),
    useProxy: true,
  });
}

export function addProfileConfiguratorBuildToCart(id: number) {
  return apiRequest<AddBuildToCartResponse>(
    `/api/profile/configurator-builds/${id}/add-to-cart`,
    { method: "POST", token: profileToken(), useProxy: true },
  );
}

export async function downloadProfileConfiguratorBuild(id: number) {
  const response = await fetch(`/api/profile/configurator-builds/${id}/export`, {
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ...(profileToken() ? { Authorization: `Bearer ${profileToken()}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`Export failed: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `configuration-${id}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
