"use client";

import React from "react";
import styles from "./MinimalProductItem.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export type ProductItem = {
  id: number;
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  isSystem?: boolean;
  systemProducts?: {
    id: number;
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
};

interface MinimalProductItemProps {
  item: ProductItem;
}

export default function MinimalProductItem({ item }: MinimalProductItemProps) {
  const en = useStorefrontLocale() === "en";

  return (
    <div className={styles.item}>
      <img src={item.image} alt={item.title} className={styles.image} />

      <div className={styles.wrapper}>
        <div className={styles.info}>
          <h5 className={styles.title}>{item.title}</h5>
          <h3>{en ? "Quantity" : "რაოდენობა"}: {item.quantity}</h3>
          <div className={styles.prices}>
            <span className={styles.new}>{item.price} ₾</span>

            {item.oldPrice && (
              <span className={styles.old}>{item.oldPrice} ₾</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
