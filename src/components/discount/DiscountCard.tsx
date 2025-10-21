"use client";

import styles from "./DiscountCard.module.scss";
import Image from "next/image";

interface ProductCardProps {
  discount?: number;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  isNew?: boolean;
}

export default function DiscountCard({
  discount = 0,
  image,
  title,
  oldPrice,
  newPrice,
  isNew = false,
}: ProductCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardWrapper}>
        {(discount > 0 || isNew) && (
          <div className={styles.badges}>
            {discount > 0 && (
              <div className={styles.discountBadge}>-{discount}%</div>
            )}
            {isNew && <div className={styles.newBadge}>NEW</div>}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.iconBtn}>
            <img src="/icons/Heart.svg" alt="wishlist" />
          </button>
          <button className={styles.iconBtn}>
            <img src="/icons/Arrows.svg" alt="compare" />
          </button>
        </div>

        <div className={styles.imageWrapper}>
          <Image src={image} alt={title} width={172} height={172} />
        </div>
      </div>

      <h3 className={styles.title}>{title}</h3>

      <div className={styles.priceWrapper}>
        <div className={styles.priceBox}>
          {newPrice !== undefined && (
            <span className={styles.newPrice}>{newPrice.toFixed(2)} ₾</span>
          )}
          {oldPrice !== undefined && (
            <span className={styles.oldPrice}>{oldPrice.toFixed(2)} ₾</span>
          )}
        </div>

        <button className={styles.addBtn}>
          <img src="/icons/CartWhite.svg" alt="cart" />
          დამატება
        </button>
      </div>
    </div>
  );
}
