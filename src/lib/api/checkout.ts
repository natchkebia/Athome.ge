import { apiRequest } from "./client";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

// ---- Types (Swagger: /api/storefront/checkout, /api/storefront/shipping-methods, /api/payments/*) ----

export type CustomerType = "physical" | "legal";
export type DeliveryType = "Pickup" | "Courier";
export type PaymentMethod = "card" | "installment" | "bankTransfer";
export type SelectedBank = "bog" | "tbc" | "credo";

export type CheckoutGuestItem = {
  productId: number;
  quantity: number;
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

// Fallback / retry helpers — happy path uses checkout response's paymentRedirectUrl.
export function initiateBogPayment(orderId: number, currency = "GEL") {
  return apiRequest<PaymentInitiateResponse>(
    `/api/payments/bog/initiate/${encodeURIComponent(orderId)}`,
    {
      method: "POST",
      body: JSON.stringify({ currency }),
      useProxy: true,
    }
  );
}

export function initiateTbcPayment(
  orderId: number,
  { installments = false, currency = "GEL" }: { installments?: boolean; currency?: string } = {}
) {
  return apiRequest<PaymentInitiateResponse>(
    `/api/payments/tbc/initiate/${encodeURIComponent(orderId)}`,
    {
      method: "POST",
      body: JSON.stringify({ currency }),
      query: { installments },
      useProxy: true,
    }
  );
}

// Flitt (TBC-ის ახალი პროცესინგი) — POST /api/payments/flitt/initiate/{orderId}
// body: { currency, email }. პასუხში redirectUrl-ზე ვამისამართებთ მომხმარებელს.
export function initiateFlittPayment(
  orderId: number,
  { currency = "GEL", email }: { currency?: string; email: string }
) {
  return apiRequest<PaymentInitiateResponse>(
    `/api/payments/flitt/initiate/${encodeURIComponent(orderId)}`,
    {
      method: "POST",
      body: JSON.stringify({ currency, email }),
      useProxy: true,
    }
  );
}

export function pollBogPayment(orderId: number) {
  return apiRequest<PaymentPollResponse>(
    `/api/payments/bog/poll/${encodeURIComponent(orderId)}`,
    {
      method: "POST",
      useProxy: true,
    }
  );
}
