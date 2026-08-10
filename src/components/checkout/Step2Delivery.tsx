"use client";

import React, { useEffect, useState } from "react";
import styles from "./Step2Delivery.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import {
  getPickupBranches,
  getShippingMethods,
  type PickupBranch,
  type ShippingMethod,
} from "@/lib/api/checkout";

interface Step2DeliveryProps {
  onNext?: () => void;
  onPrev?: () => void;
  onOptionChange?: (value: "store" | "delivery") => void;
  onPickupBranchChange?: (code: string | null) => void;
  onShippingMethodChange?: (id: number | null) => void;
}

export default function Step2Delivery({
  onNext,
  onPrev,
  onOptionChange,
  onPickupBranchChange,
  onShippingMethodChange,
}: Step2DeliveryProps) {
  const en = useStorefrontLocale() === "en";
  const [selectedOption, setSelectedOption] = useState<"store" | "delivery">(
    "store"
  );
  const [branches, setBranches] = useState<PickupBranch[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const pickupMethod = shippingMethods.find((method) => method.isPickup);
  const courierMethod = shippingMethods.find((method) => !method.isPickup);

  useEffect(() => {
    onOptionChange?.("store");
    getPickupBranches()
      .then(setBranches)
      .catch((error) =>
        setBranchesError(
          error instanceof Error
            ? error.message
            : "ფილიალების ჩატვირთვა ვერ მოხერხდა",
        ),
      );
    getShippingMethods()
      .then(setShippingMethods)
      .catch(() => setShippingMethods([]));
  }, [onOptionChange]);

  useEffect(() => {
    onShippingMethodChange?.(
      selectedOption === "delivery" ? courierMethod?.id ?? null : null,
    );
  }, [courierMethod?.id, onShippingMethodChange, selectedOption]);

  const select = (value: "store" | "delivery") => {
    setSelectedOption(value);
    onOptionChange?.(value);
    if (value === "delivery") onPickupBranchChange?.(null);
    if (value === "store") onPickupBranchChange?.(selectedBranch);
  };

  const selectBranch = (code: string) => {
    setSelectedBranch(code);
    onPickupBranchChange?.(code);
  };

  return (
    <div className={styles.container}>
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
        <h2 className={styles.title}>{en ? "Delivery details" : "მიწოდების დეტალები"}</h2>
      </div>

      <div className={styles.options}>
        <div
          className={`${styles.option} ${
            selectedOption === "store" ? styles.active : ""
          }`}
          onClick={() => select("store")}
        >
          <img src="/icons/gift.svg" alt="gift" className={styles.icon} />
          <p className={styles.optionLabel}>{pickupMethod?.name || (en ? "Store pickup" : "მაღაზიაში აღება")}</p>
        </div>

        <div
          className={`${styles.option} ${
            selectedOption === "delivery" ? styles.active : ""
          }`}
          onClick={() => select("delivery")}
        >
          <img src="/icons/scooter.svg" alt="scooter" className={styles.icon} />
          <p className={styles.optionLabel}>{courierMethod?.name || (en ? "Delivery" : "ადგილზე მიტანა")}</p>
        </div>
      </div>

      <div className={styles.textBlock}>
        {selectedOption === "store" && (
          <>
            {pickupMethod?.description && (
              <p className={styles.methodDescription}>{pickupMethod.description}</p>
            )}
            <p>{en ? "Choose a pickup branch:" : "აირჩიეთ ფილიალი:"}</p>
            {branchesError ? (
              <p className={styles.error}>{branchesError}</p>
            ) : (
              <div className={styles.branches}>
                {branches.map((branch) => (
                  <label
                    key={branch.code}
                    className={`${styles.branch} ${
                      selectedBranch === branch.code ? styles.branchSelected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickupBranch"
                      value={branch.code}
                      checked={selectedBranch === branch.code}
                      onChange={() => selectBranch(branch.code)}
                    />
                    <span>
                      <strong>{branch.name}</strong>
                      <small>{branch.address}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className={styles.pickupNotice}>{en ? "We will notify you by SMS when your order is ready for pickup." : "შეკვეთის მზადყოფნის შესახებ შეგატყობინებთ SMS-ით."}</p>
          </>
        )}

        {selectedOption === "delivery" && (
          <p>{courierMethod?.description || (en ? "Enter the delivery address in the next step." : "შემდეგ ეტაპზე მიუთითეთ მიწოდების მისამართი.")}</p>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.button}
          onClick={onNext}
          disabled={
            selectedOption === "store" &&
            !selectedBranch
          }
        >
          {en ? "Continue" : "გაგრძელება"}
        </button>
      </div>
    </div>
  );
}
