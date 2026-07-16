"use client";

import { useEffect, useState } from "react";
import styles from "./Discount.module.scss";
import DiscountSlider from "./DiscountSlider";
import { getDealStorefrontProducts } from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { usePageLoading } from "@/contexts/LoadingContext";

// tab label -> backend category slug (deal card carries the top-level slug)
const FILTER_SLUGS: Record<string, string> = {
  კომპიუტერები: "computers",
  მონიტორები: "monitors-and-screens",
  "კომპიუტერის ნაწილები": "computer-parts",
  პერიფერიულიები: "peripherials",
  ნოუთბუქები: "laptop",
};

export default function Discount() {
  const filters = Object.keys(FILTER_SLUGS);

  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [products, setProducts] = useState<StorefrontProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  usePageLoading(loading);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    getDealStorefrontProducts(48)
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

  // real slug-based filtering — ვამოწმებთ ორივე დონეს: ბარათი ატარებს ზედა
  // კატეგორიის slug-საც (მაგ. "computers") და ქვეკატეგორიისასაც (მაგ. "laptop"),
  // ამიტომ tab-ის slug ნებისმიერ დონეს ერგება.
  const filteredProducts = products.filter((p) => {
    const slug = FILTER_SLUGS[activeFilter];
    return p.category === slug || p.subCategory === slug;
  });

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  if (loading) return null;
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

      {/* სლაიდერი — არჩეული კატეგორიის ფასდაკლებები */}
      {filteredProducts.length > 0 ? (
        <DiscountSlider products={filteredProducts} />
      ) : (
        <p className={styles.emptyDeals}>
          ამ კატეგორიაში ფასდაკლება ჯერ არ არის
        </p>
      )}
    </>
  );
}
