"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CommerceList, { ProductItem } from "@/components/commerce/CommerceList";
import styles from "./Basket.module.scss";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";

export default function BasketPage() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { cart, updateCartQuantity, removeFromCart } = useCommerce();
  const basket: ProductItem[] = cart.items
    .filter((item) => item.productName)
    .map((item) => ({
      id: String(item.productId),
      title: item.productName,
      image: normalizeMediaUrl(item.imageUrl),
      oldPrice: item.oldPrice,
      newPrice: item.sellingPrice,
      quantity: item.quantity,
    }));

  const handleCartClick = () => {
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

  const handleGoToBasket = () => {
    setIsOpen(false);
    router.push("/basket");
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    updateCartQuantity(Number(id), newQty);
  };

  const handleRemove = (id: string) => {
    removeFromCart(Number(id));
  };

  return (
    <div className={styles.basketWrapper} ref={dropdownRef}>
      <img
        src="/icons/Cart.svg"
        alt="cart"
        className={styles.cartIcon}
        onClick={handleCartClick}
      />

      {cart.totalItems > 0 && (
        <div className={styles.badge}>{cart.totalItems}</div>
      )}

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
                onNavigate={() => setIsOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
