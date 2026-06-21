import type { OrderStatus } from "@/lib/api/orders";

// Georgian labels for every backend order status.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "მუშავდება",
  awaitingPayment: "გადახდის მოლოდინში",
  paymentFailed: "გადახდა ვერ შესრულდა",
  confirmed: "დადასტურებული",
  processing: "მუშავდება",
  partiallyShipped: "ნაწილობრივ გაგზავნილი",
  shipped: "გაგზავნილი",
  outForDelivery: "მიტანის პროცესში",
  delivered: "მიწოდებული",
  completed: "დასრულებული",
  cancellationRequested: "გაუქმების მოთხოვნა",
  cancelled: "გაუქმებული",
  returnRequested: "დაბრუნების მოთხოვნა",
  returnApproved: "დაბრუნება დადასტურდა",
  returnReceived: "დაბრუნება მიღებულია",
  refundRequested: "თანხის დაბრუნების მოთხოვნა",
  partiallyRefunded: "ნაწილობრივ დაბრუნებული",
  refunded: "თანხა დაბრუნდა",
};

export type StatusTone = "done" | "pending" | "canceled";

// Maps a status into one of the three visual tones defined in OrdersTab.module.scss.
export function orderStatusTone(status: OrderStatus): StatusTone {
  switch (status) {
    case "delivered":
    case "completed":
    case "confirmed":
    case "refunded":
    case "returnReceived":
    case "returnApproved":
      return "done";
    case "paymentFailed":
    case "cancelled":
    case "cancellationRequested":
      return "canceled";
    default:
      return "pending";
  }
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}
