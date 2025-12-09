"use client";

import React, { useEffect, useState } from "react";
import styles from "./Step2Delivery.module.scss";

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
        <h2 className={styles.title}>მიწოდების დეტალები</h2>
      </div>

      <div className={styles.options}>
        <div
          className={`${styles.option} ${
            selectedOption === "store" ? styles.active : ""
          }`}
          onClick={() => select("store")}
        >
          <img src="/icons/gift.svg" alt="gift" className={styles.icon} />
          <p className={styles.optionLabel}>მაღაზიაში აღება</p>
        </div>

        <div
          className={`${styles.option} ${
            selectedOption === "delivery" ? styles.active : ""
          }`}
          onClick={() => select("delivery")}
        >
          <img src="/icons/scooter.svg" alt="scooter" className={styles.icon} />
          <p className={styles.optionLabel}>ადგილზე მიტანა</p>
        </div>
      </div>

      <div className={styles.textBlock}>
        {selectedOption === "store" && (
          <>
            <p>
              ადგილიდან გატანა უფასოა, ამ შემთხვევაში შეკვეთა უნდა წაიღოთ
              მაღაზიიდან. მისამართი :
            </p>
            <ul>
              <li>ქ. თბილისი, წერეთლის N 115</li>
              <li>ქ. თბილისი, აღმაშენებლის მესხის N 73</li>
            </ul>
            <p>
              აღნიშნული პირობის გამოყენებისას მომხმარებელი შეძენილი ნივთი უნდა
              გაიტანოს მეორე დღეს 17:00 - 20:00-მდე...
            </p>
          </>
        )}

        {selectedOption === "delivery" && (
          <p>
            100 ლარზე მეტი შეკეთის უფასო მოწოდება მოხდება, მხოლოდ თბილისის
            მაშტაბით. ჩვენი მიზანია მოწოდება მოხდეს იმავე დღეს, ამისთვის
            ყველაფერს ვაკეთებთ. თუმცა ქალაქში საცობების გამო ვერაფრის
            გარანტირებულად ვერ გპირდებით. მომდევნო სამუშაო დღეს რომ მოგივათ ეს
            ცალსახაა. მიწოდე მოხდება "სადარბაზომდე". მიწოდების ეს მეთოდი არ
            ვრცელდება შაბათი, კვირა და უქმე დღეებზე. მიწოდების ეს მეთოდი არ
            მოქმედებს გაბარიტულ და მასიურ ნივთებზე. თანხა დაანგარიშდება
            მდებარეობის არჩევისას. რეგიონებში მიწოდება მოხდება 3-4 სამუშაო
            დღეში.
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.button} onClick={onNext}>
          გაგრძელება
        </button>
      </div>
    </div>
  );
}
