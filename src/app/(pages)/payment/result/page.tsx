"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import Step5Complete from "@/components/checkout/Step5Complete";
import type { CheckoutResponse } from "@/lib/api/checkout";
import type { FormValues } from "@/components/checkout/Step1Contact";
import type { ProfileCartItem } from "@/lib/api/profileCommerce";
import { useCommerce } from "@/contexts/CommerceContext";
import {
  getOrderPaymentStatus,
  retryOrderPayment,
  type OrderPaymentStatus,
} from "@/lib/api/orders";

type CheckoutSummary = {
  result: CheckoutResponse;
  items: ProfileCartItem[];
  contactData?: FormValues | null;
  orderType?: "store" | "delivery" | null;
};

type ViewState = "loading" | "missing" | "error" | "pendingTimeout" | "ready";
const POLL_INTERVAL_MS = 2_000;
const POLL_LIMIT_MS = 30_000;

function readSummary(): CheckoutSummary | null {
  const stored = sessionStorage.getItem("pendingCheckoutSummary");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CheckoutSummary;
  } catch {
    return null;
  }
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency === "GEL" ? "₾" : currency}`;
}

function Countdown({ until }: { until?: string | null }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!until) return;
    const update = () => {
      const seconds = Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000));
      const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      setRemaining(`${hours}:${minutes}:${secs}`);
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  return remaining ? <p className={styles.countdown}>ხელახლა ცდის დრო: {remaining}</p> : null;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewState>("loading");
  const [status, setStatus] = useState<OrderPaymentStatus | null>(null);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const stopped = useRef(false);
  const cartCleared = useRef(false);
  const { clearCart } = useCommerce();

  const load = useCallback(async () => {
    const storedSummary = readSummary();
    setSummary(storedSummary);
    const orderNumber =
      searchParams.get("orderNumber") ||
      searchParams.get("order_number") ||
      searchParams.get("order") ||
      sessionStorage.getItem("pendingOrderNumber") ||
      storedSummary?.result.orderNumber ||
      "";
    const email =
      sessionStorage.getItem("pendingOrderEmail") ||
      storedSummary?.contactData?.email ||
      undefined;
    if (!orderNumber) {
      setView("missing");
      return;
    }

    const startedAt = Date.now();
    while (!stopped.current) {
      try {
        const next = await getOrderPaymentStatus(orderNumber, email);
        if (stopped.current) return;
        setStatus(next);
        if (next.state !== "pending") {
          setView("ready");
          return;
        }
        setView("ready");
      } catch {
        if (stopped.current) return;
        setView("error");
        return;
      }

      if (Date.now() - startedAt >= POLL_LIMIT_MS) {
        setView("pendingTimeout");
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }, [searchParams]);

  useEffect(() => {
    stopped.current = false;
    void load();
    return () => { stopped.current = true; };
  }, [load]);

  useEffect(() => {
    if (status?.state !== "paid" || cartCleared.current) return;
    cartCleared.current = true;
    void clearCart().finally(() => {
      sessionStorage.removeItem("pendingOrderId");
      sessionStorage.removeItem("pendingOrderNumber");
      sessionStorage.removeItem("pendingOrderEmail");
    });
  }, [status?.state, clearCart]);

  const retry = async () => {
    if (!status?.canRetry) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const email = sessionStorage.getItem("pendingOrderEmail") || undefined;
      const result = await retryOrderPayment(status.orderNumber, email);
      if (!result.paymentRedirectUrl) throw new Error("გადახდის ბმული ვერ მოიძებნა");
      window.location.href = result.paymentRedirectUrl;
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "ხელახლა ცდა ვერ შესრულდა");
      setRetrying(false);
    }
  };

  if (view === "loading") return <StatusCard icon="spinner" title="ვადასტურებთ გადახდას…" text="გთხოვთ, დაელოდოთ. ეს რამდენიმე წამს გასტანს." />;
  if (view === "missing") return <StatusCard icon="warning" title="შეკვეთის ნომერი ვერ მოიძებნა" text="გთხოვთ, შეკვეთის სტატუსი შეამოწმოთ პროფილიდან ან დაგვიკავშირდეთ." />;
  if (view === "error") return <StatusCard icon="warning" title="სტატუსი ვერ ჩაიტვირთა" text="გთხოვთ, გადაამოწმოთ შეკვეთის ნომერი და ელფოსტა ან სცადოთ მოგვიანებით." />;
  if (view === "pendingTimeout") return <StatusCard icon="pending" title="გადახდის დადასტურება მიმდინარეობს" text="შეკვეთის სტატუსს მოგწერთ ელფოსტაზე. გადახდა შესაძლოა უკვე წარმატებით იყოს შესრულებული." />;
  if (!status) return null;

  if (status.state === "paid" && summary) {
    return <main className={styles.resultPage}><Step5Complete result={summary.result} items={summary.items} contactData={summary.contactData} orderType={summary.orderType} paymentState="success" /></main>;
  }

  if (status.state === "paid") return <StatusCard icon="success" title="გადახდა დადასტურდა!" text={`შეკვეთა ${status.orderNumber} · ${formatMoney(status.totalAmount, status.currency)}. დადასტურების წერილი გამოგზავნილია.`} />;
  if (status.state === "pending") return <StatusCard icon="spinner" title="ვადასტურებთ გადახდას…" text="ბანკის პასუხს ველოდებით. გთხოვთ, არ დახუროთ გვერდი." />;
  if (status.state === "cancelled") return <StatusCard icon="failed" title="შეკვეთა გაუქმებულია" text={`შეკვეთა ${status.orderNumber} გაუქმებულია. ხელახლა გადახდა ამ შეკვეთაზე შეუძლებელია.`} />;
  if (status.state === "awaitingBankTransfer") {
    const transfer = summary?.result.bankTransferDetails;
    return <StatusCard icon="pending" title="საბანკო გადარიცხვა" text={`დანიშნულებაში მიუთითეთ შეკვეთის ნომერი: ${status.orderNumber}${transfer?.iban ? ` · IBAN: ${transfer.iban}` : ""}`} />;
  }
  if (status.state === "installmentPending") {
    const merchant = status.installment?.awaitingMerchantConfirmation;
    return <StatusCard icon="pending" title={merchant ? "შეკვეთა ფორმდება" : "განვადების განაცხადი ბანკშია"} text={merchant ? "ბანკმა განაცხადი დაამტკიცა და მაღაზიის დადასტურებას ელოდება. დამატებითი მოქმედება არ გჭირდებათ." : "ბანკი განიხილავს განაცხადს. პასუხს დამატებით შეგატყობინებთ."} />;
  }

  return (
    <StatusCard icon="failed" title="გადახდა ვერ შესრულდა" text={`შეკვეთა ${status.orderNumber} · ${formatMoney(status.totalAmount, status.currency)}`}>
      {status.canRetry && <>
        <Countdown until={status.cancelScheduledAt} />
        <button className={styles.primaryBtn} onClick={retry} disabled={retrying}>{retrying ? "იტვირთება…" : "ხელახლა ცდა"}</button>
      </>}
      {retryError && <p className={styles.errorText}>{retryError}</p>}
    </StatusCard>
  );
}

function StatusCard({ icon, title, text, children }: { icon: "success" | "failed" | "warning" | "pending" | "spinner"; title: string; text: string; children?: React.ReactNode }) {
  return <div className={styles.wrapper}>
    {icon === "spinner" ? <div className={styles.spinner} /> : <div className={`${styles.icon} ${styles[icon]}`}>{icon === "success" ? "✓" : icon === "failed" ? "✕" : icon === "warning" ? "!" : "⌛"}</div>}
    <h1 className={styles.title}>{title}</h1>
    <p className={styles.subtitle}>{text}</p>
    {children}
    <div className={styles.actions}><Link href="/profile?tab=orders" className={styles.primaryBtn}>ჩემი შეკვეთები</Link><Link href="/" className={styles.secondaryBtn}>მთავარი გვერდი</Link></div>
  </div>;
}

export default function PaymentResultPage() {
  return <Suspense fallback={<div className={styles.wrapper}><div className={styles.spinner} /></div>}><PaymentStatusContent /></Suspense>;
}
