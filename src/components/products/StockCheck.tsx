"use client";

import { useState } from "react";
import styles from "./StockCheck.module.scss";
import AtHomeLoader from "../shared/AtHomeLoader";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface StockCheckProps {
  productId: string; // როცა დააჭერ, ეს წამოიღება props-ად
}

export default function StockCheck({ productId }: StockCheckProps) {
  const en = useStorefrontLocale() === "en";
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<any[]>([]);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      // აქ შეგიძლია ჩასვა შენი API:
      // const res = await fetch(`/api/stock/${productId}`);
      // const data = await res.json();
      const data = [
        {
          city: "თბილისი",
          address: "აკაკი წერეთლის გამზირი N115",
          phone: "+995 599 09 32 09",
          workHours: "ორშ - შაბ: 11:00:00 - 19:00:00 ",
          inStock: true,
        },
        {
          city: "თბილისი",
          address: "მერაბ კოსტავას ქუჩა N76",
          phone: "+995 599 09 32 09",
          workHours: "ორშ - შაბ: 11:00:00 - 19:00:00 ",
          inStock: false,
        },
      ];
      setStockData(data);
    } catch {}
    setLoading(false);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button className={styles.checkBtn} onClick={handleOpen}>
        {en ? "Check" : "შემოწმება"} <span className={styles.arrow}>›</span>
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleClose}>
              ×
            </button>
            <h3 className={styles.title}>{en ? "Stock in stores" : "მარაგი ფილიალებში"}</h3>

            {loading ? (
              <AtHomeLoader variant="inline" />
            ) : (
              <div className={styles.locations}>
                {stockData.map((store, index) => (
                  <div key={index} className={styles.card}>
                    <div className={styles.addressWrapper}>
                      <p className={styles.city}>{en ? "Tbilisi" : store.city}</p>
                      <p className={styles.address}>{en ? (index === 0 ? "115 Akaki Tsereteli Avenue" : "76 Merab Kostava Street") : store.address}</p>
                    </div>
                    <div className={styles.contact}>
                      <a href={`tel:${store.phone}`} className={styles.phone}>
                        {store.phone}
                      </a>

                      <p className={styles.hours}>{en ? "Mon–Sat: 11:00–19:00" : store.workHours}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
