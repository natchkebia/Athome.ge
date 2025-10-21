"use client";

import { useState } from "react";
import styles from "./Discount.module.scss";
import DiscountSlider from "./DiscountSlider";

export default function Discount() {
  const filters = [
    "კომპიუტერები",
    "მონიტორები",
    "კომპიუტერის ნაწილები",
    "პერიფერიულიები",
    "ნოუთბუქები",
  ];

  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <>
      <div className={styles.filtersWrapper}>
        <div className={styles.left}>
          <img src="./icons/Percentage.svg" alt="Percentage" />
          <span className={styles.discountText}>ფასდაკლება</span>
        </div>
        <div className={styles.right}>
          {filters.map((filter) => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${
                activeFilter === filter ? styles.active : ""
              }`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <DiscountSlider />
    </>
  );
}
