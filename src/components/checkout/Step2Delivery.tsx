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
}

export default function Step2Delivery({
  onNext,
  onPrev,
  onOptionChange,
  onPickupBranchChange,
}: Step2DeliveryProps) {
  const en = useStorefrontLocale() === "en";
  const [selectedOption, setSelectedOption] = useState<"store" | "delivery">(
    "store"
  );
  const [branches, setBranches] = useState<PickupBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [branchesError, setBranchesError] = useState<string | null>(null);

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
            (!selectedBranch || branches.length === 0)
          }
        >
          {en ? "Continue" : "გაგრძელება"}
        </button>
      </div>
    </div>
  );
}
