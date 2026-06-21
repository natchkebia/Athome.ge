"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import { pollBogPayment } from "@/lib/api/checkout";

type ResultState = "checking" | "success" | "failed" | "timeout";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 15;

const FAILED_STATUSES = ["rejected", "timeout", "expired", "failed", "declined"];

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResultState>("checking");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedOrderId = sessionStorage.getItem("pendingOrderId");
    const storedOrderNumber = sessionStorage.getItem("pendingOrderNumber");
    if (storedOrderNumber) setOrderNumber(storedOrderNumber);

    const orderId = storedOrderId ? Number(storedOrderId) : NaN;

    if (!orderId || Number.isNaN(orderId)) {
      setState("timeout");
      return;
    }

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (stoppedRef.current) return;
      attempts += 1;

      try {
        const res = await pollBogPayment(orderId);
        const status = String(res.bogStatus ?? res.status ?? "").toLowerCase();

        if (status === "completed" || status === "success") {
          setState("success");
          return;
        }

        if (FAILED_STATUSES.includes(status)) {
          setState("failed");
          return;
        }
      } catch {
        // network hiccup — keep trying until attempts run out
      }

      if (attempts >= MAX_ATTEMPTS) {
        setState("timeout");
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      stoppedRef.current = true;
      clearTimeout(timer);
    };
  }, [searchParams]);

  if (state === "checking") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.spinner} />
        <h1 className={styles.title}>გადახდის სტატუსი მოწმდება...</h1>
        <p className={styles.subtitle}>გთხოვთ, დაელოდოთ. ეს რამდენიმე წამს გასტანს.</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className={styles.wrapper}>
        <div className={`${styles.icon} ${styles.success}`}>✓</div>
        <h1 className={styles.title}>გადახდა დადასტურდა!</h1>
        {orderNumber && (
          <p className={styles.subtitle}>
            შეკვეთის ნომერი: <span className={styles.orderNumber}>{orderNumber}</span>
          </p>
        )}
        <div className={styles.actions}>
          <Link href="/profile?tab=orders" className={styles.primaryBtn}>
            ჩემი შეკვეთები
          </Link>
          <Link href="/" className={styles.secondaryBtn}>
            მთავარი გვერდი
          </Link>
        </div>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className={styles.wrapper}>
        <div className={`${styles.icon} ${styles.failed}`}>✕</div>
        <h1 className={styles.title}>გადახდა ვერ განხორციელდა</h1>
        <p className={styles.subtitle}>
          გადახდა არ დასრულდა. შეგიძლიათ სცადოთ ხელახლა შეკვეთების გვერდიდან.
        </p>
        <div className={styles.actions}>
          <Link href="/profile?tab=orders" className={styles.primaryBtn}>
            ჩემი შეკვეთები
          </Link>
          <Link href="/" className={styles.secondaryBtn}>
            მთავარი გვერდი
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.icon} ${styles.timeout}`}>!</div>
      <h1 className={styles.title}>სტატუსი ვერ განისაზღვრა</h1>
      <p className={styles.subtitle}>
        გადახდის სტატუსი დროულად ვერ დადასტურდა. შეამოწმეთ შეკვეთის სტატუსი მოგვიანებით.
      </p>
      <div className={styles.actions}>
        <Link href="/profile?tab=orders" className={styles.primaryBtn}>
          ჩემი შეკვეთები
        </Link>
        <Link href="/" className={styles.secondaryBtn}>
          მთავარი გვერდი
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.wrapper}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
