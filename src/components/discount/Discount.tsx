"use client";

import { useEffect, useState } from "react";
import styles from "./Discount.module.scss";
import DiscountSlider from "./DiscountSlider";
import { getDealStorefrontProducts } from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import AtHomeLoader from "../shared/AtHomeLoader";

export default function Discount() {
  const filters = [
    "კომპიუტერები",
    "მონიტორები",
    "კომპიუტერის ნაწილები",
    "პერიფერიულიები",
    "ნოუთბუქები",
  ];

  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    getDealStorefrontProducts(8)
      .then((items) => {
        if (isMounted) setProducts(items.map(mapStorefrontProductToCard));
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products;

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  if (loading) return <AtHomeLoader variant="section" />;
  if (products.length === 0) return null;

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
