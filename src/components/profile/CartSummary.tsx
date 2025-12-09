"use client";

import { useState } from "react";
import styles from "./CartSummary.module.scss";
import { useRouter } from "next/navigation";
import MinimalProductItem, { ProductItem } from "./MinimalProductItem";

interface CartSummaryProps {
  showItems?: boolean;
}

export default function CartSummary({ showItems = true }: CartSummaryProps) {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<ProductItem[]>([
    {
      id: 14736,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
    {
      id: 14737,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
    {
      id: 14738,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
    {
      id: 14739,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
  ]);


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
            className={styles.button}
            onClick={handleContinue}
            style={{ marginTop: showItems ? "" : "10px" }}
          >
            ყიდვის გაგრძელება
          </button>
        )}
      </div>
    </div>
  );
}
