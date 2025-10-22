"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./WishlistPage.module.scss";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const initialWishlist: number[] = [];
    setWishlist(initialWishlist);
  }, []);

  const handleHeartClick = () => {
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  const handleGoToWishlist = () => {
    setIsOpen(false);
    router.push("/wishlist");
  };

  return (
    <div className={styles.wishlistWrapper} ref={dropdownRef}>
      <img
        src="./icons/Heart.svg"
        alt="heart"
        className={styles.heartIcon}
        onClick={handleHeartClick}
      />

      {wishlist.length > 0 && (
        <div className={styles.badge}>{wishlist.length}</div>
      )}

      {isOpen && wishlist.length === 0 && (
        <div className={styles.dropdownBox}>
          <div>
            <p className={styles.dropdownText}>სურვილების სია ცარიელია</p>
            <span>შესაძენად, დაამატე ნივთები კალათაში</span>
          </div>
          <img
            src="./icons/wishlist.svg"
            alt="empty"
            className={styles.dropdownImage}
          />
          <button
            className={styles.dropdownButton}
            onClick={handleGoToWishlist}
          >
            ნახე სურვილების სია
          </button>
        </div>
      )}
    </div>
  );
}
