import { apiRequest } from "./client";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

// ---- Types (Swagger: /api/storefront/checkout, /api/storefront/shipping-methods, /api/payments/*) ----

export type CustomerType = "physical" | "legal";
export type DeliveryType = "Pickup" | "Courier";
export type PaymentMethod = "card" | "installment" | "splitPayment" | "bankTransfer";
export type SelectedBank = "bog" | "tbc" | "credo";

export type CheckoutGuestItem = {
  productId: number;
  quantity: number;
  swaps?: { componentProductId: number }[];
};

export type CheckoutPayload = {
  customerType: CustomerType;
  fullName: string;
  email: string;
  phone: string;
  additionalPhone?: string | null;
  personalId?: string | null;
  deliveryType: DeliveryType;
  expressDelivery?: boolean;
  pickupBranchCode?: string | null;
  shippingMethodId?: number | null;
  shippingFullName?: string | null;
  shippingLine1?: string | null;
  shippingLine2?: string | null;
  shippingCity?: string | null;
  shippingRegion?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingPhone?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  savedAddressId?: number | null;
  paymentMethod: PaymentMethod;
  selectedBank: SelectedBank;
  installmentMonths?: number | null;
  couponCode?: string | null;
  customerNote?: string | null;
  termsAccepted: boolean;
  guestItems?: CheckoutGuestItem[];
};

export type PickupBranch = {
  code: string;
  name: string;
  address: string;
};

export type BankTransferDetails = {
  bank?: string | null;
  accountName?: string | null;
  iban?: string | null;
  instructions?: string | null;
};

export type CheckoutResponse = {
  orderId: number;
  orderNumber?: string | null;
  totalAmount: number;
  currency?: string | null;
  paymentRedirectUrl?: string | null;
  bankTransferDetails?: BankTransferDetails | null;
  paymentMethod: PaymentMethod;
  selectedBank: SelectedBank;
  shippingAmount?: number;
  shippingTierCode?: string | null;
  shippingZoneName?: string | null;
};

export type ShippingMethod = {
  id: number;
  name?: string | null;
  carrierName?: string | null;
  description?: string | null;
  baseRate: number;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  isPickup: boolean;
};

export type ShippingQuoteItem = {
  productId: number;
  quantity: number;
};

export type ShippingQuotePayload = {
  items: ShippingQuoteItem[];
  city?: string | null;
  region?: string | null;
};

export type ShippingQuote = {
  amount: number;
  tierCode?: string | null;
  tierName?: string | null;
  tierPrice: number;
  zoneName?: string | null;
  zoneSurcharge: number;
  zoneMatched: boolean;
  requiresManualPricing: boolean;
  productsWithoutTier: number[];
  expressAvailable: boolean;
  expressAmount?: number;
  expressClosesAtUtc?: string;
  expressUnavailableReason?:
    | "after_cutoff"
    | "non_working_day"
    | "zone_not_eligible"
    | "not_available_same_day"
    | "disabled"
    | string;
};

export type PaymentInitiateResponse = {
  paymentId: number;
  sessionId?: string | null;
  redirectUrl?: string | null;
  amount: number;
  currency?: string | null;
  gateway?: string | null;
};

// poll response is untyped in Swagger; spec doc uses `bogStatus`.
export type PaymentPollResponse = {
  bogStatus?: string;
  status?: string;
  [key: string]: unknown;
};

// ---- Functions ----

export function getShippingMethods() {
  return apiRequest<ShippingMethod[]>("/api/storefront/shipping-methods", {
    useProxy: true,
  });
}

export function getPickupBranches() {
  return apiRequest<PickupBranch[]>("/api/storefront/pickup-branches", {
    useProxy: true,
  });
}

export function getShippingQuote(payload: ShippingQuotePayload) {
  return apiRequest<ShippingQuote>("/api/storefront/shipping-quote", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: true,
  });
}

export function submitCheckout(payload: CheckoutPayload) {
  // token optional — backend accepts both guest and authenticated checkout.
  const tokens = getStoredAuthTokens();
  return apiRequest<CheckoutResponse>("/api/storefront/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
    token: tokens?.accessToken ?? null,
    useProxy: true,
  });
}
