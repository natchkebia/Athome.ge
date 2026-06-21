import { apiRequest } from "./client";
import { authorizedRequest } from "./authorized";

// ---- Types (Swagger: /api/profile/orders, /api/storefront/orders/*) ----

export type OrderStatus =
  | "pending"
  | "awaitingPayment"
  | "paymentFailed"
  | "confirmed"
  | "processing"
  | "partiallyShipped"
  | "shipped"
  | "outForDelivery"
  | "delivered"
  | "completed"
  | "cancellationRequested"
  | "cancelled"
  | "returnRequested"
  | "returnApproved"
  | "returnReceived"
  | "refundRequested"
  | "partiallyRefunded"
  | "refunded";

export type DeliveryStatus =
  | "notDispatched"
  | "readyToShip"
  | "dispatched"
  | "inTransit"
  | "outForDelivery"
  | "delivered"
  | "deliveryAttemptFailed"
  | "returnedToSender"
  | "lost";

export type OrderListItem = {
  id: number;
  orderNumber?: string | null;
  totalAmount: number;
  currency?: string | null;
  itemCount: number;
  status: OrderStatus;
  placedAt: string;
  shippingCity?: string | null;
  shippingCountry?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

export type OrdersPagedResult = {
  items: OrderListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type OrderItem = {
  productId: number;
  productName?: string | null;
  productSku?: string | null;
  productImageUrl?: string | null;
  brandName?: string | null;
  unitPrice: number;
  lineTotal: number;
  quantity: number;
};

export type OrderShipment = {
  deliveryStatus: DeliveryStatus;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrierName?: string | null;
  estimatedDeliveryDate?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

export type OrderDetail = {
  id: number;
  orderNumber?: string | null;
  status: OrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency?: string | null;
  shippingFullName?: string | null;
  shippingLine1?: string | null;
  shippingLine2?: string | null;
  shippingCity?: string | null;
  shippingRegion?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingPhone?: string | null;
  placedAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  customerNote?: string | null;
  items: OrderItem[];
  shipments: OrderShipment[];
};

export type GuestOrderTracking = {
  orderNumber?: string | null;
  status?: string | null;
  totalAmount: number;
  currency?: string | null;
  placedAt: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrierName?: string | null;
  estimatedDelivery?: string | null;
};

export type RetryPaymentResponse = {
  orderNumber?: string | null;
  paymentRedirectUrl?: string | null;
  cancelScheduledAt?: string | null;
};

// ---- Functions ----

export function getProfileOrders(page = 1, pageSize = 10) {
  return authorizedRequest<OrdersPagedResult>("/api/profile/orders", {
    query: { Page: page, PageSize: pageSize },
  });
}

export function getProfileOrderDetail(orderId: number | string) {
  return authorizedRequest<OrderDetail>(
    `/api/profile/orders/${encodeURIComponent(orderId)}`
  );
}

export function trackGuestOrder(orderNumber: string, email: string) {
  return apiRequest<GuestOrderTracking>("/api/storefront/orders/track", {
    query: { orderNumber, email },
    useProxy: true,
  });
}

export function retryOrderPayment(orderNumber: string, email?: string) {
  return apiRequest<RetryPaymentResponse>(
    `/api/storefront/orders/${encodeURIComponent(orderNumber)}/retry-payment`,
    {
      method: "POST",
      body: JSON.stringify({ email: email ?? null }),
      useProxy: true,
    }
  );
}
