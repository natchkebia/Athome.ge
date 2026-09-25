import { getStoredAuthTokens } from "@/lib/auth/tokens";
import { apiRequest } from "./client";

export type CartQuoteRequest = {
  items?: { productId: number; quantity: number; swaps?: { componentProductId: number }[] }[];
  couponCode?: string;
  email?: string;
  deliveryType?: "courier" | "pickup";
  shippingMethodId?: number;
  city?: string;
  region?: string;
  expressDelivery?: boolean;
};

export type CartQuoteLine = {
  productId: number;
  quantity: number;
  listUnitPrice: number;
  unitPrice: number;
  lineTotal: number;
  saleLabel?: string | null;
};

export type CartQuote = {
  lines: CartQuoteLine[];
  listSubtotal: number;
  saleDiscount: number;
  subtotal: number;
  orderDiscount: number;
  couponDiscount: number;
  shippingBeforeDiscount: number;
  shipping: number;
  freeShipping: boolean;
  shippingQuoted: boolean;
  total: number;
  totalSavings: number;
  coupon?: { code: string; applied: boolean; message?: string | null } | null;
  appliedPromotions: {
    promotionId: number;
    name: string;
    type: string;
    amount: number;
    couponCode?: string | null;
    freeShipping?: boolean;
  }[];
};

export function getCartQuote(payload: CartQuoteRequest) {
  const token = getStoredAuthTokens()?.accessToken;
  return apiRequest<CartQuote>("/api/storefront/cart/quote", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
    useProxy: true,
  });
}
