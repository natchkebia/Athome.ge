"use client";

import styles from "./CartTab.module.scss";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";

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
  isSystem?: boolean;
  systemProducts?: {
    id: number;
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
};

export default function CartTab({ showSummary = true }: CartTabProps) {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);
  const { cart, updateCartQuantity, removeFromCart } = useCommerce();
  const cartItems: CartItem[] = cart.items
    .filter((item) => item.productName)
    .map((item) => ({
      id: item.productId,
      title: item.productName,
      image: normalizeMediaUrl(item.imageUrl),
      price: item.sellingPrice,
      oldPrice: item.oldPrice,
      quantity: item.quantity,
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

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/delivery");
  };

  return (
    <div className={styles.cartSection}>
      {cartItems.length === 0 ? (
        <h4>ჩემი კალათა</h4>
      ) : (
        <>
          <h4>ჩემი კალათა</h4>

          <div className={styles.cartList}>
            {cartItems.map((item) => (
              <div className={styles.cartCard} key={item.id}>
                <div className={styles.left}>
                  <img src={item.image} alt={item.title} />

                  <div className={styles.info}>
                    <p>კოდი: {item.id}</p>
                    <h5>{item.title}</h5>

                    {item.isSystem && (
                      <p>
                        სისტემის კომპონენტები:{" "}
                        {item.systemProducts?.length || 0}
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.center}>
                  <div className={styles.counter}>
                    <button type="button" onClick={() => decrease(item.id)}>
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button type="button" onClick={() => increase(item.id)}>
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
                ჯამური თანხა: <strong>{total.toLocaleString()} ₾</strong>
              </div>

              <button
                className={`${styles.orderBtn} ${
                  isContinuing ? styles.loading : ""
                }`}
                onClick={handleContinue}
                disabled={isContinuing}
              >
                {isContinuing && <span className={styles.spinner} />}
                <span>შეკვეთის გაფორმება</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
