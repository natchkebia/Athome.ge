"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./OrdersTab.module.scss";
import {
  getProfileOrderDetail,
  retryOrderPayment,
  type OrderDetail as OrderDetailType,
} from "@/lib/api/orders";
import { orderStatusLabel } from "./orderStatus";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import AtHomeLoader from "../shared/AtHomeLoader";

type Props = {
  orderId: number;
  onBack: () => void;
};

function formatPrice(value: number, currency?: string | null) {
  return `${value.toLocaleString()} ${currency === "GEL" || !currency ? "₾" : currency}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// The cancellation deadline that drives the countdown. The retry-payment response
// returns `cancelScheduledAt`; the order detail may also expose it under a few
// possible names — read defensively so the countdown lights up once backend adds it.
function getCancelDeadline(detail: OrderDetailType): string | null {
  const raw = detail as unknown as Record<string, unknown>;
  const candidate =
    raw.cancelScheduledAt ?? raw.paymentDeadline ?? raw.cancelAt ?? null;
  return typeof candidate === "string" ? candidate : null;
}

function useCountdown(deadline: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return null;

  const target = new Date(deadline).getTime();
  if (Number.isNaN(target)) return null;

  const remaining = Math.max(0, Math.floor((target - now) / 1000));
  const hours = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  return { remaining, text: `${hours}:${minutes}:${seconds}` };
}

export default function OrderDetail({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getProfileOrderDetail(orderId)
      .then((res) => {
        if (active) setOrder(res);
      })
      .catch(() => {
        if (active) setError("შეკვეთის ჩატვირთვა ვერ მოხერხდა");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  const deadline = order ? getCancelDeadline(order) : null;
  const countdown = useCountdown(deadline);

  const showRetry = useMemo(() => {
    if (!order) return false;
    return order.status === "paymentFailed";
  }, [order]);

  const countdownExpired = countdown ? countdown.remaining <= 0 : false;

  async function handleRetry() {
    if (!order?.orderNumber) return;
    setRetrying(true);
    setRetryError(null);

    try {
      const res = await retryOrderPayment(order.orderNumber);
      if (res.paymentRedirectUrl) {
        window.location.href = res.paymentRedirectUrl;
        return;
      }
      setRetryError("გადახდის ბმული ვერ მივიღეთ. სცადეთ მოგვიანებით.");
    } catch (e) {
      setRetryError(
        e instanceof Error ? e.message : "გადახდის გამეორება ვერ მოხერხდა"
      );
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.detail}>
        <button className={styles.backBtn} onClick={onBack}>
          ‹ უკან
        </button>
        <AtHomeLoader variant="section" label="იტვირთება" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.detail}>
        <button className={styles.backBtn} onClick={onBack}>
          ‹ უკან
        </button>
        <p>{error ?? "შეკვეთა ვერ მოიძებნა"}</p>
      </div>
    );
  }

  const timelineEvents = [
    { label: "შეკვეთა განთავსდა", date: order.placedAt },
    { label: "დადასტურდა", date: order.confirmedAt },
    { label: "დასრულდა", date: order.completedAt },
    { label: "გაუქმდა", date: order.cancelledAt },
  ].filter((e) => Boolean(e.date));

  return (
    <div className={styles.detail}>
      <button className={styles.backBtn} onClick={onBack}>
        ‹ უკან
      </button>

      <div className={styles.detailHeader}>
        <h4>შეკვეთა {order.orderNumber}</h4>
        <span>{orderStatusLabel(order.status)}</span>
      </div>

      {showRetry && (
        <div className={styles.retryBox}>
          <p>გადახდა ვერ განხორციელდა. შეგიძლიათ გაიმეოროთ გადახდა.</p>
          {countdown && !countdownExpired && (
            <p>
              გაუქმდება: <span className={styles.countdown}>{countdown.text}</span>
            </p>
          )}
          {countdownExpired && <p>გადახდის ვადა ამოიწურა.</p>}
          {retryError && <p>{retryError}</p>}
          <button
            type="button"
            className={styles.retryBtn}
            onClick={handleRetry}
            disabled={retrying || countdownExpired}
          >
            {retrying ? "მუშავდება..." : "🔄 გადახდის გამეორება"}
          </button>
        </div>
      )}

      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <h5>პროდუქცია</h5>
          {order.items.map((item) => (
            <div className={styles.itemRow} key={item.productId}>
              <div className={styles.itemInfo}>
                <img
                  src={
                    normalizeMediaUrl(item.productImageUrl ?? undefined) ||
                    "/icons/product1.svg"
                  }
                  alt={item.productName ?? ""}
                />
                <div>
                  <strong>{item.productName}</strong>
                  <span>რაოდენობა: {item.quantity}</span>
                </div>
              </div>
              <strong>{formatPrice(item.lineTotal, order.currency)}</strong>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <h5>შეჯამება</h5>
          <div className={styles.totals}>
            <div>
              <span>ღირებულება</span>
              <span>{formatPrice(order.subtotalAmount, order.currency)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div>
                <span>ფასდაკლება</span>
                <span>-{formatPrice(order.discountAmount, order.currency)}</span>
              </div>
            )}
            <div>
              <span>მიწოდება</span>
              <span>{formatPrice(order.shippingAmount, order.currency)}</span>
            </div>
            <div className={styles.grand}>
              <span>ჯამი</span>
              <span>{formatPrice(order.totalAmount, order.currency)}</span>
            </div>
          </div>
        </div>

        {(order.shippingFullName || order.shippingCity) && (
          <div className={styles.card}>
            <h5>მიწოდების მისამართი</h5>
            <p>{order.shippingFullName}</p>
            <p>
              {[order.shippingCity, order.shippingLine1, order.shippingLine2]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.shippingPhone && <p>{order.shippingPhone}</p>}
          </div>
        )}

        {timelineEvents.length > 0 && (
          <div className={styles.card}>
            <h5>სტატუსის ისტორია</h5>
            <div className={styles.timeline}>
              {timelineEvents.map((event) => (
                <div className={styles.event} key={event.label}>
                  <strong>{event.label}</strong>
                  <span>{formatDateTime(event.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
