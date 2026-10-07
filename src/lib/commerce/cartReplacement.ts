export const CART_REPLACEMENT_STORAGE_KEY = "athome.cartReplacement";

export type CartReplacement = {
  productId: number;
  productName: string;
};

export function readCartReplacement(): CartReplacement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CART_REPLACEMENT_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<CartReplacement>;
    if (!Number.isFinite(value.productId) || typeof value.productName !== "string") return null;
    return { productId: Number(value.productId), productName: value.productName };
  } catch {
    return null;
  }
}

export function writeCartReplacement(value: CartReplacement) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CART_REPLACEMENT_STORAGE_KEY, JSON.stringify(value));
}

export function clearCartReplacement() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CART_REPLACEMENT_STORAGE_KEY);
}
