"use client";

import React from "react";
import styles from "./CommerceList.module.scss";
import { useRouter } from "next/navigation";

export interface ProductItem {
  id: string;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice: number;
  quantity?: number;
}

interface CommerceListProps {
  type: "cart" | "wishlist";
  items: ProductItem[];
  onRemove?: (id: string) => void;
  onQuantityChange?: (id: string, newQty: number) => void;
}

export default function CommerceList({
  type,
  items,
  onRemove,
  onQuantityChange,
}: CommerceListProps) {
  const getTotal = () => {
    return items.reduce(
      (acc, item) => acc + item.newPrice * (item.quantity || 1),
      0
    );
  };
  const router = useRouter();

  const handleGoToBasket = () => {
    router.push("/basket");
  };
  const handleGoToWishlist = () => {
    router.push("/wishlist");
  };
  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <h4>{type === "cart" ? "კალათა" : "სურვილების სია"}</h4>
        <span>{items.length} პროდუქტი</span>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div className={styles.item} key={item.id}>
            <img src={item.image} alt={item.title} className={styles.image} />

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                width: "208px",
                padding: "5px 0px",
              }}
            >
              <div className={styles.info}>
                <h5 className={styles.title}>{item.title}</h5>
                <div className={styles.prices}>
                  <span className={styles.new}>{item.newPrice} ₾</span>
                  {item.oldPrice && (
                    <span className={styles.old}>{item.oldPrice} ₾</span>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                {type === "cart" ? (
                  <div className={styles.quantity}>
                    <button
                      onClick={() =>
                        onQuantityChange?.(
                          item.id,
                          Math.max((item.quantity || 1) - 1, 1)
                        )
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button
                      onClick={() =>
                        onQuantityChange?.(item.id, (item.quantity || 1) + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onRemove?.(item.id)}
                    className={styles.wishlistBtn}
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        {type === "cart" ? (
          <>
            <p>
              გადასახდელი თანხა: <b>{getTotal().toLocaleString()} ₾</b>
            </p>
            <button className={styles.actionBtn} onClick={handleGoToBasket}>
              გადადი კალათაში
            </button>
          </>
        ) : (
          <button className={styles.actionBtn} onClick={handleGoToWishlist}>
            ნახე სურვილების სია
          </button>
        )}
      </div>
    </div>
  );
}
