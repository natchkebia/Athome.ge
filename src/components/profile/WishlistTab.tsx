"use client";

import { useState } from "react";
import styles from "./WishlistTab.module.scss";
import DiscountCard from "../discount/DiscountCard";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface WishlistTabProps {
  variant?: "profile" | "page";
}

export default function WishlistTab({ variant = "profile" }: WishlistTabProps) {
  const en = useStorefrontLocale() === "en";
  const [isMovingToCart, setIsMovingToCart] = useState(false);
  const {
    wishlist,
    toggleWishlist,
    clearWishlist,
    addToCart,
    addWishlistToCart,
  } = useCommerce();
  const wishlistItems = wishlist.items
    .filter((item) => item.productName)
    .map((item) => ({
      id: String(item.productId),
      image: normalizeMediaUrl(item.imageUrl),
      title: item.productName,
      oldPrice: item.oldPrice,
      newPrice: item.sellingPrice,
      isWishlisted: true,
    }));

  const handleRemove = (id: string) => {
    toggleWishlist(Number(id));
  };

  const handleAddWishlistToCart = async () => {
    if (isMovingToCart) return;

    setIsMovingToCart(true);

    try {
      await addWishlistToCart();
    } finally {
      setIsMovingToCart(false);
    }
  };

  return (
    <div
      className={`${styles.wrapper} ${
        variant === "page" ? styles.pageVariant : styles.profileVariant
      }`}
    >
      {wishlistItems.length === 0 ? (
        <h4 className={styles.title}>{en ? "My wishlist" : "ჩემი სურვილების სია"}</h4>
      ) : (
        <>
          <div className={styles.titleWrapper}>
            <h4 className={styles.title}>{en ? "My wishlist" : "ჩემი სურვილების სია"}</h4>
            <button
              className={styles.removeBtn}
              onClick={clearWishlist}
            >
              <img src="/icons/broom.svg" alt="broom" />
              {en ? "Remove all" : "ყველა წაშლა"}
            </button>
          </div>

          <div className={styles.grid}>
            {wishlistItems.map((p) => (
              <div key={p.id} className={styles.cardWrapper}>
                <DiscountCard
                  {...p}
                  isWishlisted={true}
                  onToggleWishlist={() => handleRemove(p.id)}
                  onAddToCart={(id) => addToCart(Number(id))}
                />
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <button
              className={styles.orderBtn}
              onClick={handleAddWishlistToCart}
              disabled={isMovingToCart}
            >
              {en ? "Move to cart" : "კალათაში გადატანა"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
