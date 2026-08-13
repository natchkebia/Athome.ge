"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../result/page.module.scss";
import Step5Complete from "@/components/checkout/Step5Complete";
import type { CheckoutResponse } from "@/lib/api/checkout";
import type { FormValues } from "@/components/checkout/Step1Contact";
import type { ProfileCartItem } from "@/lib/api/profileCommerce";

type CheckoutSummary = {
  result: CheckoutResponse;
  items: ProfileCartItem[];
  contactData?: FormValues | null;
  orderType?: "store" | "delivery" | null;
};

export default function PaymentCancelPage() {
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("pendingCheckoutSummary");
    if (!stored) return;

    try {
      setSummary(JSON.parse(stored) as CheckoutSummary);
    } catch {
      sessionStorage.removeItem("pendingCheckoutSummary");
    }
  }, []);

  if (summary) {
    return (
      <main className={styles.resultPage}>
        <Step5Complete
          result={summary.result}
          items={summary.items}
          contactData={summary.contactData}
          orderType={summary.orderType}
          paymentState="failed"
        />
      </main>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.icon} ${styles.failed}`}>✕</div>
      <h1 className={styles.title}>გადახდა გაუქმდა</h1>
      <p className={styles.subtitle}>
        თქვენ შეწყვიტეთ გადახდა. შეკვეთა შენახულია — გადახდის გამეორება შეგიძლიათ
        შეკვეთების გვერდიდან.
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
