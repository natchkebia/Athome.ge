"use client";
import React, { useState } from "react";
import styles from "./Step3Method.module.scss";

import DeliveryMethodCard from "./components/DeliveryMethodCard";
import AddressSelector from "./components/AddressSelector";

export default function Step3Delivery({ onNext, onPrev }: any) {
  const [method, setMethod] = useState<string>("");
  const [address, setAddress] = useState<any>(null);

  function handleNext() {
    if (!method || !address) return;

    onNext?.({
      method,
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
        <h2 className={styles.title}>მიმწოდებელი კომპანია</h2>
      </div>

      <DeliveryMethodCard
        icon={<img src="/icons/scooter.svg" alt="scooter" />}
        title="მიტანა თბილისის მასშტაბით იმავე დღეს (მხოლოდ სამუშაოდღე)"
        description="თუ შეკვეთას Athome.ge –ზე განახორციელებთ 13 საათამდე, ჩვენი კურიერი პროდუქტს მოგაწვდით იმავე დღეს
19 საათამდე (შაბათ-კვირის, ოფიციალური უქმე დღეების გარდა)"
        selected={method === "local"}
        onSelect={() => setMethod("local")}
        expandedContent={
          <div>
            <b>ტარიფი:</b> მიწოდების ღირებულებას შეკვეთის გვერდზე ავტომატურად
            დაგიგენერირებთ საიტი ადგილმდებარეობის და ნივთის ზომის მიხედვით.
          </div>
        }
      />

      <DeliveryMethodCard
        icon={<img src="/icons/delivo.svg" alt="delivo" />}
        title="Delivo – მიტანის დროის შუალედით 1:30 საათში"
        description="15:00 საათამდე მიღებული შეკვეთის მიწოდება მოხდება შეკვეთიდან 2 საათში იმავე დღეს."
        selected={method === "delivo"}
        onSelect={() => setMethod("delivo")}
        expandedContent={
          <div>
            <b>ტარიფი:</b> 20 ლარი
            <div style={{ color: "rgba(235, 78, 57, 1)", marginTop: 8 }}>
              შენიშვნა: ამ სერვისით სარგებლობა შეგიძლიათ დილის 11:00 საათიდან,
              საღამოს 16:30 საათამდე (შაბათ-კვირის, ოფიციალური უქმე დღეების
              გარდა).
            </div>
          </div>
        }
      />

      <DeliveryMethodCard
        icon={<img src="/icons/dhl.svg" alt="dhl" />}
        title="DHL – მიტანა ქვეყნის მასშტაბით"
        description="მიწოდების ტარიფები და ვადები ინდივიდუალურია ქალაქისა და პროდუქტის წონის მიხედვით"
        selected={method === "dhl"}
        onSelect={() => setMethod("dhl")}
        expandedContent={
          <div>
            <b>ტარიფი:</b> დაითვლება შეკვეთის დროს ავტომატურად
          </div>
        }
      />

      <div className={styles.dropdowns}>
        <AddressSelector onSelect={(data: any) => setAddress(data)} />
      </div>

      <button
        className={styles.btn}
        disabled={!method || !address}
        onClick={handleNext}
      >
        გაგრძელება
      </button>
    </div>
  );
}
