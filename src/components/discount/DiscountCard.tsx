"use client";

import styles from "./DiscountCard.module.scss";
import Image from "next/image";
import { useCompare } from "@/contexts/CompareContext";
import { useToast } from "@/contexts/ToastContext";
import { cacheProductInfo } from "@/lib/commerce/guestStore";

export interface ProductCardProps {
  id: string;
  discount?: number;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  isNew?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  category?: string;
  slug?: string;
  layout?: "grid" | "list";
}

export default function DiscountCard({
  id,
  discount = 0,
  image,
  title,
  oldPrice,
  newPrice,
  isNew = false,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  category,
  slug,
  layout = "grid",
}: ProductCardProps) {
  const { toggleCompare, compareIds, maxItems } = useCompare();
  const { showToast } = useToast();
  const isCompared = compareIds.has(Number(id));

  const handleCompare = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const result = toggleCompare({
      id: Number(id),
      slug: slug ?? "",
      category: category ?? "",
      title,
      image,
      newPrice,
      oldPrice,
    });

    if (result === "added") showToast("შედარების სიაში დაემატა");
    else if (result === "removed") showToast("შედარების სიიდან ამოიშალა");
    else showToast(`შედარებაში მაქსიმუმ ${maxItems} პროდუქტია`, "error");
  };

  // სტუმრის კალათა/სურვილებისთვის — ჩვენების ინფოს ქეშირება add-ისას.
  const cacheInfo = () =>
    cacheProductInfo({
      productId: Number(id),
      productName: title,
      imageUrl: image,
      slug,
      sellingPrice: newPrice ?? 0,
      oldPrice,
    });

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cacheInfo();
    onToggleWishlist?.(id);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cacheInfo();
    onAddToCart?.(id);
  };

  // სიის (list) ვიზუალი — ჰორიზონტალური გაშლილი ბარათი (1038×172).
  if (layout === "list") {
    return (
      <div className={styles.cardList}>
        <div className={styles.listImage}>
          {discount > 0 && (
            <div className={styles.discountBadge}>-{discount}%</div>
          )}
          {isNew && <div className={styles.newBadge}>NEW</div>}
          <Image
            className={styles.productImage}
            src={image}
            alt={title}
            width={140}
            height={140}
          />
        </div>

        <div className={styles.listMain}>
          <h3 className={styles.listTitle}>{title}</h3>
          <div className={styles.priceBox}>
            {newPrice !== undefined && (
              <span className={styles.newPrice}>{newPrice.toFixed(2)} ₾</span>
            )}
            {oldPrice !== undefined && (
              <span className={styles.oldPrice}>{oldPrice.toFixed(2)} ₾</span>
            )}
          </div>
        </div>

        <div className={styles.listActions}>
          <button
            className={`${styles.listIconBtn} ${
              isCompared ? styles.listIconBtnActive : ""
            }`}
            onClick={handleCompare}
            aria-pressed={isCompared}
            aria-label="compare"
          >
            <img src="/icons/Arrows.svg" alt="compare" />
          </button>
          <button
            className={styles.listIconBtn}
            onClick={handleWishlist}
            aria-pressed={isWishlisted}
            aria-label="wishlist"
          >
            <img
              src={isWishlisted ? "/icons/redHeart.svg" : "/icons/Heart.svg"}
              alt="wishlist"
            />
          </button>
          <button className={styles.addBtn} onClick={handleAddToCart}>
            <img src="/icons/CartWhite.svg" alt="cart" />
            დამატება
          </button>
        </div>
      </div>
    );
  }

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
          <button
            className={styles.iconBtn}
            onClick={handleWishlist}
            aria-pressed={isWishlisted}
            aria-label="wishlist"
          >
            <img
              src={isWishlisted ? "/icons/redHeart.svg" : "/icons/Heart.svg"}
              alt="wishlist"
            />
          </button>
          <button
            className={`${styles.iconBtn} ${
              isCompared ? styles.iconBtnActive : ""
            }`}
            onClick={handleCompare}
            aria-pressed={isCompared}
            aria-label="compare"
          >
            <img src="/icons/Arrows.svg" alt="compare" />
          </button>
        </div>

        <div className={styles.imageWrapper}>
          <Image
            className={styles.productImage}
            src={image}
            alt={title}
            width={172}
            height={172}
          />
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

        <button className={styles.addBtn} onClick={handleAddToCart}>
          <img src="/icons/CartWhite.svg" alt="cart" />
          დამატება
        </button>
      </div>
    </div>
  );
}
