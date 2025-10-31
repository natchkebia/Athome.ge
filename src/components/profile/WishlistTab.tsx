"use client";

import { useState } from "react";
import styles from "./WishlistTab.module.scss";
import DiscountCard, { ProductCardProps } from "../discount/DiscountCard";

interface WishlistTabProps {
  variant?: "profile" | "page";
}

export default function WishlistTab({ variant = "profile" }: WishlistTabProps) {
  const [wishlist, setWishlist] = useState<ProductCardProps[]>([
    {
      id: "1",
      image: "/images/DiscountHeadphone.png",
      title: "Lenovo IdeaPad 3",
      oldPrice: 2000,
      newPrice: 1599,
    },
    {
      id: "2",
      image: "/images/DiscountHeadphone.png",
      title: "iPhone 15 Pro Max",
      oldPrice: 4800,
      newPrice: 4599,
    },
    {
      id: "3",
      image: "/images/DiscountHeadphone.png",
      title: "Sony WH-1000XM5",
      oldPrice: 1200,
      newPrice: 990,
    },
    {
      id: "4",
      image: "/images/DiscountHeadphone.png",
      title: "Sony WH-1000XM5",
      oldPrice: 1200,
      newPrice: 990,
    },
       {
      id: "5",
      image: "/images/DiscountHeadphone.png",
      title: "Sony WH-1000XM5",
      oldPrice: 1200,
      newPrice: 990,
    },
  ]);

  const handleRemove = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setWishlist([]);
  };

  return (
    <div
      className={`${styles.wrapper} ${
        variant === "page" ? styles.pageVariant : styles.profileVariant
      }`}
    >
      {wishlist.length === 0 ? (
        <h4 className={styles.title}>ჩემი სურვილების სია</h4>
      ) : (
        <>
          <div className={styles.titleWrapper}>
            <h4 className={styles.title}>ჩემი სურვილების სია</h4>
            <button className={styles.removeBtn} onClick={handleClearAll}>
              <img src="/icons/broom.svg" alt="broom" />
              ყველა წაშლა
            </button>
          </div>

          <div className={styles.grid}>
            {wishlist.map((p) => (
              <div key={p.id} className={styles.cardWrapper}>
                <DiscountCard
                  {...p}
                  isWishlisted={true}
                  onToggleWishlist={() => handleRemove(p.id)}
                />
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <button className={styles.orderBtn}>კალათაში გადატანა</button>
          </div>
        </>
      )}
    </div>
  );
}
