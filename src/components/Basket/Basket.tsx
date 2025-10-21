"use client";

import { useEffect, useState } from "react";
import styles from "./Basket.module.scss";

export default function BasketPage() {
  const [basket, setBasket] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialBasket: number[] = [];
    setBasket(initialBasket);
  }, []);

  const handleCartClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.basketWrapper}>
      <img
        src="./icons/Cart.svg"
        alt="cart"
        className={styles.cartIcon}
        onClick={handleCartClick}
      />

      {basket.length > 0 && <div className={styles.badge}>{basket.length}</div>}

      {isOpen && basket.length === 0 && (
        <div className={styles.dropdownBox}>
          <div>
            <p className={styles.dropdownText}>კალათა ცარიელია</p>
            <span>შესაძენად, დაამატე ნივთები კალათაში</span>
          </div>
          <img
            src="./icons/Basket.svg"
            alt="empty"
            className={styles.dropdownImage}
          />
          <button className={styles.dropdownButton}>გადადი კალათაში</button>
        </div>
      )}
    </div>
  );
}
