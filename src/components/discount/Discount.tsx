"use client";

import { useState } from "react";
import styles from "./Discount.module.scss";
import DiscountSlider from "./DiscountSlider";

interface Product {
  id: number;
  discount: number;
  image: string;
  title: string;
  oldPrice: number;
  newPrice: number;
  category: string;
  isNew?: boolean;
}

export default function Discount() {
  const filters = [
    "კომპიუტერები",
    "მონიტორები",
    "კომპიუტერის ნაწილები",
    "პერიფერიულიები",
    "ნოუთბუქები",
  ];

  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const products: Product[] = [
    {
      id: 1,
      discount: 50,
      image: "/images/DiscountPc.png",
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      oldPrice: 9500,
      newPrice: 7500,
      category: "კომპიუტერები",
    },
    {
      id: 2,
      discount: 30,
      image: "/images/DiscountMonitor.png",
      title: "SAMSUNG ODYSSEY G5 27'' CURVED MONITOR",
      oldPrice: 2000,
      newPrice: 1000,
      category: "მონიტორები",
    },
    {
      id: 3,
      discount: 60,
      image: "/images/DiscountChair.png",
      title: "2E GAMING CHAIR HEBI (BLACK/GREEN)",
      oldPrice: 500,
      newPrice: 250,
      category: "პერიფერიულიები",
    },
    {
      id: 4,
      discount: 20,
      image: "/images/DiscountHeadphone.png",
      title: "HYPERX CLOUD ALPHA WIRELESS",
      oldPrice: 600,
      newPrice: 300,
      category: "პერიფერიულიები",
    },
    {
      id: 5,
      discount: 40,
      image: "/images/DiscountChair.png",
      title: "ASUS TUF GAMING LAPTOP",
      oldPrice: 3000,
      newPrice: 2200,
      category: "ნოუთბუქები",
    },
    {
      id: 6,
      discount: 25,
      image: "/images/DiscountHeadphone.png",
      title: "NVIDIA RTX 4070TI GRAPHICS CARD",
      oldPrice: 4200,
      newPrice: 3150,
      category: "კომპიუტერის ნაწილები",
    },
  ];

  // 🟢 ფილტრის ფუნქცია დროებით გათიშულია — slider ყოველთვის აჩვენებს მთელ products-ს
  const filteredProducts = products;

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <>
      {/* ზედა ფილტრები — ვიზუალი რჩება */}
      <div className={styles.filtersWrapper}>
        <div className={styles.left}>
          <img src="/icons/Percentage.svg" alt="Percentage" />
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

      {/* სლაიდერი — ყველა პროდუქტი */}
      <DiscountSlider products={filteredProducts} />
    </>
  );
}
