"use client";

import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import styles from "./page.module.scss";
import CartSummary from "@/components/profile/CartSummary";
import { useCallback, useState } from "react";

export default function Delivery() {
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
  );
}
