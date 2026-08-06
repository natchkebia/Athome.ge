"use client";
import React, { useState } from "react";
import styles from "./Step3Method.module.scss";

import DeliveryMethodCard from "./components/DeliveryMethodCard";
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
  const [method, setMethod] = useState<string>("");
  const [address, setAddress] = useState<DeliveryAddress | null>(null);

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
        <h2 className={styles.title}>{en ? "Delivery provider" : "მიმწოდებელი კომპანია"}</h2>
      </div>

      <DeliveryMethodCard
        icon={<img src="/icons/scooter.svg" alt="scooter" />}
        title={en ? "Same-day delivery within Tbilisi (business days only)" : "მიტანა თბილისის მასშტაბით იმავე დღეს (მხოლოდ სამუშაოდღე)"}
        description={en ? "Orders placed before 13:00 are delivered by our courier by 19:00 on the same day (excluding weekends and public holidays)." : "თუ შეკვეთას Athome.ge –ზე განახორციელებთ 13 საათამდე, ჩვენი კურიერი პროდუქტს მოგაწვდით იმავე დღეს 19 საათამდე (შაბათ-კვირის, ოფიციალური უქმე დღეების გარდა)"}
        selected={method === "local"}
        onSelect={() => setMethod("local")}
        expandedContent={
          <div>
            <b>{en ? "Rate:" : "ტარიფი:"}</b> {en ? "The delivery fee is calculated automatically based on the location and item size." : "მიწოდების ღირებულებას შეკვეთის გვერდზე ავტომატურად დაგიგენერირებთ საიტი ადგილმდებარეობის და ნივთის ზომის მიხედვით."}
          </div>
        }
      />

      <DeliveryMethodCard
        icon={<img src="/icons/delivo.svg" alt="delivo" />}
        title={en ? "Delivo – delivery within 1.5 hours" : "Delivo – მიტანის დროის შუალედით 1:30 საათში"}
        description={en ? "Orders received before 15:00 are delivered within two hours on the same day." : "15:00 საათამდე მიღებული შეკვეთის მიწოდება მოხდება შეკვეთიდან 2 საათში იმავე დღეს."}
        selected={method === "delivo"}
        onSelect={() => setMethod("delivo")}
        expandedContent={
          <div>
            <b>{en ? "Rate:" : "ტარიფი:"}</b> {en ? "GEL 20" : "20 ლარი"}
            <div style={{ color: "rgba(235, 78, 57, 1)", marginTop: 8 }}>
              {en ? "Note: This service is available from 11:00 to 16:30, excluding weekends and public holidays." : "შენიშვნა: ამ სერვისით სარგებლობა შეგიძლიათ დილის 11:00 საათიდან, საღამოს 16:30 საათამდე (შაბათ-კვირის, ოფიციალური უქმე დღეების გარდა)."}
            </div>
          </div>
        }
      />

      <DeliveryMethodCard
        icon={<img src="/icons/dhl.svg" alt="dhl" />}
        title={en ? "DHL – nationwide delivery" : "DHL – მიტანა ქვეყნის მასშტაბით"}
        description={en ? "Delivery rates and times depend on the city and product weight." : "მიწოდების ტარიფები და ვადები ინდივიდუალურია ქალაქისა და პროდუქტის წონის მიხედვით"}
        selected={method === "dhl"}
        onSelect={() => setMethod("dhl")}
        expandedContent={
          <div>
            <b>{en ? "Rate:" : "ტარიფი:"}</b> {en ? "Calculated automatically during checkout" : "დაითვლება შეკვეთის დროს ავტომატურად"}
          </div>
        }
      />

      <div className={styles.dropdowns}>
        <AddressSelector
          customerName={customerName}
          customerPhone={customerPhone}
          onSelect={setAddress}
        />
      </div>

      <button
        className={styles.btn}
        disabled={!method || !address}
        onClick={handleNext}
      >
        {en ? "Continue" : "გაგრძელება"}
      </button>
    </div>
  );
}
