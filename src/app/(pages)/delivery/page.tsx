"use client";

import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import styles from "./page.module.scss";
import CartSummary from "@/components/profile/CartSummary";
import { useState } from "react";

export default function Delivery() {
  const [checkoutStep, setCheckoutStep] = useState(1);
  const isComplete = checkoutStep === 5;

  return (
    <div className={`${styles.wrapper} ${isComplete ? styles.complete : ""}`}>
      <div className={styles.container}>
        <CheckoutWizard onStepChange={setCheckoutStep} />
      </div>
      {!isComplete && (
        <div className={styles.cartSummary}>
          <CartSummary />
        </div>
      )}
    </div>
  );
}
