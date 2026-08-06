"use client";

import React, { useEffect, useState } from "react";
import styles from "./Step2Delivery.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface Step2DeliveryProps {
  onNext?: () => void;
  onPrev?: () => void;
  onOptionChange?: (value: "store" | "delivery") => void;
}

export default function Step2Delivery({
  onNext,
  onPrev,
  onOptionChange,
}: Step2DeliveryProps) {
  const en = useStorefrontLocale() === "en";
  const [selectedOption, setSelectedOption] = useState<"store" | "delivery">(
    "store"
  );

  useEffect(() => {
    onOptionChange?.("store");
  }, []);

  const select = (value: "store" | "delivery") => {
    setSelectedOption(value);
    onOptionChange?.(value);
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
            <p>{en ? "Store pickup is free. Collect your order from one of these addresses:" : "ადგილიდან გატანა უფასოა, ამ შემთხვევაში შეკვეთა უნდა წაიღოთ მაღაზიიდან. მისამართი :"}</p>
            <ul>
              <li>{en ? "115 Tsereteli Ave, Tbilisi" : "ქ. თბილისი, წერეთლის N 115"}</li>
              <li>{en ? "73 Merab Kostava St, Tbilisi" : "ქ. თბილისი, აღმაშენებლის მესხის N 73"}</li>
            </ul>
            <p>{en ? "Your order will be ready for collection the following day between 17:00 and 20:00." : "აღნიშნული პირობის გამოყენებისას მომხმარებელი შეძენილი ნივთი უნდა გაიტანოს მეორე დღეს 17:00 - 20:00-მდე..."}</p>
          </>
        )}

        {selectedOption === "delivery" && (
          <p>{en ? "Orders over GEL 100 are delivered free of charge within Tbilisi. We aim to deliver on the same day, but traffic may cause delays; delivery by the next business day is guaranteed. Delivery is made to the building entrance and is unavailable on weekends and public holidays. Oversized and heavy items are excluded. The fee is calculated after selecting the location. Regional delivery takes 3–4 business days." : "100 ლარზე მეტი შეკეთის უფასო მოწოდება მოხდება, მხოლოდ თბილისის მაშტაბით. ჩვენი მიზანია მოწოდება მოხდეს იმავე დღეს, ამისთვის ყველაფერს ვაკეთებთ. თუმცა ქალაქში საცობების გამო ვერაფრის გარანტირებულად ვერ გპირდებით. მომდევნო სამუშაო დღეს რომ მოგივათ ეს ცალსახაა. მიწოდე მოხდება \"სადარბაზომდე\". მიწოდების ეს მეთოდი არ ვრცელდება შაბათი, კვირა და უქმე დღეებზე. მიწოდების ეს მეთოდი არ მოქმედებს გაბარიტულ და მასიურ ნივთებზე. თანხა დაანგარიშდება მდებარეობის არჩევისას. რეგიონებში მიწოდება მოხდება 3-4 სამუშაო დღეში."}</p>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.button} onClick={onNext}>
          {en ? "Continue" : "გაგრძელება"}
        </button>
      </div>
    </div>
  );
}
