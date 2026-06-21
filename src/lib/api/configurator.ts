import { apiRequest } from "./client";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

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
  drive: "storageDrive",
  storage: "storageDrive",
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
  stockStatus?: string | null;
  ratingAverage: number;
  ratingCount: number;
  keySpecs: ConfiguratorSpecBadge[];
};

export type ConfiguratorProductsResponse = {
  items: ConfiguratorProductCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
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
  errorMessage?: string | null;
};

export type SaveBuildResponse = {
  shareToken?: string | null;
  shareUrl?: string | null;
  expiresAt: string;
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
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
};

export function getConfiguratorSlotProducts(
  slot: ConfiguratorSlot,
  params: SlotProductsQuery = {}
) {
  return apiRequest<ConfiguratorProductsResponse>(
    `/api/storefront/configurator/slots/${encodeURIComponent(slot)}/products`,
    {
      query: {
        Search: params.search,
        BrandSlug: params.brandSlug,
        MinPrice: params.minPrice,
        MaxPrice: params.maxPrice,
        Page: params.page,
        PageSize: params.pageSize ?? 50,
        SortBy: params.sortBy,
      },
      useProxy: true,
    }
  );
}

// Fetch peripheral products from the normal catalog (returns a plain array).
export function getCategoryProductsBySlugs(
  categorySlug: string,
  slugs: string[]
) {
  const query: Record<string, string> = {};
  // apiRequest only sets one value per key; for a single slug that's enough.
  if (slugs.length === 1) query.slugs = slugs[0];
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
