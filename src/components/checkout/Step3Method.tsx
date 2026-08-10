"use client";
import React, { useState } from "react";
import styles from "./Step3Method.module.scss";

import AddressSelector from "./components/AddressSelector";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

type DeliveryAddress = {
  id?: string | number;
  savedAddressId?: number;
  city: string;
  line1: string;
  line2?: string;
  coords?: { lat: number; lng: number };
};

type Step3DeliveryProps = {
  onNext?: (data: { method: string; address: DeliveryAddress }) => void;
  onPrev?: () => void;
  customerName?: string;
  customerPhone?: string;
};

export default function Step3Delivery({ onNext, onPrev, customerName, customerPhone }: Step3DeliveryProps) {
  const en = useStorefrontLocale() === "en";
  const [address, setAddress] = useState<DeliveryAddress | null>(null);

  function handleNext() {
    if (!address) return;

    onNext?.({
      method: "courier",
      address,
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {onPrev && (
          <img
            src="/icons/passwordArrow.svg"
            alt="Arrow"
            className={styles.backArrow}
            onClick={onPrev}
            style={{ cursor: "pointer" }}
          />
        )}
        <h2 className={styles.title}>{en ? "Delivery address" : "მიწოდების მისამართი"}</h2>
      </div>

      <div className={styles.dropdowns}>
        <AddressSelector
          customerName={customerName}
          customerPhone={customerPhone}
          onSelect={setAddress}
        />
      </div>

      <button
        className={styles.btn}
        disabled={!address}
        onClick={handleNext}
      >
        {en ? "Continue" : "გაგრძელება"}
      </button>
    </div>
  );
}
