"use client";

import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import styles from "./page.module.scss";
import CartSummary from "@/components/profile/CartSummary";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import { useCallback, useState } from "react";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function Delivery() {
  const en = useStorefrontLocale() === "en";
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliverySummary, setDeliverySummary] = useState<{
    mode: "unknown" | "pickup" | "courier";
    amount: number | null;
  }>({ mode: "unknown", amount: null });
  const isComplete = checkoutStep === 5;
  const handleDeliverySummaryChange = useCallback(
    (summary: typeof deliverySummary) => setDeliverySummary(summary),
    [],
  );

  return (
    <>
      <div className={styles.breadcrumb}>
        <Breadcrumb
          items={[
            { label: en ? "Home" : "მთავარი გვერდი", href: "/" },
            { label: en ? "Checkout" : "მიწოდების დეტალები" },
          ]}
        />
      </div>
      <div className={`${styles.wrapper} ${isComplete ? styles.complete : ""}`}>
        <div className={styles.container}>
          <CheckoutWizard
            onStepChange={setCheckoutStep}
            onDeliverySummaryChange={handleDeliverySummaryChange}
          />
        </div>
        {!isComplete && (
          <div className={styles.cartSummary}>
            <CartSummary
              deliveryMode={deliverySummary.mode}
              deliveryAmount={deliverySummary.amount}
            />
          </div>
        )}
      </div>
    </>
  );
}
