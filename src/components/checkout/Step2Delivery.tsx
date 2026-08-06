"use client";

import React, { useEffect, useState } from "react";
import styles from "./Step2Delivery.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import {
  getPickupBranches,
  type PickupBranch,
} from "@/lib/api/checkout";

interface Step2DeliveryProps {
  onNext?: () => void;
  onPrev?: () => void;
  onOptionChange?: (value: "store" | "delivery") => void;
  onPickupBranchChange?: (code: string | null) => void;
  stockLocationCodes?: string[] | null;
}

const DEFAULT_BRANCH_PRIORITY = ["saburtalo", "tsereteli", "warehouse", "online"];

export default function Step2Delivery({
  onNext,
  onPrev,
  onOptionChange,
  onPickupBranchChange,
  stockLocationCodes,
}: Step2DeliveryProps) {
  const en = useStorefrontLocale() === "en";
  const [selectedOption, setSelectedOption] = useState<"store" | "delivery">(
    "store"
  );
  const [branches, setBranches] = useState<PickupBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const visibleBranches = branches
    .filter((branch) => stockLocationCodes?.includes(branch.code))
    .sort((left, right) => {
      const leftPriority = DEFAULT_BRANCH_PRIORITY.indexOf(left.code);
      const rightPriority = DEFAULT_BRANCH_PRIORITY.indexOf(right.code);
      return (leftPriority < 0 ? Number.MAX_SAFE_INTEGER : leftPriority) -
        (rightPriority < 0 ? Number.MAX_SAFE_INTEGER : rightPriority);
    });

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
  }, [onOptionChange]);

  useEffect(() => {
    if (branches.length === 0 || stockLocationCodes === null || stockLocationCodes === undefined) {
      return;
    }

    const availableStock = new Set(stockLocationCodes);
    const branchCodes = new Set(branches.map((branch) => branch.code));
    if (selectedBranch && availableStock.has(selectedBranch) && branchCodes.has(selectedBranch)) {
      return;
    }
    const preferredBranch = DEFAULT_BRANCH_PRIORITY.find(
      (code) => availableStock.has(code) && branchCodes.has(code),
    );
    const nextBranch = preferredBranch ?? branches.find((branch) => availableStock.has(branch.code))?.code;

    if (nextBranch) {
      setSelectedBranch(nextBranch);
      onPickupBranchChange?.(nextBranch);
    } else {
      setSelectedBranch(null);
      onPickupBranchChange?.(null);
    }
  }, [branches, onPickupBranchChange, selectedBranch, stockLocationCodes]);

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
          <p className={styles.optionLabel}>{en ? "Store pickup" : "მაღაზიაში აღება"}</p>
        </div>

        <div
          className={`${styles.option} ${
            selectedOption === "delivery" ? styles.active : ""
          }`}
          onClick={() => select("delivery")}
        >
          <img src="/icons/scooter.svg" alt="scooter" className={styles.icon} />
          <p className={styles.optionLabel}>{en ? "Delivery" : "ადგილზე მიტანა"}</p>
        </div>
      </div>

      <div className={styles.textBlock}>
        {selectedOption === "store" && (
          <>
            <p>{en ? "Store pickup is free. Choose a pickup branch:" : "მაღაზიიდან გატანა უფასოა. აირჩიეთ ფილიალი:"}</p>
            {branchesError ? (
              <p className={styles.error}>{branchesError}</p>
            ) : (
              <div className={styles.branches}>
                {visibleBranches.map((branch) => (
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
                {stockLocationCodes !== null && visibleBranches.length === 0 && (
                  <p className={styles.error}>
                    {en
                      ? "The complete order is not currently available at a pickup branch. Please choose delivery."
                      : "სრული შეკვეთა ამჟამად არცერთ ფილიალში არ არის. გთხოვთ, აირჩიოთ ადგილზე მიტანა."}
                  </p>
                )}
              </div>
            )}
            <p>{en ? "Your order will be ready for collection the following day between 17:00 and 20:00." : "აღნიშნული პირობის გამოყენებისას მომხმარებელი შეძენილი ნივთი უნდა გაიტანოს მეორე დღეს 17:00 - 20:00-მდე..."}</p>
          </>
        )}

        {selectedOption === "delivery" && (
          <p>{en ? "Orders over GEL 100 are delivered free of charge within Tbilisi. We aim to deliver on the same day, but traffic may cause delays; delivery by the next business day is guaranteed. Delivery is made to the building entrance and is unavailable on weekends and public holidays. Oversized and heavy items are excluded. The fee is calculated after selecting the location. Regional delivery takes 3–4 business days." : "100 ლარზე მეტი შეკეთის უფასო მოწოდება მოხდება, მხოლოდ თბილისის მაშტაბით. ჩვენი მიზანია მოწოდება მოხდეს იმავე დღეს, ამისთვის ყველაფერს ვაკეთებთ. თუმცა ქალაქში საცობების გამო ვერაფრის გარანტირებულად ვერ გპირდებით. მომდევნო სამუშაო დღეს რომ მოგივათ ეს ცალსახაა. მიწოდე მოხდება \"სადარბაზომდე\". მიწოდების ეს მეთოდი არ ვრცელდება შაბათი, კვირა და უქმე დღეებზე. მიწოდების ეს მეთოდი არ მოქმედებს გაბარიტულ და მასიურ ნივთებზე. თანხა დაანგარიშდება მდებარეობის არჩევისას. რეგიონებში მიწოდება მოხდება 3-4 სამუშაო დღეში."}</p>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.button}
          onClick={onNext}
          disabled={
            selectedOption === "store" &&
            (!selectedBranch || visibleBranches.length === 0)
          }
        >
          {en ? "Continue" : "გაგრძელება"}
        </button>
      </div>
    </div>
  );
}
