"use client";

import { useEffect, useState } from "react";
import styles from "./OrdersTab.module.scss";
import { getProfileOrders, type OrdersPagedResult } from "@/lib/api/orders";
import { orderStatusLabel, orderStatusTone } from "./orderStatus";
import OrderDetail from "./OrderDetail";
import AtHomeLoader from "../shared/AtHomeLoader";

const PAGE_SIZE = 10;

function formatPrice(value: number, currency?: string | null) {
  return `${value.toLocaleString()} ${currency === "GEL" || !currency ? "₾" : currency}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function OrdersTab() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrdersPagedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedOrderId !== null) return;

    let active = true;
    setLoading(true);
    setError(null);

    getProfileOrders(page, PAGE_SIZE)
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setError("შეკვეთების ჩატვირთვა ვერ მოხერხდა");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, selectedOrderId]);

  if (selectedOrderId !== null) {
    return (
      <OrderDetail
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    );
  }

  return (
    <div className={styles.ordersSection}>
      <h4>ჩემი შეკვეთები</h4>

      {loading && <AtHomeLoader variant="section" label="იტვირთება" />}

      {!loading && error && <p>{error}</p>}

      {!loading && !error && data && data.items.length === 0 && (
        <p>ჯერ არ გაქვთ შეკვეთები.</p>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>შეკვეთა</th>
                <th>თარიღი</th>
                <th>რაოდენობა</th>
                <th>თანხა</th>
                <th>სტატუსი</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order.id}>
                  <td>
                    <p className={styles.Colord}>{order.orderNumber}</p>
                  </td>
                  <td>
                    <p>{formatDate(order.placedAt)}</p>
                  </td>
                  <td>
                    <p>{order.itemCount}</p>
                  </td>
                  <td>
                    <p>{formatPrice(order.totalAmount, order.currency)}</p>
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[orderStatusTone(order.status)]
                      }`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.detailsLink}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      ნახვა
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={!data.hasPrev}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                ‹
              </button>
              <span className={styles.active}>
                {data.page} / {data.totalPages}
              </span>
              <button
                disabled={!data.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
