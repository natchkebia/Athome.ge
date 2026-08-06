"use client";

import React from "react";
import styles from "./CommerceList.module.scss";
import { useRouter } from "next/navigation";
import { img } from "@/lib/media/img";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

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
  onClearAll?: () => void;
  onNavigate?: () => void;
}

export default function CommerceList({
  type,
  items,
  onRemove,
  onQuantityChange,
  onClearAll,
  onNavigate,
}: CommerceListProps) {
  const en = useStorefrontLocale() === "en";
  const getTotal = () => {
    return items.reduce(
      (acc, item) => acc + item.newPrice * (item.quantity || 1),
      0
    );
  };
  const router = useRouter();

  const handleGoToBasket = () => {
    onNavigate?.();
    router.push("/basket");
  };
  const handleGoToWishlist = () => {
    onNavigate?.();
    router.push("/wishlist");
  };
  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <h4>{type === "cart" ? (en ? "Cart" : "კალათა") : (en ? "Wishlist" : "სურვილების სია")}</h4>
        <span>{items.length} {en ? (items.length === 1 ? "product" : "products") : "პროდუქტი"}</span>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div className={styles.item} key={item.id}>
            {/* წაშლის ღილაკი — ორივესთვის (კალათა და სურვილები), ბრენდულ ფერში */}
            <button
              type="button"
              onClick={() => onRemove?.(item.id)}
              className={styles.removeBtn}
              aria-label={en ? "Remove" : "წაშლა"}
            >
              ×
            </button>

            <img
              src={img(item.image, 100)}
              alt={item.title}
              className={styles.image}
              onError={(event) => {
                const image = event.currentTarget;
                if (image.dataset.fallback) return;
                image.dataset.fallback = "true";
                image.src = "/icons/Logo.svg";
              }}
            />

            <div className={styles.wrapper}>
              <div className={styles.info}>
                <h5 className={styles.title}>{item.title}</h5>
                <div className={styles.prices}>
                  <span className={styles.new}>{item.newPrice} ₾</span>
                  {item.oldPrice && (
                    <span className={styles.old}>{item.oldPrice} ₾</span>
                  )}
                </div>
              </div>
              {type === "cart" && (
                <div className={styles.actions}>
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        {onClearAll && items.length > 0 && (
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={onClearAll}
          >
            <img src="/icons/broom.svg" alt="broom" />
            {en ? "Remove all" : "ყველა წაშლა"}
          </button>
        )}
        {type === "cart" ? (
          <>
            <p>
              {en ? "Amount due" : "გადასახდელი თანხა"}: <b>{getTotal().toLocaleString()} ₾</b>
            </p>
            <button className={styles.actionBtn} onClick={handleGoToBasket}>
              {en ? "Go to cart" : "გადადი კალათაში"}
            </button>
          </>
        ) : (
          <button className={styles.actionBtn} onClick={handleGoToWishlist}>
            {en ? "View wishlist" : "ნახე სურვილების სია"}
          </button>
        )}
      </div>
    </div>
  );
}
