"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Basket.module.scss";

export default function BasketPage() {
  const [basket, setBasket] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ინიციალური ცარიელი კალათა
  useEffect(() => {
    const initialBasket: number[] = [];
    setBasket(initialBasket);
  }, []);

  // კალათის ღილაკზე დაჭერა
  const handleCartClick = () => {
    setIsOpen((prev) => !prev);
  };

  // გარეთ დაკლიკებისას დახურვა
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

  // კალათის გვერდზე გადასვლა
  const handleGoToBasket = () => {
    setIsOpen(false);
    router.push("/basket");
  };

  return (
    <div className={styles.basketWrapper} ref={dropdownRef}>
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
          <button className={styles.dropdownButton} onClick={handleGoToBasket}>
            გადადი კალათაში
          </button>
        </div>
      )}
    </div>
  );
}
