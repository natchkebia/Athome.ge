"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CommerceList, { ProductItem } from "@/components/commerce/CommerceList";
import styles from "./WishlistPage.module.scss";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function WishlistPage() {
  const en = useStorefrontLocale() === "en";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { wishlist, toggleWishlist, clearWishlist } = useCommerce();
  const wishlistItems: ProductItem[] = wishlist.items
    .filter((item) => item.productName)
    .map((item) => ({
      id: String(item.productId),
      image: normalizeMediaUrl(item.imageUrl),
      title: item.productName,
      oldPrice: item.oldPrice,
      newPrice: item.sellingPrice,
    }));

  const handleHeartClick = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleGoToWishlist = () => {
    setIsOpen(false);
    router.push("/wishlist");
  };

  const handleRemove = (id: string) => {
    toggleWishlist(Number(id));
  };

  return (
    <div className={styles.wishlistWrapper} ref={dropdownRef}>
      <img
        id="nav-wishlist-icon"
        src="/icons/Heart.svg"
        alt="heart"
        className={styles.heartIcon}
        onClick={handleHeartClick}
      />

      {wishlist.totalItems > 0 && (
        <div className={styles.badge}>{wishlist.totalItems}</div>
      )}

      {isOpen && (
        <div className={styles.dropdownBox}>
          {wishlistItems.length === 0 ? (
            <>
              <div>
                <p className={styles.dropdownText}>{en ? "Your wishlist is empty" : "სურვილების სია ცარიელია"}</p>
                <span>{en ? "Save products here for later" : "შესაძენად, დაამატე ნივთები კალათაში"}</span>
              </div>
              <img
                src="/icons/wishlist.svg"
                alt="empty"
                className={styles.dropdownImage}
              />
              <button
                className={styles.dropdownButton}
                onClick={handleGoToWishlist}
              >
                {en ? "View wishlist" : "ნახე სურვილების სია"}
              </button>
            </>
          ) : (
            <>
              <CommerceList
                type="wishlist"
                items={wishlistItems}
                onRemove={handleRemove}
                onClearAll={clearWishlist}
                onNavigate={() => setIsOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
