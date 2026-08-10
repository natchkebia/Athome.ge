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
  onNext?: (data: { method: string; address: DeliveryAddress; expressDelivery: boolean }) => void;
  onPrev?: () => void;
  customerName?: string;
  customerPhone?: string;
  onDeliveryAmountChange?: (amount: number | null) => void;
};

export default function Step3Delivery({ onNext, onPrev, customerName, customerPhone, onDeliveryAmountChange }: Step3DeliveryProps) {
  const en = useStorefrontLocale() === "en";
  const { cart } = useCommerce();
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [quoteCity, setQuoteCity] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [expressSelected, setExpressSelected] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [quoteRefresh, setQuoteRefresh] = useState(0);
  const quoteItems = useMemo(
    () => cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [cart.items],
  );
  const itemsSubtotal = useMemo(
    () => cart.items.reduce(
      (total, item) => total + item.sellingPrice * item.quantity,
      0,
    ),
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
        if (active) {
          setQuote(result);
          if (!result.expressAvailable) setExpressSelected(false);
        }
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
  }, [address?.region, quoteCity, quoteItems, quoteRefresh]);

  useEffect(() => {
    if (!quote?.expressAvailable || !quote.expressClosesAtUtc) {
      setRemainingSeconds(null);
      return;
    }

    let refreshed = false;
    const updateCountdown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((new Date(quote.expressClosesAtUtc as string).getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);
      if (seconds === 0 && !refreshed) {
        refreshed = true;
        window.clearInterval(interval);
        setQuoteRefresh((current) => current + 1);
      }
    };
    const interval = window.setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => window.clearInterval(interval);
  }, [quote?.expressAvailable, quote?.expressClosesAtUtc]);

  function handleNext() {
    if (!address) return;

    onNext?.({
      method: "courier",
      address,
      expressDelivery: expressSelected,
    });
  }

  const deliveryAmount = expressSelected && quote?.expressAmount != null
    ? quote.expressAmount
    : quote?.amount;
  const expressReason = quote?.expressUnavailableReason;
  const expressReasonText = expressReason === "after_cutoff"
    ? (en ? "Finished for today — try again tomorrow." : "დღეისთვის დასრულდა — სცადეთ ხვალ.")
    : expressReason === "non_working_day"
      ? (en ? "Available on business days only." : "ხელმისაწვდომია მხოლოდ სამუშაო დღეებში.")
      : expressReason === "zone_not_eligible"
        ? (en ? "Express delivery is available only in Tbilisi." : "სწრაფი მიწოდება მხოლოდ თბილისშია ხელმისაწვდომი.")
        : expressReason === "not_available_same_day"
          ? (en ? "An item in your cart cannot arrive the same day." : "კალათაში არსებული ნივთის იმავე დღეს მოწოდება ვერ ხერხდება.")
          : null;
  const countdown = remainingSeconds == null
    ? null
    : `${Math.floor(remainingSeconds / 3600)}:${String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    onDeliveryAmountChange?.(deliveryAmount ?? null);
  }, [deliveryAmount, onDeliveryAmountChange]);

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

      {!quoteCity && (
        <div className={styles.quoteCard}>
          <div>
            <span>{en ? "Items" : "ნივთები"}</span>
            <strong>{itemsSubtotal.toFixed(2)} ₾</strong>
          </div>
          <div>
            <span>{en ? "Delivery" : "მიწოდება"}</span>
            <strong className={styles.addressBased}>{en ? "Based on address" : "მისამართის მიხედვით"}</strong>
          </div>
        </div>
      )}

      {quoteLoading && (
        <p className={styles.quoteStatus}>{en ? "Calculating delivery fee…" : "მიწოდების საფასური ითვლება…"}</p>
      )}

      {quote && !quoteLoading && (
        <>
          {(quote.expressAvailable || (expressReason && expressReason !== "disabled")) && (
            <button
              type="button"
              className={`${styles.expressOption} ${expressSelected ? styles.expressSelected : ""}`}
              disabled={!quote.expressAvailable}
              onClick={() => setExpressSelected((current) => !current)}
            >
              <span>
                <strong>{en ? "Express delivery" : "სწრაფი მიწოდება"}</strong>
                <small>
                  {quote.expressAvailable
                    ? `${quote.expressAmount?.toFixed(2) ?? "—"} ₾${countdown ? ` · ${en ? "closes in" : "დარჩა"} ${countdown}` : ""}`
                    : expressReasonText}
                </small>
              </span>
              {quote.expressAvailable && <i aria-hidden="true">{expressSelected ? "✓" : ""}</i>}
            </button>
          )}

          <div className={styles.quoteCard} aria-live="polite">
            <div>
              <span>{en ? "Items" : "ნივთები"}</span>
              <strong>{itemsSubtotal.toFixed(2)} ₾</strong>
            </div>
            <div>
              <span>{en ? "Delivery fee" : "მიწოდების საფასური"}</span>
              <strong>{deliveryAmount?.toFixed(2)} ₾</strong>
            </div>
            {(quote.tierName || quote.zoneName || expressSelected) && (
              <small className={styles.quoteHint}>
                {[expressSelected ? (en ? "Express delivery" : "სწრაფი მიწოდება") : quote.tierName, quote.zoneName]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
            )}
          <div className={styles.quoteTotal}>
              <span>{en ? "Total" : "ჯამი"}</span>
              <strong>{(itemsSubtotal + (deliveryAmount ?? 0)).toFixed(2)} ₾</strong>
            </div>
          </div>
        </>
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
