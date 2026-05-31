"use client";

import styles from "./CartSummary.module.scss";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MinimalProductItem, { ProductItem } from "./MinimalProductItem";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";

interface CartSummaryProps {
  showItems?: boolean;
}

export default function CartSummary({ showItems = true }: CartSummaryProps) {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);
  const { cart } = useCommerce();
  const cartItems: ProductItem[] = cart.items
    .filter((item) => item.productName)
    .map((item) => ({
      id: item.productId,
      title: item.productName,
      image: normalizeMediaUrl(item.imageUrl),
      price: item.sellingPrice,
      oldPrice: item.oldPrice,
      quantity: item.quantity,
    }));

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalOldPrice = cartItems.reduce(
    (sum, item) => (item.oldPrice ? sum + item.oldPrice * item.quantity : sum),
    0
  );
  const totalDiscount = totalOldPrice - totalPrice;

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/delivery");
  };

  return (
    <div
      className={styles.cartSection}
      style={{ height: showItems ? "451px" : "280px" }}
    >
      {showItems && (
        <div className={styles.wrapper}>
          {cartItems.map((item) => (
            <MinimalProductItem key={item.id} item={item} />
          ))}
        </div>
      )}
      <div className={styles.summaryBox}>
        <div
          className={styles.summary}
          style={{ marginTop: showItems ? "" : "0px" }}
        >
          <div className={styles.row}>
            <p>რაოდენობა</p>
            <span>{totalQuantity}x</span>
          </div>

          <div className={styles.row}>
            <p>ღირებულება</p>
            <span>{totalPrice.toLocaleString()} ₾</span>
          </div>

          <div className={styles.row}>
            <p>დანაზოგი</p>
            <span>{totalDiscount.toLocaleString()} ₾</span>
          </div>

          <div className={styles.totalRow}>
            <p>ჯამი</p>
            <span>{totalPrice.toLocaleString()} ₾</span>
          </div>
        </div>
        {!showItems && (
          <button
            className={`${styles.button} ${isContinuing ? styles.loading : ""}`}
            onClick={handleContinue}
            disabled={isContinuing}
            style={{ marginTop: showItems ? "" : "10px" }}
          >
            {isContinuing && <span className={styles.spinner} />}
            <span>ყიდვის გაგრძელება</span>
          </button>
        )}
      </div>
    </div>
  );
}
