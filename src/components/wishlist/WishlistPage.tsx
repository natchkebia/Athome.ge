"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CommerceList, { ProductItem } from "@/components/commerce/CommerceList";
import styles from "./WishlistPage.module.scss";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const initialWishlist: ProductItem[] = [
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
    ];
    setWishlist(initialWishlist);
  }, []);

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
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.wishlistWrapper} ref={dropdownRef}>
      <img
        src="/icons/Heart.svg"
        alt="heart"
        className={styles.heartIcon}
        onClick={handleHeartClick}
      />

      {wishlist.length > 0 && (
        <div className={styles.badge}>{wishlist.length}</div>
      )}

      {isOpen && (
        <div className={styles.dropdownBox}>
          {wishlist.length === 0 ? (
            <>
              <div>
                <p className={styles.dropdownText}>სურვილების სია ცარიელია</p>
                <span>შესაძენად, დაამატე ნივთები კალათაში</span>
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
                ნახე სურვილების სია
              </button>
            </>
          ) : (
            <>
              <CommerceList
                type="wishlist"
                items={wishlist}
                onRemove={handleRemove}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
