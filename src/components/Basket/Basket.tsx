"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CommerceList, { ProductItem } from "@/components/commerce/CommerceList";
import styles from "./Basket.module.scss";

export default function BasketPage() {
  const [basket, setBasket] = useState<ProductItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🧩 ინიციალური მონაცემები (simulate)
  useEffect(() => {
    const initialBasket: ProductItem[] = [
      {
        id: "14736",
        title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
        image: "/images/discountPc.png",
        oldPrice: 9500,
        newPrice: 6500,
        quantity: 22,
      },
      {
        id: "14737",
        title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
        image: "/images/discountPc.png",
        oldPrice: 9500,
        newPrice: 6500,
        quantity: 22,
      },
      {
        id: "14738",
        title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
        image: "/images/discountPc.png",
        oldPrice: 9500,
        newPrice: 6500,
        quantity: 22,
      },
      {
        id: " 14739",
        title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
        image: "/images/discountPc.png",
        oldPrice: 9500,
        newPrice: 6500,
        quantity: 22,
      },
    ];
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

  // რაოდენობის შეცვლა
  const handleQuantityChange = (id: string, newQty: number) => {
    setBasket((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  // პროდუქტის წაშლა
  const handleRemove = (id: string) => {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.basketWrapper} ref={dropdownRef}>
      {/* 🛒 Cart icon */}
      <img
        src="/icons/Cart.svg"
        alt="cart"
        className={styles.cartIcon}
        onClick={handleCartClick}
      />

      {/* 🔢 Counter */}
      {basket.length > 0 && <div className={styles.badge}>{basket.length}</div>}

      {/* ⬇ Dropdown content */}
      {isOpen && (
        <div className={styles.dropdownBox}>
          {basket.length === 0 ? (
            <>
              <div>
                <p className={styles.dropdownText}>კალათა ცარიელია</p>
                <span>შესაძენად, დაამატე ნივთები კალათაში</span>
              </div>
              <img
                src="/icons/Basket.svg"
                alt="empty"
                className={styles.dropdownImage}
              />
              <button
                className={styles.dropdownButton}
                onClick={handleGoToBasket}
              >
                გადადი კალათაში
              </button>
            </>
          ) : (
            <>
              <CommerceList
                type="cart"
                items={basket}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
