"use client";

import styles from "./CartTab.module.scss";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface CartTabProps {
  showSummary?: boolean;
}

export type CartItem = {
  id: number;
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  isInStock: boolean;
  availableQuantity?: number;
  isSystem?: boolean;
  systemProducts?: {
    id: number;
    title: string;
    image?: string;
    price?: number;
    quantity: number;
  }[];
};

export default function CartTab({ showSummary = true }: CartTabProps) {
  const en = useStorefrontLocale() === "en";
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useCommerce();
  const cartItems: CartItem[] = cart.items
    .map((item) => ({
      id: item.productId,
      title: item.productName || item.productSku || (en ? `Product #${item.productId}` : `პროდუქტი #${item.productId}`),
      image: normalizeMediaUrl(item.imageUrl),
      price: item.sellingPrice,
      oldPrice: item.oldPrice,
      quantity: item.quantity,
      isInStock: item.isInStock !== false,
      availableQuantity: item.availableQuantity,
      isSystem: item.isConfigured,
      systemProducts: item.configuredParts?.map((part) => ({
        id: part.productId,
        title: part.name,
        quantity: part.quantity,
      })),
    }));

  const increase = (id: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    updateCartQuantity(id, (item?.quantity ?? 0) + 1);
  };

  const decrease = (id: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    updateCartQuantity(id, Math.max((item?.quantity ?? 1) - 1, 1));
  };

  const removeItem = (id: number) => {
    removeFromCart(id);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const hasUnavailableItems = cartItems.some(
    (item) => !item.isInStock ||
      (item.availableQuantity != null && item.quantity > item.availableQuantity)
  );

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/delivery");
  };

  return (
    <div className={styles.cartSection}>
      {cartItems.length === 0 ? (
        <h4>{en ? "My cart" : "ჩემი კალათა"}</h4>
      ) : (
        <>
          <div className={styles.titleWrapper}>
            <h4>{en ? "My cart" : "ჩემი კალათა"}</h4>
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={clearCart}
            >
              <img src="/icons/broom.svg" alt="broom" />
              {en ? "Remove all" : "ყველა წაშლა"}
            </button>
          </div>

          <div className={styles.cartList}>
            {cartItems.map((item) => (
              <div className={styles.cartCard} key={item.id}>
                <div className={styles.left}>
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.fallback) return;
                      image.dataset.fallback = "true";
                      image.src = "/icons/Logo.svg";
                    }}
                  />

                  <div className={styles.info}>
                    <p>{en ? "Code" : "კოდი"}: {item.id}</p>
                    <h5>{item.title}</h5>

                    {item.isSystem && (
                      <div className={styles.configuredParts}>
                        <strong>{en ? "Configured parts" : "შეცვლილი კონფიგურაცია"}</strong>
                        <ul>{item.systemProducts?.map((part) => <li key={part.id}>{part.title} × {part.quantity}</li>)}</ul>
                        <button type="button" onClick={() => router.push(`/prebuilt/${item.id}`)}>{en ? "Edit configuration" : "კონფიგურაციის რედაქტირება"}</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.center}>
                  <div className={styles.counter}>
                    <button type="button" onClick={() => decrease(item.id)}>
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => increase(item.id)}
                      disabled={
                        !item.isInStock ||
                        (item.availableQuantity != null && item.quantity >= item.availableQuantity)
                      }
                      aria-label={
                        item.isInStock
                          ? (en ? "Increase quantity" : "რაოდენობის გაზრდა")
                          : (en ? "Out of stock" : "მარაგში არ არის")
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.right}>
                  <div className={styles.priceBlock}>
                    <span className={styles.price}>
                      {(item.price * item.quantity).toLocaleString()} ₾
                    </span>

                    {item.oldPrice && (
                      <span className={styles.oldPrice}>
                        {(item.oldPrice * item.quantity).toLocaleString()} ₾
                      </span>
                    )}
                  </div>

                  <img
                    src="/icons/trashCan.svg"
                    alt="remove"
                    onClick={() => removeItem(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {showSummary && (
            <div className={styles.summary}>
              <div className={styles.total}>
                {en ? "Total amount" : "ჯამური თანხა"}: <strong>{total.toLocaleString()} ₾</strong>
              </div>

              <button
                className={`${styles.orderBtn} ${
                  isContinuing ? styles.loading : ""
                }`}
                onClick={handleContinue}
                disabled={isContinuing || hasUnavailableItems}
              >
                {isContinuing && <span className={styles.spinner} />}
                <span>
                  {hasUnavailableItems
                    ? (en ? "Some items are out of stock" : "ზოგი პროდუქტი მარაგში არ არის")
                    : (en ? "Proceed to checkout" : "შეკვეთის გაფორმება")}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
