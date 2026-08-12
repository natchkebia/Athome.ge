"use client";

import { useEffect, useState } from "react";
import styles from "./StockCheck.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import type { StorefrontStockLocation } from "@/lib/api/storefront";
import {
  getPickupBranches,
  type PickupBranch,
} from "@/lib/api/checkout";

interface StockCheckProps {
  stockLocations: StorefrontStockLocation[];
}

const LOCATION_ORDER: StorefrontStockLocation["code"][] = [
  "tsereteli",
  "saburtalo",
  "warehouse",
  "online",
];

export default function StockCheck({ stockLocations }: StockCheckProps) {
  const en = useStorefrontLocale() === "en";
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState<PickupBranch[]>([]);
  const locations = [...stockLocations].sort(
    (a, b) => LOCATION_ORDER.indexOf(a.code) - LOCATION_ORDER.indexOf(b.code),
  );

  useEffect(() => {
    if (!isOpen || branches.length > 0) return;
    getPickupBranches().then(setBranches).catch(() => setBranches([]));
  }, [branches.length, isOpen]);

  const branchByCode = new Map(branches.map((branch) => [branch.code, branch]));

  return (
    <>
      <button className={styles.checkBtn} onClick={() => setIsOpen(true)}>
        {en ? "Check" : "შემოწმება"} <span className={styles.arrow}>›</span>
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label={en ? "Close" : "დახურვა"}>
              ×
            </button>
            <h3 className={styles.title}>{en ? "Stock by location" : "მარაგი ლოკაციების მიხედვით"}</h3>

            {locations.length === 0 ? (
              <p className={styles.empty}>{en ? "Currently unavailable" : "ამჟამად მარაგში არ არის"}</p>
            ) : (
              <div className={styles.locations}>
                {locations.map((location) => (
                  <div key={location.code} className={styles.card}>
                    <div>
                      <p className={styles.locationName}>
                        {location.code === "online"
                          ? en ? "Available to order" : "შეკვეთით"
                          : location.name}
                      </p>
                      {location.note && (
                        <p className={styles.note}>{location.note}</p>
                      )}
                      {!location.note && location.address && (
                        <p className={styles.note}>{location.address}</p>
                      )}
                      {!location.note && !location.address && location.code !== "online" && branchByCode.get(location.code)?.address && (
                        <p className={styles.note}>
                          {branchByCode.get(location.code)?.address}
                        </p>
                      )}
                      {!location.note && location.code === "online" && (
                        <p className={styles.note}>
                          {en
                            ? "Supplier stock; availability may be delayed by up to 24 hours."
                            : "მომწოდებლის მარაგი; მონაცემი შეიძლება 24 საათამდე დაგვიანებული იყოს."}
                        </p>
                      )}
                    </div>
                    <p className={styles.quantity}>
                      <strong>{location.quantity}</strong> {en ? "in stock" : "ცალი"}
                    </p>
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
