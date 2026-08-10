"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./Step3Method.module.scss";

import AddressSelector from "./components/AddressSelector";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { useCommerce } from "@/contexts/CommerceContext";
import { getShippingQuote, type ShippingQuote } from "@/lib/api/checkout";

type DeliveryAddress = {
  id?: string | number;
  savedAddressId?: number;
  city: string;
  line1: string;
  region?: string;
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
  const { cart } = useCommerce();
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [quoteCity, setQuoteCity] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const quoteItems = useMemo(
    () => cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [cart.items],
  );

  useEffect(() => {
    if (!quoteCity) {
      setQuote(null);
      return;
    }

    let active = true;
    setQuoteLoading(true);
    setQuoteError(false);
    getShippingQuote({ items: quoteItems, city: quoteCity, region: address?.region })
      .then((result) => {
        if (active) setQuote(result);
      })
      .catch(() => {
        if (active) {
          setQuote(null);
          setQuoteError(true);
        }
      })
      .finally(() => {
        if (active) setQuoteLoading(false);
      });

    return () => { active = false; };
  }, [address?.region, quoteCity, quoteItems]);

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
          onCityChange={setQuoteCity}
        />
      </div>

      {quoteLoading && (
        <p className={styles.quoteStatus}>{en ? "Calculating delivery fee…" : "მიწოდების საფასური ითვლება…"}</p>
      )}

      {quote && !quoteLoading && (
        <div className={styles.quoteCard} aria-live="polite">
          <div>
            <span>
              {en ? "Delivery" : "მიწოდება"}
              {quote.tierName ? ` — ${quote.tierName}` : ""}
            </span>
            <strong>{quote.tierPrice.toFixed(2)} ₾</strong>
          </div>
          {quote.zoneName && (
            <div>
              <span>{quote.zoneName}</span>
              <strong>{quote.zoneSurcharge.toFixed(2)} ₾</strong>
            </div>
          )}
          <div className={styles.quoteTotal}>
            <span>{en ? "Delivery total" : "მიწოდების ჯამი"}</span>
            <strong>{quote.amount.toFixed(2)} ₾</strong>
          </div>
        </div>
      )}

      {quoteError && (
        <p className={styles.quoteError}>{en ? "The delivery estimate is temporarily unavailable. You can still continue." : "მიწოდების წინასწარი ფასი დროებით ვერ დაითვალა. შეკვეთის გაგრძელება მაინც შეგიძლიათ."}</p>
      )}

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
