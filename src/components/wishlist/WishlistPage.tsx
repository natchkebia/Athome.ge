"use client";

import { useEffect, useState } from "react";
import styles from "./WishlistPage.module.scss";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialWishlist: number[] = [];
    setWishlist(initialWishlist);
  }, []);

  const handleHeartClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.wishlistWrapper}>
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
            <span> შესაძენად, დაამატე ნივთები კალათაში</span>
          </div>
          <img
            src="./icons/wishlist.svg"
            alt="empty"
            className={styles.dropdownImage}
          />
          <button className={styles.dropdownButton}>ნახე სურვილების სია</button>
        </div>
      )}
    </div>
  );
}
