export const STOCK_SHORTFALL_STORAGE_KEY = "athome.checkoutStockShortfalls";

export type StockShortfallPart = {
  productId: number;
  name: string;
  sku?: string | null;
  needed: number;
  available: number;
};

export type StockShortfall = {
  productId: number;
  productName: string;
  requested: number;
  available: number;
  parts: StockShortfallPart[];
};

export type StockShortfallState = {
  detail: string;
  shortfalls: StockShortfall[];
};

export function readStockShortfalls(): StockShortfallState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STOCK_SHORTFALL_STORAGE_KEY);
    return raw ? JSON.parse(raw) as StockShortfallState : null;
  } catch {
    return null;
  }
}

export function writeStockShortfalls(value: StockShortfallState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STOCK_SHORTFALL_STORAGE_KEY, JSON.stringify(value));
}

export function clearStockShortfalls() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STOCK_SHORTFALL_STORAGE_KEY);
}

export function resolveStockShortfallPart(productId: number, partProductId: number) {
  const current = readStockShortfalls();
  if (!current) return;

  const shortfalls = current.shortfalls.flatMap((shortfall) => {
    if (shortfall.productId !== productId) return [shortfall];
    const parts = shortfall.parts.filter((part) => part.productId !== partProductId);
    return parts.length > 0 ? [{ ...shortfall, parts }] : [];
  });

  if (shortfalls.length === 0) clearStockShortfalls();
  else writeStockShortfalls({ ...current, shortfalls });
}
