import { apiRequest } from "./client";
import type { ConfiguratorIssue, ConfiguratorProductCard } from "./configurator";

export type PrebuiltPart = {
  slot: string;
  productId: number;
  productName: string;
  thumbnailUrl?: string | null;
  unitPrice: number;
  quantity: number;
  isSwappable: boolean;
  available: number;
};

export type PrebuiltConfiguration = {
  productId: number;
  name: string;
  basePrice: number;
  buildableUnits: number;
  parts: PrebuiltPart[];
};

export type PrebuiltOption = {
  product: ConfiguratorProductCard;
  priceDelta: number;
  newPrice: number;
};

export type PrebuiltOptionsResponse = {
  slot: string;
  currentProductId: number;
  currentName: string;
  currentUnitPrice: number;
  hiddenByCompatibility: number;
  options: PrebuiltOption[];
};

export type PrebuiltSwap = { componentProductId: number };

export type PrebuiltQuote = {
  productId: number;
  basePrice: number;
  price: number;
  priceDelta: number;
  buildableUnits: number;
  blockingIssues: ConfiguratorIssue[];
  parts: PrebuiltPart[];
};

export function getPrebuiltConfiguration(productId: number) {
  return apiRequest<PrebuiltConfiguration>(`/api/storefront/prebuilt/${productId}`, {
    useProxy: true,
  });
}

export function getPrebuiltSlotOptions(productId: number, slot: string) {
  return apiRequest<PrebuiltOptionsResponse>(
    `/api/storefront/prebuilt/${productId}/slots/${encodeURIComponent(slot)}/options`,
    { query: { page: 1, pageSize: 1000 }, useProxy: true },
  );
}

export function quotePrebuiltConfiguration(productId: number, swaps: PrebuiltSwap[]) {
  return apiRequest<PrebuiltQuote>(`/api/storefront/prebuilt/${productId}/quote`, {
    method: "POST",
    body: JSON.stringify(swaps),
    useProxy: true,
  });
}
