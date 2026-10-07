"use client";

import { useRef, useState } from "react";
import styles from "./WishlistTab.module.scss";
import DiscountCard from "../discount/DiscountCard";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { flyToTarget } from "@/lib/ui/flyToCart";

interface WishlistTabProps {
  variant?: "profile" | "page";
}

export default function WishlistTab({ variant = "profile" }: WishlistTabProps) {
  const en = useStorefrontLocale() === "en";
  const [isMovingToCart, setIsMovingToCart] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
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
      slug: item.slug,
      oldPrice: item.oldPrice,
      newPrice: item.sellingPrice,
      isAvailable: item.isInStock,
      isWishlisted: true,
    }));

  const handleRemove = (id: string) => {
    toggleWishlist(Number(id));
  };

  const handleAddWishlistToCart = async () => {
    if (isMovingToCart) return;

    setIsMovingToCart(true);

    try {
      const movableItems = wishlistItems.filter((item) => item.isAvailable);
      movableItems.forEach((item, index) => {
        window.setTimeout(() => {
          flyToTarget(cardRefs.current[item.id], item.image, "cart");
        }, index * 90);
      });
      if (movableItems.length > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, (movableItems.length - 1) * 90 + 350));
      }
      await addWishlistToCart();
    } finally {
      setIsMovingToCart(false);
    }
  };

  const handleAddItemToCart = async (id: string) => {
    const item = wishlistItems.find((candidate) => candidate.id === id);
    if (!item?.isAvailable) return;
    await addToCart(Number(id));
    await toggleWishlist(Number(id));
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
              <div
                key={p.id}
                className={styles.cardWrapper}
                ref={(element) => { cardRefs.current[p.id] = element; }}
              >
                <DiscountCard
                  {...p}
                  isWishlisted={true}
                  onToggleWishlist={() => handleRemove(p.id)}
                  onAddToCart={(id) => { void handleAddItemToCart(id); }}
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
              {isMovingToCart
                ? (en ? "Moving…" : "გადადის…")
                : (en ? "Move to cart" : "კალათაში გადატანა")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
